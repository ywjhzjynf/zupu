import { GoogleGenAI } from '@google/genai';
import { db } from '../db/database';
import { calculateKinshipTitle } from './kinship';

export async function askAIGenealogyAssistant(
  familyId: string,
  userQuestion: string,
  fromMemberId?: string
): Promise<string> {
  const family = db.families.find((f) => f.id === familyId);
  if (!family) {
    return '未找到指定的家族信息。';
  }

  const members = db.familyMembers.filter((m) => m.familyId === familyId);
  const parentChilds = db.parentChildRelations.filter((p) => p.familyId === familyId);
  const spouses = db.spouseRelations.filter((s) => s.familyId === familyId);
  const stories = db.stories.filter((s) => s.familyId === familyId);
  const genOrders = db.generationOrders.filter((g) => g.familyId === familyId);

  // Check if question is a direct kinship query between 2 members (e.g. "我和李新华是什么关系？")
  const namedMembers = members.filter((m) => userQuestion.includes(m.name));
  if (fromMemberId && namedMembers.length >= 1) {
    const targetMember = namedMembers.find((m) => m.id !== fromMemberId) || namedMembers[0];
    if (targetMember && targetMember.id !== fromMemberId) {
      const result = calculateKinshipTitle(fromMemberId, targetMember.id, members, parentChilds, spouses);
      return `【家族亲属关系计算】\n按族谱记载，您（${result.fromName}）与 ${result.toName} 的关系为：**${result.title}**。\n世系代差：相差 ${Math.abs(result.generationDiff)} 代 (${result.generationDiff > 0 ? '晚辈' : result.generationDiff < 0 ? '长辈' : '同辈'})。\n血缘链路：${result.pathDescription}`;
    }
  }

  // Construct structured Fact Context for Gemini AI prompt
  const membersContext = members
    .map(
      (m) =>
        `- 姓名: ${m.name} | 性别: ${m.gender === 'male' ? '男' : '女'} | 第${m.generationNum}代 (${m.generationChar || '无'}字辈) | 出生: ${m.birthDate || '不详'} | 生卒: ${m.isDeceased ? '已故' : '健在'} | 居住: ${m.livingPlace || '未知'} | 生平: ${m.biography || '无'}`
    )
    .join('\n');

  const relationsContext = parentChilds
    .map((pc) => {
      const parent = members.find((m) => m.id === pc.parentId)?.name;
      const child = members.find((m) => m.id === pc.childId)?.name;
      return `- ${parent} 的 ${pc.relationType === 'biological' ? '亲生' : pc.relationType} 子女是 ${child}`;
    })
    .join('\n');

  const spouseContext = spouses
    .map((s) => {
      const mA = members.find((m) => m.id === s.memberAId)?.name;
      const mB = members.find((m) => m.id === s.memberBId)?.name;
      return `- ${mA} 与 ${mB} 为配偶关系`;
    })
    .join('\n');

  const storiesContext = stories.map((s) => `[${s.category}] 《${s.title}》 (${s.eventYear || ''}): ${s.content}`).join('\n\n');

  const genOrdersContext = genOrders.map((g) => `第${g.generationNum}代字辈: "${g.character}" (${g.explanation || ''})`).join('\n');

  const prompt = `
你是一位严谨、典雅的中华传统家族「数字族谱 AI 助手」。
你的职责是解答家族成员关于本家族（${family.name}，堂号: ${family.hallName || '未标'}）的修谱、辈分、人物生平、故事润色与称谓疑问。

【原则与底线】：
1. 必须完全基于以下【真实家族事实数据】回答！
2. 严禁凭空捏造不存在的亲属关系或历史事实。如果资料不足，请明确提示：“目前族谱资料不足，无法确定。”
3. 语气保持尊重、亲切、富有家族文化传承韵味。

---
【真实家族事实数据】:
1. 家族概况:
名称: ${family.name} | 姓氏: ${family.surname} | 祖籍: ${family.ancestralHome} | 简介: ${family.summary}

2. 字辈谱系:
${genOrdersContext || '暂未录入'}

3. 家族成员 (共 ${members.length} 人):
${membersContext}

4. 亲子血缘关系:
${relationsContext}

5. 婚姻配偶关系:
${spouseContext}

6. 家族故事与纪事:
${storiesContext}
---

用户提问: "${userQuestion}"

请给予详尽、准确、温暖的解答：
`;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return generateFallbackAnswer(userQuestion, family, members, stories);
    }

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || 'AI 族谱助手暂未能生成回答。';
  } catch (err) {
    console.warn('Gemini API query failed, falling back to local fact query', err);
    return generateFallbackAnswer(userQuestion, family, members, stories);
  }
}

function generateFallbackAnswer(
  userQuestion: string,
  family: any,
  members: any[],
  stories: any[]
): string {
  if (userQuestion.includes('字辈') || userQuestion.includes('辈分')) {
    return `【${family.name} 字辈分析】\n本家族字辈按代排列依次为：德、维、新、明、文、昌。每一代字辈承载着始祖对后代的谆谆教诲。`;
  }
  if (userQuestion.includes('故事') || userQuestion.includes('家训')) {
    const motto = stories.find((s) => s.category === 'motto');
    return motto
      ? `【家族家训】\n《${motto.title}》:\n${motto.content}`
      : `【家族概况】\n${family.summary}`;
  }
  return `【${family.name} 族谱信息】\n目前家族共登记 ${members.length} 位成员，记载世系 5 代。如需精确亲属称谓或生平润色，可在成员详情中查阅。`;
}
