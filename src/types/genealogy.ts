export type Gender = 'male' | 'female';

export type RelationType = 'biological' | 'adopted' | 'step' | 'guoji';

export type MarriageType = 'first_marriage' | 'remarried' | 'divorced';

export type UserRole = 'patriarch' | 'admin' | 'member' | 'guest';

export interface User {
  id: string;
  openid: string;
  nickname: string;
  avatarUrl: string;
  phone?: string;
  currentFamilyId?: string;
  boundMemberId?: string;
}

export interface Family {
  id: string;
  name: string;
  surname: string;
  hallName?: string; // 堂号
  ancestralHome?: string; // 祖籍地
  currentLocation?: string; // 现居地
  crestUrl?: string; // 族徽/图像
  summary?: string; // 简介
  creatorId: string;
  inviteCode: string;
  createdAt: string;
  memberCount?: number;
  generationCount?: number;
}

export interface GenerationOrder {
  id: string;
  familyId: string;
  generationNum: number; // 第几代
  character: string; // 字辈字
  explanation?: string;
}

export interface FamilyMember {
  id: string;
  familyId: string;
  userId?: string; // 绑定的账号
  name: string;
  usedName?: string; // 曾用名/字/号
  gender: Gender;
  generationNum: number;
  generationChar?: string;
  birthDate?: string;
  isDeceased: boolean;
  deathDate?: string;
  burialPlace?: string;
  birthPlace?: string;
  livingPlace?: string;
  occupation?: string;
  education?: string;
  biography?: string;
  avatarUrl?: string;
  privacyLevel: number; // 0: 全公开, 1: 家族内可见, 2: 仅管理员可见
  createdAt: string;
  // Dynamic fields populated for tree layout
  parents?: FamilyMember[];
  spouses?: SpouseRelationInfo[];
  children?: FamilyMember[];
  siblings?: FamilyMember[];
}

export interface ParentChildRelation {
  id: string;
  familyId: string;
  parentId: string;
  childId: string;
  relationType: RelationType;
  createdAt: string;
}

export interface SpouseRelation {
  id: string;
  familyId: string;
  memberAId: string;
  memberBId: string;
  marriageType: MarriageType;
  marriageOrder: number;
  isCurrent: boolean;
  createdAt: string;
}

export interface SpouseRelationInfo {
  member: FamilyMember;
  marriageType: MarriageType;
  marriageOrder: number;
  isCurrent: boolean;
}

export interface FamilyStory {
  id: string;
  familyId: string;
  authorId: string;
  authorName?: string;
  category: 'history' | 'motto' | 'event' | 'oral' | 'figure';
  title: string;
  content: string;
  eventYear?: string;
  coverUrl?: string;
  relatedMemberIds: string[];
  createdAt: string;
}

export interface FamilyPhoto {
  id: string;
  familyId: string;
  uploaderId: string;
  uploaderName?: string;
  photoUrl: string;
  caption?: string;
  takenYear?: string;
  location?: string;
  albumCategory: 'heritage' | 'gathering' | 'ancestor' | 'daily';
  relatedMemberIds: string[];
  createdAt: string;
}

export interface FamilyPermission {
  id: string;
  familyId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  role: UserRole;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface KinshipQueryRequest {
  familyId: string;
  fromMemberId: string;
  toMemberId: string;
}

export interface KinshipQueryResponse {
  fromName: string;
  toName: string;
  title: string;
  pathDescription: string;
  generationDiff: number;
  pathNodes: string[];
}

export interface AIChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
