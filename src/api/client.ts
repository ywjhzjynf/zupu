import {
  Family,
  FamilyMember,
  FamilyPhoto,
  FamilyStory,
  GenerationOrder,
  User,
} from '../types/genealogy';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
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
};
