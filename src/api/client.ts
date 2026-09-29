import {
  Family,
  FamilyMember,
  FamilyPhoto,
  FamilyStory,
  GenerationOrder,
  User,
} from '../types/genealogy';

// Token Cache Helper
export function getStoredToken(): string | null {
  try {
    if (typeof (window as any).wx !== 'undefined' && (window as any).wx.getStorageSync) {
      return (window as any).wx.getStorageSync('token');
    }
  } catch (e) {}
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

export function saveStoredToken(token: string) {
  try {
    if (typeof (window as any).wx !== 'undefined' && (window as any).wx.setStorageSync) {
      (window as any).wx.setStorageSync('token', token);
    }
  } catch (e) {}
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('token', token);
  }
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options?.headers as Record<string, string>),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || '网络请求错误');
  }
  return data;
}

export const api = {
  // User
  getUserMe: () => fetchJson<{ success: boolean; user: User }>('/api/user/me'),
  switchFamily: (familyId: string) =>
    fetchJson<{ success: boolean; currentFamilyId: string }>('/api/user/switch-family', {
      method: 'POST',
      body: JSON.stringify({ familyId }),
    }),

  // Families
  getFamilies: () => fetchJson<{ success: boolean; families: Family[] }>('/api/families'),
  getFamilyDetail: (id: string) => fetchJson<{ success: boolean; family: Family }>(`/api/families/${id}`),
  createFamily: (data: Partial<Family>) =>
    fetchJson<{ success: boolean; family: Family }>('/api/families', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  joinByCode: (inviteCode: string) =>
    fetchJson<{ success: boolean; family: Family }>('/api/families/join-by-code', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    }),

  // Generations
  getGenerations: (familyId: string) =>
    fetchJson<{ success: boolean; generationOrders: GenerationOrder[] }>(`/api/families/${familyId}/generations`),
  addGeneration: (familyId: string, data: { generationNum: number; character: string; explanation?: string }) =>
    fetchJson<{ success: boolean; generationOrder: GenerationOrder }>(`/api/families/${familyId}/generations`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Members
  getMembers: (familyId: string) =>
    fetchJson<{ success: boolean; members: FamilyMember[] }>(`/api/families/${familyId}/members`),
  addMember: (familyId: string, data: any) =>
    fetchJson<{ success: boolean; member: FamilyMember }>(`/api/families/${familyId}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateMember: (memberId: string, data: Partial<FamilyMember>) =>
    fetchJson<{ success: boolean; member: FamilyMember }>(`/api/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteMember: (memberId: string) =>
    fetchJson<{ success: boolean; message: string }>(`/api/members/${memberId}`, {
      method: 'DELETE',
    }),

  // Relations
  addParentChildRelation: (familyId: string, parentId: string, childId: string, relationType = 'biological') =>
    fetchJson<{ success: boolean; relation: any }>('/api/relations/parent-child', {
      method: 'POST',
      body: JSON.stringify({ familyId, parentId, childId, relationType }),
    }),
  addSpouseRelation: (familyId: string, memberAId: string, memberBId: string, marriageType = 'first_marriage') =>
    fetchJson<{ success: boolean; relation: any }>('/api/relations/spouse', {
      method: 'POST',
      body: JSON.stringify({ familyId, memberAId, memberBId, marriageType }),
    }),

  // Kinship
  calculateKinship: (familyId: string, fromMemberId: string, toMemberId: string) =>
    fetchJson<{ success: boolean; result: any }>('/api/kinship/query', {
      method: 'POST',
      body: JSON.stringify({ familyId, fromMemberId, toMemberId }),
    }),

  // Stories & Photos
  getStories: (familyId: string) =>
    fetchJson<{ success: boolean; stories: FamilyStory[] }>(`/api/families/${familyId}/stories`),
  addStory: (familyId: string, data: any) =>
    fetchJson<{ success: boolean; story: FamilyStory }>(`/api/families/${familyId}/stories`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getPhotos: (familyId: string) =>
    fetchJson<{ success: boolean; photos: FamilyPhoto[] }>(`/api/families/${familyId}/photos`),
  addPhoto: (familyId: string, data: any) =>
    fetchJson<{ success: boolean; photo: FamilyPhoto }>(`/api/families/${familyId}/photos`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // AI Assistant & Smart Parsing
  askAI: (familyId: string, question: string, fromMemberId?: string) =>
    fetchJson<{ success: boolean; answer: string }>('/api/ai/ask', {
      method: 'POST',
      body: JSON.stringify({ familyId, question, fromMemberId }),
    }),
  parseAIText: (text: string) =>
    fetchJson<{ success: boolean; members: any[] }>('/api/ai/parse-text', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),
  uploadImage: (imageBase64: string) =>
    fetchJson<{ success: boolean; url: string }>('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ imageBase64 }),
    }),
  parseAIPhoto: (imageBase64: string) =>
    fetchJson<{ success: boolean; text: string; members: any[] }>('/api/ai/parse-photo', {
      method: 'POST',
      body: JSON.stringify({ imageBase64 }),
    }),
  // WeChat Real Authentication
  wechatLogin: (code: string) =>
    fetchJson<{ success: boolean; token: string; openid: string; user: User }>('/api/wechat/login', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),
  wechatGetPhone: (code: string, openid?: string) =>
    fetchJson<{ success: boolean; phone: string; user: User }>('/api/wechat/get-phone', {
      method: 'POST',
      body: JSON.stringify({ code, openid }),
    }),
};
