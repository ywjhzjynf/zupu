import {
  Family,
  FamilyMember,
  FamilyPermission,
  FamilyPhoto,
  FamilyStory,
  GenerationOrder,
  ParentChildRelation,
  SpouseRelation,
  User,
} from '../../types/genealogy';

// In-memory persistent database store with default rich seed data
class GenealogyDatabase {
  users: User[] = [];
  families: Family[] = [];
  generationOrders: GenerationOrder[] = [];
  familyMembers: FamilyMember[] = [];
  parentChildRelations: ParentChildRelation[] = [];
  spouseRelations: SpouseRelation[] = [];
  stories: FamilyStory[] = [];
  photos: FamilyPhoto[] = [];
  permissions: FamilyPermission[] = [];

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // 1. Initial User
    const defaultUser: User = {
      id: 'usr_root',
      openid: 'wx_openid_123456',
      nickname: '李明',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: '138****8888',
      currentFamilyId: 'fam_longxi_li',
      boundMemberId: 'mem_li_ming',
    };
    this.users.push(defaultUser);

    // 2. Default Family: 陇西李氏家族
    const defaultFamily: Family = {
      id: 'fam_longxi_li',
      name: '陇西李氏修撰宗族',
      surname: '李',
      hallName: '陇西堂',
      ancestralHome: '甘肃陇西 (今定西市陇西县)',
      currentLocation: '四川成都 / 广东广州 / 甘肃陇西',
      crestUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300',
      summary: '陇西李氏系中国古代著名郡望，源远流长。本支系自始祖李崇公起，文武并隆，家训“积善余庆，忠厚传家”，世出贤能。',
      creatorId: 'usr_root',
      inviteCode: 'LXLI2026',
      createdAt: '2026-01-01T00:00:00Z',
      memberCount: 12,
      generationCount: 5,
    };
    this.families.push(defaultFamily);

    // 3. Generation Order (字辈谱)
    const genOrders: GenerationOrder[] = [
      { id: 'gen_1', familyId: 'fam_longxi_li', generationNum: 1, character: '德', explanation: '厚德载物，立本崇德' },
      { id: 'gen_2', familyId: 'fam_longxi_li', generationNum: 2, character: '维', explanation: '维新开拓，继往开来' },
      { id: 'gen_3', familyId: 'fam_longxi_li', generationNum: 3, character: '新', explanation: '革故鼎新，明德惟馨' },
      { id: 'gen_4', familyId: 'fam_longxi_li', generationNum: 4, character: '明', explanation: '聪明睿智，光明磊落' },
      { id: 'gen_5', familyId: 'fam_longxi_li', generationNum: 5, character: '文', explanation: '文章华国，诗礼传家' },
      { id: 'gen_6', familyId: 'fam_longxi_li', generationNum: 6, character: '昌', explanation: '繁荣昌盛，百世流芳' },
    ];
    this.generationOrders.push(...genOrders);

    // 4. Family Members (5 generations)
    // Gen 1: 祖先李德诚 (始祖) & 配偶王氏
    const m1: FamilyMember = {
      id: 'mem_li_decheng',
      familyId: 'fam_longxi_li',
      name: '李德诚',
      usedName: '李崇之',
      gender: 'male',
      generationNum: 1,
      generationChar: '德',
      birthDate: '1895-03-12',
      isDeceased: true,
      deathDate: '1978-11-05',
      burialPlace: '甘肃省陇西县李家坟山首穴',
      birthPlace: '甘肃陇西',
      livingPlace: '甘肃陇西',
      occupation: '私塾教师 / 乡绅',
      education: '光绪年间秀才',
      biography: '德诚公一生修身齐家，设私塾教书育人，创立族规家训，为本支族谱奠基人。',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      privacyLevel: 0,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const m1_spouse: FamilyMember = {
      id: 'mem_wang_shi',
      familyId: 'fam_longxi_li',
      name: '王淑贞',
      usedName: '王大孺人',
      gender: 'female',
      generationNum: 1,
      generationChar: '德',
      birthDate: '1898-08-20',
      isDeceased: true,
      deathDate: '1982-04-15',
      burialPlace: '甘肃省陇西县李家坟山合葬',
      birthPlace: '甘肃定西',
      livingPlace: '甘肃陇西',
      occupation: '家庭持家',
      biography: '王氏秉性淑均，相夫教子，主持家政勤俭持家，深受乡里敬重。',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      privacyLevel: 0,
      createdAt: '2026-01-01T00:00:00Z',
    };

    // Gen 2: 长子李维国、次子李维民
    const m2_1: FamilyMember = {
      id: 'mem_li_weiguo',
      familyId: 'fam_longxi_li',
      name: '李维国',
      usedName: '李安平',
      gender: 'male',
      generationNum: 2,
      generationChar: '维',
      birthDate: '1922-06-08',
      isDeceased: true,
      deathDate: '2005-09-18',
      burialPlace: '成都长岭公墓',
      birthPlace: '甘肃陇西',
      livingPlace: '四川成都',
      occupation: '水利工程师',
      education: '西北工学院',
      biography: '维国公早年投身抗日救亡，后从事水利建设，参与修建都江堰水利渠系修缮。',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      privacyLevel: 0,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const m2_1_spouse: FamilyMember = {
      id: 'mem_chen_xiuying',
      familyId: 'fam_longxi_li',
      name: '陈秀英',
      gender: 'female',
      generationNum: 2,
      birthDate: '1926-11-12',
      isDeceased: true,
      deathDate: '2012-03-30',
      burialPlace: '成都长岭公墓合葬',
      birthPlace: '四川成都',
      occupation: '小学高级教师',
      avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150',
      privacyLevel: 0,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const m2_2: FamilyMember = {
      id: 'mem_li_weimin',
      familyId: 'fam_longxi_li',
      name: '李维民',
      gender: 'male',
      generationNum: 2,
      generationChar: '维',
      birthDate: '1928-02-14',
      isDeceased: true,
      deathDate: '2018-07-22',
      birthPlace: '甘肃陇西',
      livingPlace: '广东广州',
      occupation: '大学教授 / 中医学家',
      biography: '维民公悬壶济世六十载，著有《陇西中医考》，广育英才。',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      privacyLevel: 0,
      createdAt: '2026-01-01T00:00:00Z',
    };

    // Gen 3: 李新华 (维国长子)、李新民 (维国次子)、李新梅 (维民之女)
    const m3_1: FamilyMember = {
      id: 'mem_li_xinhua',
      familyId: 'fam_longxi_li',
      name: '李新华',
      gender: 'male',
      generationNum: 3,
      generationChar: '新',
      birthDate: '1952-10-01',
      isDeceased: false,
      birthPlace: '四川成都',
      livingPlace: '四川成都',
      occupation: '机械制造高工 (退休)',
      education: '四川大学机械系',
      biography: '新华公现任本族续修族谱理事会会长，热心家族事务，主持修撰数字族谱。',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      privacyLevel: 1,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const m3_1_spouse: FamilyMember = {
      id: 'mem_zhang_guizhen',
      familyId: 'fam_longxi_li',
      name: '张桂珍',
      gender: 'female',
      generationNum: 3,
      birthDate: '1955-05-18',
      isDeceased: false,
      livingPlace: '四川成都',
      occupation: '医院主治医师 (退休)',
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
      privacyLevel: 1,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const m3_2: FamilyMember = {
      id: 'mem_li_xinmin',
      familyId: 'fam_longxi_li',
      name: '李新民',
      gender: 'male',
      generationNum: 3,
      generationChar: '新',
      birthDate: '1958-04-05',
      isDeceased: false,
      livingPlace: '北京',
      occupation: '建筑设计总监',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      privacyLevel: 1,
      createdAt: '2026-01-01T00:00:00Z',
    };

    // Gen 4: 李明 (新华之子，当前绑定用户)、李明明 (新华之女)
    const m4_1: FamilyMember = {
      id: 'mem_li_ming',
      userId: 'usr_root',
      familyId: 'fam_longxi_li',
      name: '李明',
      gender: 'male',
      generationNum: 4,
      generationChar: '明',
      birthDate: '1988-09-15',
      isDeceased: false,
      birthPlace: '四川成都',
      livingPlace: '广东深圳',
      occupation: '高级软件工程师',
      education: '浙江大学计算机系',
      biography: '明公致力于数字家族技术开发，发起并搭建陇西李氏数字化云族谱平台。',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      privacyLevel: 1,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const m4_1_spouse: FamilyMember = {
      id: 'mem_lin_yue',
      familyId: 'fam_longxi_li',
      name: '林悦',
      gender: 'female',
      generationNum: 4,
      birthDate: '1990-12-03',
      isDeceased: false,
      livingPlace: '广东深圳',
      occupation: 'UI/UX 资深设计师',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      privacyLevel: 1,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const m4_2: FamilyMember = {
      id: 'mem_li_mingming',
      familyId: 'fam_longxi_li',
      name: '李明明',
      gender: 'female',
      generationNum: 4,
      generationChar: '明',
      birthDate: '1992-07-20',
      isDeceased: false,
      livingPlace: '上海',
      occupation: '金融分析师',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      privacyLevel: 1,
      createdAt: '2026-01-01T00:00:00Z',
    };

    // Gen 5: 李文彬 (李明之子)、李文熙 (李明之女)
    const m5_1: FamilyMember = {
      id: 'mem_li_wenbin',
      familyId: 'fam_longxi_li',
      name: '李文彬',
      gender: 'male',
      generationNum: 5,
      generationChar: '文',
      birthDate: '2018-05-28',
      isDeceased: false,
      livingPlace: '广东深圳',
      biography: '族谱第五代新成员，聪慧好学。',
      avatarUrl: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=150',
      privacyLevel: 1,
      createdAt: '2026-01-01T00:00:00Z',
    };

    const m5_2: FamilyMember = {
      id: 'mem_li_wenxi',
      familyId: 'fam_longxi_li',
      name: '李文熙',
      gender: 'female',
      generationNum: 5,
      generationChar: '文',
      birthDate: '2022-10-10',
      isDeceased: false,
      livingPlace: '广东深圳',
      avatarUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=150',
      privacyLevel: 1,
      createdAt: '2026-01-01T00:00:00Z',
    };

    this.familyMembers.push(
      m1,
      m1_spouse,
      m2_1,
      m2_1_spouse,
      m2_2,
      m3_1,
      m3_1_spouse,
      m3_2,
      m4_1,
      m4_1_spouse,
      m4_2,
      m5_1,
      m5_2
    );

    // 5. Parent-Child Relations
    const parentChilds: ParentChildRelation[] = [
      // Gen 1 -> Gen 2
      { id: 'pc_1', familyId: 'fam_longxi_li', parentId: 'mem_li_decheng', childId: 'mem_li_weiguo', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'pc_2', familyId: 'fam_longxi_li', parentId: 'mem_wang_shi', childId: 'mem_li_weiguo', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'pc_3', familyId: 'fam_longxi_li', parentId: 'mem_li_decheng', childId: 'mem_li_weimin', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'pc_4', familyId: 'fam_longxi_li', parentId: 'mem_wang_shi', childId: 'mem_li_weimin', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },

      // Gen 2 -> Gen 3
      { id: 'pc_5', familyId: 'fam_longxi_li', parentId: 'mem_li_weiguo', childId: 'mem_li_xinhua', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'pc_6', familyId: 'fam_longxi_li', parentId: 'mem_chen_xiuying', childId: 'mem_li_xinhua', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'pc_7', familyId: 'fam_longxi_li', parentId: 'mem_li_weiguo', childId: 'mem_li_xinmin', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'pc_8', familyId: 'fam_longxi_li', parentId: 'mem_chen_xiuying', childId: 'mem_li_xinmin', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },

      // Gen 3 -> Gen 4
      { id: 'pc_9', familyId: 'fam_longxi_li', parentId: 'mem_li_xinhua', childId: 'mem_li_ming', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'pc_10', familyId: 'fam_longxi_li', parentId: 'mem_zhang_guizhen', childId: 'mem_li_ming', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'pc_11', familyId: 'fam_longxi_li', parentId: 'mem_li_xinhua', childId: 'mem_li_mingming', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'pc_12', familyId: 'fam_longxi_li', parentId: 'mem_zhang_guizhen', childId: 'mem_li_mingming', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },

      // Gen 4 -> Gen 5
      { id: 'pc_13', familyId: 'fam_longxi_li', parentId: 'mem_li_ming', childId: 'mem_li_wenbin', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'pc_14', familyId: 'fam_longxi_li', parentId: 'mem_lin_yue', childId: 'mem_li_wenbin', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'pc_15', familyId: 'fam_longxi_li', parentId: 'mem_li_ming', childId: 'mem_li_wenxi', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'pc_16', familyId: 'fam_longxi_li', parentId: 'mem_lin_yue', childId: 'mem_li_wenxi', relationType: 'biological', createdAt: '2026-01-01T00:00:00Z' },
    ];
    this.parentChildRelations.push(...parentChilds);

    // 6. Spouse Relations
    const spouses: SpouseRelation[] = [
      { id: 'sp_1', familyId: 'fam_longxi_li', memberAId: 'mem_li_decheng', memberBId: 'mem_wang_shi', marriageType: 'first_marriage', marriageOrder: 1, isCurrent: true, createdAt: '2026-01-01T00:00:00Z' },
      { id: 'sp_2', familyId: 'fam_longxi_li', memberAId: 'mem_li_weiguo', memberBId: 'mem_chen_xiuying', marriageType: 'first_marriage', marriageOrder: 1, isCurrent: true, createdAt: '2026-01-01T00:00:00Z' },
      { id: 'sp_3', familyId: 'fam_longxi_li', memberAId: 'mem_li_xinhua', memberBId: 'mem_zhang_guizhen', marriageType: 'first_marriage', marriageOrder: 1, isCurrent: true, createdAt: '2026-01-01T00:00:00Z' },
      { id: 'sp_4', familyId: 'fam_longxi_li', memberAId: 'mem_li_ming', memberBId: 'mem_lin_yue', marriageType: 'first_marriage', marriageOrder: 1, isCurrent: true, createdAt: '2026-01-01T00:00:00Z' },
    ];
    this.spouseRelations.push(...spouses);

    // 7. Family Stories (家史、家训、口述历史)
    const stories: FamilyStory[] = [
      {
        id: 'sto_1',
        familyId: 'fam_longxi_li',
        authorId: 'usr_root',
        authorName: '李新华',
        category: 'motto',
        title: '陇西李氏《崇德传家》家训八条',
        content: '一、孝悌为本，尊祖敬宗；二、勤俭持家，戒奢戒惰；三、读书明理，修德养性；四、忠厚待人，严己宽人；五、和睦乡里，救灾扶困；六、奉公守法，清白做人；七、耕读并重，功业并举；八、继往开来，世代相传承。',
        eventYear: '1910',
        coverUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
        relatedMemberIds: ['mem_li_decheng'],
        createdAt: '2026-01-02T10:00:00Z',
      },
      {
        id: 'sto_2',
        familyId: 'fam_longxi_li',
        authorId: 'usr_root',
        authorName: '李维国',
        category: 'history',
        title: '族系西迁四川成都记略',
        content: '1948年冬，维国公随西北水利勘测队入川，随后定居成都。维国公深怀故土，每逢清明必遥祭陇西祖陇，并于1980年代复写家谱草稿，留存至今。',
        eventYear: '1948',
        coverUrl: 'https://images.unsplash.com/photo-1508807188400-530219db7007?w=600',
        relatedMemberIds: ['mem_li_weiguo', 'mem_li_xinhua'],
        createdAt: '2026-01-05T14:30:00Z',
      },
      {
        id: 'sto_3',
        familyId: 'fam_longxi_li',
        authorId: 'usr_root',
        authorName: '李明',
        category: 'oral',
        title: '口述历史：爷爷李维国关于都江堰工程的回忆',
        content: '“当时工具简陋，全凭人工推车与土法测量。但我们李家子弟恪守‘认真细致’四字，试水那日滔滔江水入渠，乡亲欢呼雀跃，这是我一生最自豪的时刻。” —— 摘自维国公1998年口述录音整理。',
        eventYear: '1955',
        coverUrl: 'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=600',
        relatedMemberIds: ['mem_li_weiguo'],
        createdAt: '2026-01-10T09:15:00Z',
      },
    ];
    this.stories.push(...stories);

    // 8. Family Photos
    const photos: FamilyPhoto[] = [
      {
        id: 'pho_1',
        familyId: 'fam_longxi_li',
        uploaderId: 'usr_root',
        uploaderName: '李新华',
        photoUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600',
        caption: '1975年成都祖居前全家合影 (德诚公与子孙辈)',
        takenYear: '1975',
        location: '四川成都',
        albumCategory: 'heritage',
        relatedMemberIds: ['mem_li_decheng', 'mem_li_weiguo', 'mem_li_xinhua'],
        createdAt: '2026-01-03T08:00:00Z',
      },
      {
        id: 'pho_2',
        familyId: 'fam_longxi_li',
        uploaderId: 'usr_root',
        uploaderName: '李明',
        photoUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
        caption: '2025年中秋节四代同堂家族大聚会',
        takenYear: '2025',
        location: '四川成都锦江',
        albumCategory: 'gathering',
        relatedMemberIds: ['mem_li_xinhua', 'mem_li_ming', 'mem_li_wenbin'],
        createdAt: '2026-01-08T16:20:00Z',
      },
      {
        id: 'pho_3',
        familyId: 'fam_longxi_li',
        uploaderId: 'usr_root',
        uploaderName: '李新华',
        photoUrl: 'https://images.unsplash.com/photo-1508807188400-530219db7007?w=600',
        caption: '甘肃陇西祖宅故居遗址',
        takenYear: '2022',
        location: '甘肃陇西',
        albumCategory: 'ancestor',
        relatedMemberIds: ['mem_li_decheng'],
        createdAt: '2026-01-12T11:00:00Z',
      },
    ];
    this.photos.push(...photos);

    // 9. Family Permissions
    const permissions: FamilyPermission[] = [
      {
        id: 'perm_1',
        familyId: 'fam_longxi_li',
        userId: 'usr_root',
        userName: '李明',
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        role: 'patriarch',
        status: 'approved',
        createdAt: '2026-01-01T00:00:00Z',
      },
    ];
    this.permissions.push(...permissions);
  }
}

export const db = new GenealogyDatabase();
