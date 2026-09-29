import { Router, Request, Response } from 'express';
import { db } from '../db/database';
import { calculateKinshipTitle } from '../services/kinship';
import { askAIGenealogyAssistant, parseAIGenealogyText, parseAIGenealogyPhoto } from '../services/aiGenealogy';
import { FamilyMember, ParentChildRelation, SpouseRelation } from '../../types/genealogy';

export const apiRouter = Router();

function getWeChatConfig() {
  const appId = process.env.WECHAT_APP_ID;
  const appSecret = process.env.WECHAT_APP_SECRET;

  if (
    !appId ||
    !appSecret ||
    appId.includes('YOUR_') ||
    appSecret.includes('YOUR_') ||
    appId.trim() === '' ||
    appSecret.trim() === ''
  ) {
    return null;
  }
  return { appId: appId.trim(), appSecret: appSecret.trim() };
}

// 1. User & Current Family Auth Context
apiRouter.get('/user/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const foundUser = db.users.find((u: any) => u.token === token || token.includes(u.id));
    if (foundUser) {
      res.json({ success: true, user: foundUser });
      return;
    }
  }

  const user = db.users[0] || {
    id: 'usr_root',
    openid: 'wx_12345',
    nickname: '李明',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    currentFamilyId: 'fam_longxi_li',
    boundMemberId: 'mem_li_ming',
  };
  res.json({ success: true, user });
});

// Real WeChat Silent Login Endpoint
apiRouter.post('/wechat/login', async (req: Request, res: Response) => {
  try {
    const config = getWeChatConfig();
    if (!config) {
      res.status(400).json({
        success: false,
        code: 'WECHAT_CONFIG_MISSING',
        message: '未配置真实微信小程序 AppID 与 AppSecret，请在后端 .env 中配置 WECHAT_APP_ID 与 WECHAT_APP_SECRET',
      });
      return;
    }

    const { code } = req.body;
    if (!code) {
      res.status(400).json({ success: false, message: '缺少微信 wx.login 返回的 code 凭证' });
      return;
    }

    // Call official WeChat API: sns/jscode2session
    const wxUrl = `https://api.weixin.qq.com/sns/jscode2session?appid=${encodeURIComponent(config.appId)}&secret=${encodeURIComponent(config.appSecret)}&js_code=${encodeURIComponent(code)}&grant_type=authorization_code`;
    const wxRes = await fetch(wxUrl);
    const wxData = await wxRes.json();

    if (wxData.errcode && wxData.errcode !== 0) {
      res.status(400).json({
        success: false,
        code: `WECHAT_API_ERROR_${wxData.errcode}`,
        message: `微信接口换取 Session 失败: [${wxData.errcode}] ${wxData.errmsg || 'code无效或与AppID/Secret不匹配'}`,
      });
      return;
    }

    const { openid, session_key, unionid } = wxData;

    let user = db.users.find((u) => u.openid === openid);
    if (!user) {
      user = {
        id: `usr_wx_${Date.now()}`,
        openid,
        unionid,
        nickname: `微信宗亲_${openid.slice(-4)}`,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        currentFamilyId: db.families[0]?.id || 'fam_longxi_li',
      };
      db.users.push(user);
    }

    const token = `wx_jwt_${user.id}_${Date.now()}`;
    (user as any).sessionKey = session_key;
    (user as any).token = token;

    res.json({
      success: true,
      token,
      openid,
      user,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: `后端微信静默登录处理异常: ${err.message}` });
  }
});

// Real WeChat Phone Authorization Endpoint
apiRouter.post('/wechat/get-phone', async (req: Request, res: Response) => {
  try {
    const config = getWeChatConfig();
    if (!config) {
      res.status(400).json({
        success: false,
        code: 'WECHAT_CONFIG_MISSING',
        message: '未配置真实微信小程序 AppID 与 AppSecret，请在后端 .env 中配置 WECHAT_APP_ID 与 WECHAT_APP_SECRET',
      });
      return;
    }

    const { code, openid } = req.body;
    if (!code) {
      res.status(400).json({ success: false, message: '缺少 getPhoneNumber 返回的手机号授权 code' });
      return;
    }

    // Step 1: Get Access Token
    const tokenUrl = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${encodeURIComponent(config.appId)}&secret=${encodeURIComponent(config.appSecret)}`;
    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.errcode && tokenData.errcode !== 0) {
      res.status(400).json({
        success: false,
        message: `获取微信 Access Token 失败: [${tokenData.errcode}] ${tokenData.errmsg}`,
      });
      return;
    }

    const accessToken = tokenData.access_token;

    // Step 2: Call wxa/business/getuserphonenumber
    const phoneUrl = `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`;
    const phoneRes = await fetch(phoneUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const phoneData = await phoneRes.json();

    if (phoneData.errcode && phoneData.errcode !== 0) {
      res.status(400).json({
        success: false,
        message: `微信解密真实手机号失败: [${phoneData.errcode}] ${phoneData.errmsg || '授权 code 已过期或失效'}`,
      });
      return;
    }

    const realPhoneNumber = phoneData.phone_info?.phoneNumber || phoneData.phone_info?.purePhoneNumber;

    if (!realPhoneNumber) {
      res.status(400).json({ success: false, message: '微信未能返回有效的手机号码' });
      return;
    }

    let user = openid ? db.users.find((u) => u.openid === openid) : db.users[0];
    if (user) {
      user.phone = realPhoneNumber;
    } else {
      user = {
        id: `usr_wx_${Date.now()}`,
        nickname: `手机用户_${realPhoneNumber.slice(-4)}`,
        phone: realPhoneNumber,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        currentFamilyId: db.families[0]?.id || 'fam_longxi_li',
      };
      db.users.push(user);
    }

    res.json({
      success: true,
      phone: realPhoneNumber,
      user,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: `后端微信手机号解密异常: ${err.message}` });
  }
});

apiRouter.post('/user/switch-family', (req: Request, res: Response) => {
  const { familyId } = req.body;
  if (db.users[0]) {
    db.users[0].currentFamilyId = familyId;
    const bound = db.familyMembers.find((m) => m.familyId === familyId && m.userId === db.users[0].id);
    db.users[0].boundMemberId = bound ? bound.id : undefined;
  }
  res.json({ success: true, currentFamilyId: familyId });
});

// 2. Family Endpoints
apiRouter.get('/families', (req: Request, res: Response) => {
  res.json({ success: true, families: db.families });
});

apiRouter.get('/families/:id', (req: Request, res: Response) => {
  const family = db.families.find((f) => f.id === req.params.id);
  if (!family) {
    res.status(404).json({ success: false, message: '家族空间不存在' });
    return;
  }
  const members = db.familyMembers.filter((m) => m.familyId === family.id);
  const genSet = new Set(members.map((m) => m.generationNum));
  const result = {
    ...family,
    memberCount: members.length,
    generationCount: genSet.size,
  };
  res.json({ success: true, family: result });
});

apiRouter.post('/families', (req: Request, res: Response) => {
  const { name, surname, hallName, ancestralHome, currentLocation, summary, crestUrl } = req.body;
  const newFamily = {
    id: `fam_${Date.now()}`,
    name: name || `${surname}氏家族`,
    surname: surname || '张',
    hallName: hallName || '清河堂',
    ancestralHome: ancestralHome || '河北清河',
    currentLocation: currentLocation || '中国',
    summary: summary || '传承家风，崇德向善。',
    crestUrl: crestUrl || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300',
    creatorId: db.users[0]?.id || 'usr_root',
    inviteCode: `${surname.toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    memberCount: 1,
    generationCount: 1,
  };
  db.families.push(newFamily);

  // Automatically add始祖 member
  const ancestorMember: FamilyMember = {
    id: `mem_${Date.now()}`,
    familyId: newFamily.id,
    name: `${surname}氏始祖`,
    gender: 'male',
    generationNum: 1,
    generationChar: '第一代',
    isDeceased: true,
    privacyLevel: 0,
    createdAt: new Date().toISOString(),
  };
  db.familyMembers.push(ancestorMember);

  if (db.users[0]) {
    db.users[0].currentFamilyId = newFamily.id;
  }

  res.json({ success: true, family: newFamily });
});

apiRouter.post('/families/join-by-code', (req: Request, res: Response) => {
  const { inviteCode } = req.body;
  const target = db.families.find((f) => f.inviteCode === inviteCode?.trim()?.toUpperCase());
  if (!target) {
    res.status(404).json({ success: false, message: '无效的家族邀请码' });
    return;
  }
  if (db.users[0]) {
    db.users[0].currentFamilyId = target.id;
  }
  res.json({ success: true, family: target });
});

// 3. Generation Orders
apiRouter.get('/families/:id/generations', (req: Request, res: Response) => {
  const orders = db.generationOrders
    .filter((g) => g.familyId === req.params.id)
    .sort((a, b) => a.generationNum - b.generationNum);
  res.json({ success: true, generationOrders: orders });
});

apiRouter.post('/families/:id/generations', (req: Request, res: Response) => {
  const { generationNum, character, explanation } = req.body;
  const newOrder = {
    id: `gen_${Date.now()}`,
    familyId: req.params.id,
    generationNum: Number(generationNum),
    character,
    explanation,
  };
  db.generationOrders.push(newOrder);
  res.json({ success: true, generationOrder: newOrder });
});

// 4. Family Members Endpoints
apiRouter.get('/families/:id/members', (req: Request, res: Response) => {
  const familyId = req.params.id;
  const members = db.familyMembers.filter((m) => m.familyId === familyId);
  const parentChilds = db.parentChildRelations.filter((p) => p.familyId === familyId);
  const spouses = db.spouseRelations.filter((s) => s.familyId === familyId);

  // Attach relational references to member objects for convenient tree mapping
  const memberMap = new Map<string, FamilyMember>(members.map((m) => [m.id, { ...m }]));

  members.forEach((m) => {
    const enriched = memberMap.get(m.id)!;

    // Parents
    const parentIds = parentChilds.filter((pc) => pc.childId === m.id).map((pc) => pc.parentId);
    enriched.parents = parentIds.map((pid) => memberMap.get(pid)!).filter(Boolean);

    // Children
    const childIds = parentChilds.filter((pc) => pc.parentId === m.id).map((pc) => pc.childId);
    enriched.children = childIds.map((cid) => memberMap.get(cid)!).filter(Boolean);

    // Spouses
    const spouseList = spouses
      .filter((s) => s.memberAId === m.id || s.memberBId === m.id)
      .map((s) => {
        const spouseId = s.memberAId === m.id ? s.memberBId : s.memberAId;
        const spouseObj = memberMap.get(spouseId);
        return spouseObj
          ? {
              member: spouseObj,
              marriageType: s.marriageType,
              marriageOrder: s.marriageOrder,
              isCurrent: s.isCurrent,
            }
          : null;
      })
      .filter(Boolean) as any[];

    enriched.spouses = spouseList;

    // Siblings
    if (parentIds.length > 0) {
      const siblingIds = parentChilds
        .filter((pc) => parentIds.includes(pc.parentId) && pc.childId !== m.id)
        .map((pc) => pc.childId);
      enriched.siblings = Array.from(new Set(siblingIds))
        .map((sid) => memberMap.get(sid)!)
        .filter(Boolean);
    } else {
      enriched.siblings = [];
    }
  });

  res.json({ success: true, members: Array.from(memberMap.values()) });
});

apiRouter.post('/families/:id/members', (req: Request, res: Response) => {
  const familyId = req.params.id;
  let {
    name,
    usedName,
    gender,
    generationNum,
    generationChar,
    birthDate,
    isDeceased,
    deathDate,
    burialPlace,
    birthPlace,
    livingPlace,
    occupation,
    education,
    biography,
    avatarUrl,
    privacyLevel,
    parentId, // Optional parent ID
    spouseId, // Optional spouse ID
    parentName, // Optional parent Name for auto-linking
    spouseName, // Optional spouse Name for auto-linking
  } = req.body;

  // 1. Check for Duplicate Member in same family (Auto Deduplication & Merge)
  const existingMember = db.familyMembers.find(
    (m) => m.familyId === familyId && m.name === name?.trim()
  );

  if (existingMember) {
    // Enrich existing member profile rather than creating duplicate
    existingMember.biography =
      existingMember.biography + (biography ? `\n[补充记载] ${biography}` : '');
    if (birthDate && !existingMember.birthDate) existingMember.birthDate = birthDate;
    if (deathDate && !existingMember.deathDate) existingMember.deathDate = deathDate;
    if (livingPlace && !existingMember.livingPlace) existingMember.livingPlace = livingPlace;
    if (occupation && !existingMember.occupation) existingMember.occupation = occupation;

    res.json({ success: true, member: existingMember, merged: true });
    return;
  }

  // 2. Auto match generation number and character from Family Generation Orders
  const genOrders = db.generationOrders.filter((g) => g.familyId === familyId);
  if ((!generationNum || Number(generationNum) === 1) && name) {
    for (const go of genOrders) {
      if (name.includes(go.character)) {
        generationNum = go.generationNum;
        generationChar = go.character;
        break;
      }
    }
  }

  // 3. Create New Member
  const newMember: FamilyMember = {
    id: `mem_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    familyId,
    name: name?.trim() || '新宗亲',
    usedName,
    gender: gender || 'male',
    generationNum: Number(generationNum) || 3,
    generationChar: generationChar || '',
    birthDate,
    isDeceased: Boolean(isDeceased),
    deathDate,
    burialPlace,
    birthPlace,
    livingPlace,
    occupation,
    education,
    biography,
    avatarUrl:
      avatarUrl ||
      (gender === 'female'
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
    privacyLevel: Number(privacyLevel) || 1,
    createdAt: new Date().toISOString(),
  };

  db.familyMembers.push(newMember);

  // 4. Auto-Link Parent Relation by ID or Name
  let finalParentId = parentId;
  if (!finalParentId && parentName) {
    const parentMatch = db.familyMembers.find(
      (m) => m.familyId === familyId && m.name === parentName.trim()
    );
    if (parentMatch) {
      finalParentId = parentMatch.id;
    }
  }

  if (finalParentId) {
    const pcRelation: ParentChildRelation = {
      id: `pc_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      familyId,
      parentId: finalParentId,
      childId: newMember.id,
      relationType: 'biological',
      createdAt: new Date().toISOString(),
    };
    db.parentChildRelations.push(pcRelation);
  }

  // 5. Auto-Link Spouse Relation by ID or Name
  let finalSpouseId = spouseId;
  if (!finalSpouseId && spouseName) {
    const spouseMatch = db.familyMembers.find(
      (m) => m.familyId === familyId && m.name === spouseName.trim()
    );
    if (spouseMatch) {
      finalSpouseId = spouseMatch.id;
    }
  }

  if (finalSpouseId) {
    const spRelation: SpouseRelation = {
      id: `sp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      familyId,
      memberAId: finalSpouseId,
      memberBId: newMember.id,
      marriageType: 'first_marriage',
      marriageOrder: 1,
      isCurrent: true,
      createdAt: new Date().toISOString(),
    };
    db.spouseRelations.push(spRelation);
  }

  res.json({ success: true, member: newMember });
});

apiRouter.put('/members/:id', (req: Request, res: Response) => {
  const memberId = req.params.id;
  const idx = db.familyMembers.findIndex((m) => m.id === memberId);
  if (idx === -1) {
    res.status(404).json({ success: false, message: '成员不存在' });
    return;
  }

  db.familyMembers[idx] = {
    ...db.familyMembers[idx],
    ...req.body,
  };

  res.json({ success: true, member: db.familyMembers[idx] });
});

apiRouter.delete('/members/:id', (req: Request, res: Response) => {
  const memberId = req.params.id;
  db.familyMembers = db.familyMembers.filter((m) => m.id !== memberId);
  db.parentChildRelations = db.parentChildRelations.filter((pc) => pc.parentId !== memberId && pc.childId !== memberId);
  db.spouseRelations = db.spouseRelations.filter((sp) => sp.memberAId !== memberId && sp.memberBId !== memberId);
  res.json({ success: true, message: '成功删除成员及相关关系' });
});

// 5. Relations Endpoints
apiRouter.post('/relations/parent-child', (req: Request, res: Response) => {
  const { familyId, parentId, childId, relationType } = req.body;
  const exists = db.parentChildRelations.some((pc) => pc.parentId === parentId && pc.childId === childId);
  if (exists) {
    res.status(400).json({ success: false, message: '该亲子关系已存在' });
    return;
  }
  const rel: ParentChildRelation = {
    id: `pc_${Date.now()}`,
    familyId,
    parentId,
    childId,
    relationType: relationType || 'biological',
    createdAt: new Date().toISOString(),
  };
  db.parentChildRelations.push(rel);
  res.json({ success: true, relation: rel });
});

apiRouter.post('/relations/spouse', (req: Request, res: Response) => {
  const { familyId, memberAId, memberBId, marriageType } = req.body;
  const rel: SpouseRelation = {
    id: `sp_${Date.now()}`,
    familyId,
    memberAId,
    memberBId,
    marriageType: marriageType || 'first_marriage',
    marriageOrder: 1,
    isCurrent: true,
    createdAt: new Date().toISOString(),
  };
  db.spouseRelations.push(rel);
  res.json({ success: true, relation: rel });
});

// 6. Kinship Calculation Endpoint
apiRouter.post('/kinship/query', (req: Request, res: Response) => {
  const { familyId, fromMemberId, toMemberId } = req.body;
  const members = db.familyMembers.filter((m) => m.familyId === familyId);
  const pc = db.parentChildRelations.filter((p) => p.familyId === familyId);
  const sp = db.spouseRelations.filter((s) => s.familyId === familyId);

  const result = calculateKinshipTitle(fromMemberId, toMemberId, members, pc, sp);
  res.json({ success: true, result });
});

// 7. Stories Endpoints
apiRouter.get('/families/:id/stories', (req: Request, res: Response) => {
  const stories = db.stories.filter((s) => s.familyId === req.params.id);
  res.json({ success: true, stories });
});

apiRouter.post('/families/:id/stories', (req: Request, res: Response) => {
  const { title, category, content, eventYear, coverUrl, relatedMemberIds } = req.body;
  const story = {
    id: `sto_${Date.now()}`,
    familyId: req.params.id,
    authorId: db.users[0]?.id || 'usr_root',
    authorName: db.users[0]?.nickname || '修谱编辑',
    category: category || 'history',
    title,
    content,
    eventYear,
    coverUrl: coverUrl || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
    relatedMemberIds: Array.isArray(relatedMemberIds) ? relatedMemberIds : [],
    createdAt: new Date().toISOString(),
  };
  db.stories.push(story);
  res.json({ success: true, story });
});

// 8. Photos Endpoints
apiRouter.get('/families/:id/photos', (req: Request, res: Response) => {
  const photos = db.photos.filter((p) => p.familyId === req.params.id);
  res.json({ success: true, photos });
});

apiRouter.post('/families/:id/photos', (req: Request, res: Response) => {
  const { photoUrl, caption, takenYear, location, albumCategory, relatedMemberIds } = req.body;
  const photo = {
    id: `pho_${Date.now()}`,
    familyId: req.params.id,
    uploaderId: db.users[0]?.id || 'usr_root',
    uploaderName: db.users[0]?.nickname || '族员',
    photoUrl,
    caption,
    takenYear,
    location,
    albumCategory: albumCategory || 'daily',
    relatedMemberIds: Array.isArray(relatedMemberIds) ? relatedMemberIds : [],
    createdAt: new Date().toISOString(),
  };
  db.photos.push(photo);
  res.json({ success: true, photo });
});

// 9. AI Assistant Query Endpoint
apiRouter.post('/ai/ask', async (req: Request, res: Response) => {
  try {
    const { familyId, question, fromMemberId } = req.body;
    const answer = await askAIGenealogyAssistant(familyId, question, fromMemberId);
    res.json({ success: true, answer });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'AI 助手服务暂时不可用' });
  }
});

// 10. AI Smart Text Parsing Endpoint
apiRouter.post('/ai/parse-text', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const members = await parseAIGenealogyText(text || '');
    res.json({ success: true, members });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'AI 解析失败' });
  }
});

// 11. Image Upload Endpoint (Handles base64/data URLs)
apiRouter.post('/upload', (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      res.status(400).json({ success: false, message: '无效的图片数据' });
      return;
    }
    // Return data URL directly or hosted resource URL
    res.json({ success: true, url: imageBase64 });
  } catch (err: any) {
    res.status(500).json({ success: false, message: '图片上传处理失败' });
  }
});

// 12. AI Photo Multimodal OCR Endpoint
apiRouter.post('/ai/parse-photo', async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      res.status(400).json({ success: false, message: '请选择要识别的族谱/老照片文件' });
      return;
    }
    const result = await parseAIGenealogyPhoto(imageBase64);
    res.json({ success: true, text: result.text, members: result.members });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || '图片 OCR 识谱失败' });
  }
});
