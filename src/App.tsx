import React, { useState, useEffect } from 'react';
import { Header } from './components/common/Header';
import { TabBar, TabType } from './components/common/TabBar';
import { FamilySwitchModal } from './components/common/FamilySwitchModal';
import { CreateFamilyModal } from './components/common/CreateFamilyModal';
import { InviteModal } from './components/common/InviteModal';
import { MemberDetailModal } from './components/member/MemberDetailModal';
import { MemberEditModal } from './components/member/MemberEditModal';
import { StoryDetailModal } from './components/story/StoryDetailModal';
import { StoryEditModal } from './components/story/StoryEditModal';
import { PhotoDetailModal } from './components/photo/PhotoDetailModal';
import { PhotoUploadModal } from './components/photo/PhotoUploadModal';
import { AIAssistantDrawer } from './components/ai/AIAssistantDrawer';
import { ExportGenealogyModal } from './components/export/ExportGenealogyModal';
import { AIBatchEntryModal } from './components/member/AIBatchEntryModal';

import { HomeView } from './views/HomeView';
import { GenealogyView } from './views/GenealogyView';
import { DirectoryView } from './views/DirectoryView';
import { StoryView } from './views/StoryView';
import { ProfileView } from './views/ProfileView';

import { api } from './api/client';
import {
  Family,
  FamilyMember,
  FamilyPhoto,
  FamilyStory,
  GenerationOrder,
  User,
} from './types/genealogy';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [user, setUser] = useState<User | null>(null);
  const [families, setFamilies] = useState<Family[]>([]);
  const [currentFamily, setCurrentFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [generationOrders, setGenerationOrders] = useState<GenerationOrder[]>([]);
  const [stories, setStories] = useState<FamilyStory[]>([]);
  const [photos, setPhotos] = useState<FamilyPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isFamilySwitchOpen, setIsFamilySwitchOpen] = useState(false);
  const [isCreateFamilyOpen, setIsCreateFamilyOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isAIDrawerOpen, setIsAIDrawerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isAIBatchOpen, setIsAIBatchOpen] = useState(false);

  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<FamilyMember | null>(null);
  const [parentPreset, setParentPreset] = useState<FamilyMember | null>(null);
  const [spousePreset, setSpousePreset] = useState<FamilyMember | null>(null);
  const [isMemberEditOpen, setIsMemberEditOpen] = useState(false);

  const [selectedStory, setSelectedStory] = useState<FamilyStory | null>(null);
  const [isStoryEditOpen, setIsStoryEditOpen] = useState(false);

  const [selectedPhoto, setSelectedPhoto] = useState<FamilyPhoto | null>(null);
  const [isPhotoUploadOpen, setIsPhotoUploadOpen] = useState(false);

  // Initial Data Fetching
  const loadInitialData = async () => {
    try {
      const userRes = await api.getUserMe();
      setUser(userRes.user);

      const famsRes = await api.getFamilies();
      setFamilies(famsRes.families);

      const activeFamId = userRes.user.currentFamilyId || famsRes.families[0]?.id;
      if (activeFamId) {
        await loadFamilySpace(activeFamId);
      }
    } catch (err) {
      console.error('Failed to load genealogy app data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadFamilySpace = async (familyId: string) => {
    try {
      const famDetail = await api.getFamilyDetail(familyId);
      setCurrentFamily(famDetail.family);

      const [memsRes, genRes, stoRes, phoRes] = await Promise.all([
        api.getMembers(familyId),
        api.getGenerations(familyId),
        api.getStories(familyId),
        api.getPhotos(familyId),
      ]);

      setMembers(memsRes.members);
      setGenerationOrders(genRes.generationOrders);
      setStories(stoRes.stories);
      setPhotos(phoRes.photos);
    } catch (err) {
      console.error('Error loading family space details:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSelectFamily = async (familyId: string) => {
    await api.switchFamily(familyId);
    if (user) setUser({ ...user, currentFamilyId: familyId });
    await loadFamilySpace(familyId);
  };

  const handleCreateFamily = async (data: Partial<Family>) => {
    const res = await api.createFamily(data);
    const famsRes = await api.getFamilies();
    setFamilies(famsRes.families);
    await handleSelectFamily(res.family.id);
  };

  const handleJoinByCode = async (inviteCode: string) => {
    const res = await api.joinByCode(inviteCode);
    const famsRes = await api.getFamilies();
    setFamilies(famsRes.families);
    await handleSelectFamily(res.family.id);
  };

  const handleSaveMember = async (memberData: any) => {
    if (!currentFamily) return;
    if (memberData.id) {
      await api.updateMember(memberData.id, memberData);
    } else {
      await api.addMember(currentFamily.id, memberData);
    }
    await loadFamilySpace(currentFamily.id);
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!currentFamily) return;
    await api.deleteMember(memberId);
    await loadFamilySpace(currentFamily.id);
  };

  const handleBindMember = (memberId: string) => {
    if (user) {
      setUser({ ...user, boundMemberId: memberId });
    }
  };

  const handleSaveStory = async (storyData: any) => {
    if (!currentFamily) return;
    await api.addStory(currentFamily.id, storyData);
    await loadFamilySpace(currentFamily.id);
  };

  const handleSavePhoto = async (photoData: any) => {
    if (!currentFamily) return;
    await api.addPhoto(currentFamily.id, photoData);
    await loadFamilySpace(currentFamily.id);
  };

  const handleAskAI = async (question: string) => {
    if (!currentFamily) return '暂未选择家族空间';
    const res = await api.askAI(currentFamily.id, question, user?.boundMemberId);
    return res.answer;
  };

  const handleImportMembers = async (importedMembers: any[]) => {
    if (!currentFamily) return;
    for (const m of importedMembers) {
      try {
        await api.addMember(currentFamily.id, m);
      } catch (e) {
        console.warn('Import item skipped', e);
      }
    }
    await loadFamilySpace(currentFamily.id);
  };

  const boundMemberObj = members.find((m) => m.id === user?.boundMemberId) || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] paper-texture flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-[#8B5A2B] text-white flex items-center justify-center font-serif text-2xl font-bold animate-bounce mb-3 shadow-md">
          谱
        </div>
        <h1 className="font-serif text-lg font-bold text-[#1A1A1A]">数字族谱正在为您寻根集脉...</h1>
        <p className="text-xs text-[#8B5A2B] mt-1">世代传承，崇德向善</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#1A1A1A] paper-texture flex flex-col font-sans">
      {/* Top App Header */}
      <Header
        currentFamily={currentFamily}
        onOpenFamilySwitch={() => setIsFamilySwitchOpen(true)}
        onOpenInvite={() => setIsInviteOpen(true)}
        onToggleAIDrawer={() => setIsAIDrawerOpen(true)}
        boundMemberName={boundMemberObj?.name}
      />

      {/* View Router Body */}
      <main className="flex-1 w-full max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
        {activeTab === 'home' && (
          <HomeView
            family={currentFamily}
            members={members}
            stories={stories}
            photos={photos}
            boundMember={boundMemberObj}
            onNavigateTab={setActiveTab}
            onOpenAddMember={() => {
              setMemberToEdit(null);
              setParentPreset(null);
              setSpousePreset(null);
              setIsMemberEditOpen(true);
            }}
            onOpenAIBatch={() => setIsAIBatchOpen(true)}
            onSelectMember={setSelectedMember}
            onSelectStory={setSelectedStory}
            onSelectPhoto={setSelectedPhoto}
            onToggleAI={() => setIsAIDrawerOpen(true)}
          />
        )}

        {activeTab === 'tree' && (
          <GenealogyView
            members={members}
            generationOrders={generationOrders}
            boundMemberId={user?.boundMemberId}
            onSelectMember={setSelectedMember}
            onAddChild={(parent) => {
              setMemberToEdit(null);
              setParentPreset(parent);
              setSpousePreset(null);
              setIsMemberEditOpen(true);
            }}
            onAddSpouse={(spouse) => {
              setMemberToEdit(null);
              setParentPreset(null);
              setSpousePreset(spouse);
              setIsMemberEditOpen(true);
            }}
          />
        )}

        {activeTab === 'directory' && (
          <DirectoryView
            members={members}
            generationOrders={generationOrders}
            onSelectMember={setSelectedMember}
            onOpenAddMember={() => {
              setMemberToEdit(null);
              setParentPreset(null);
              setSpousePreset(null);
              setIsMemberEditOpen(true);
            }}
            onOpenAIBatch={() => setIsAIBatchOpen(true)}
          />
        )}

        {activeTab === 'stories' && (
          <StoryView
            stories={stories}
            photos={photos}
            onSelectStory={setSelectedStory}
            onSelectPhoto={setSelectedPhoto}
            onOpenAddStory={() => setIsStoryEditOpen(true)}
            onOpenUploadPhoto={() => setIsPhotoUploadOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            user={user}
            family={currentFamily}
            members={members}
            boundMember={boundMemberObj}
            onBindMember={handleBindMember}
            onOpenFamilySwitch={() => setIsFamilySwitchOpen(true)}
            onOpenInvite={() => setIsInviteOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
          />
        )}
      </main>

      {/* Bottom Mini-Program TabBar */}
      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* All Modal Overlays */}
      <FamilySwitchModal
        isOpen={isFamilySwitchOpen}
        onClose={() => setIsFamilySwitchOpen(false)}
        families={families}
        currentFamilyId={currentFamily?.id}
        onSelectFamily={handleSelectFamily}
        onOpenCreateModal={() => setIsCreateFamilyOpen(true)}
        onJoinByCode={handleJoinByCode}
      />

      <CreateFamilyModal
        isOpen={isCreateFamilyOpen}
        onClose={() => setIsCreateFamilyOpen(false)}
        onCreate={handleCreateFamily}
      />

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        family={currentFamily}
      />

      <MemberDetailModal
        isOpen={Boolean(selectedMember)}
        onClose={() => setSelectedMember(null)}
        member={selectedMember}
        onEdit={(m) => {
          setMemberToEdit(m);
          setParentPreset(null);
          setSpousePreset(null);
          setIsMemberEditOpen(true);
        }}
        onDelete={handleDeleteMember}
        onAddChild={(p) => {
          setMemberToEdit(null);
          setParentPreset(p);
          setSpousePreset(null);
          setIsMemberEditOpen(true);
        }}
        onAddSpouse={(s) => {
          setMemberToEdit(null);
          setParentPreset(null);
          setSpousePreset(s);
          setIsMemberEditOpen(true);
        }}
        onCalculateKinship={(targetId) => {
          setSelectedMember(null);
          setIsAIDrawerOpen(true);
        }}
      />

      <MemberEditModal
        isOpen={isMemberEditOpen}
        onClose={() => setIsMemberEditOpen(false)}
        memberToEdit={memberToEdit}
        parentPreset={parentPreset}
        spousePreset={spousePreset}
        familyId={currentFamily?.id || ''}
        onSave={handleSaveMember}
      />

      <StoryDetailModal
        isOpen={Boolean(selectedStory)}
        onClose={() => setSelectedStory(null)}
        story={selectedStory}
      />

      <StoryEditModal
        isOpen={isStoryEditOpen}
        onClose={() => setIsStoryEditOpen(false)}
        familyId={currentFamily?.id || ''}
        onSave={handleSaveStory}
      />

      <PhotoDetailModal
        isOpen={Boolean(selectedPhoto)}
        onClose={() => setSelectedPhoto(null)}
        photo={selectedPhoto}
      />

      <PhotoUploadModal
        isOpen={isPhotoUploadOpen}
        onClose={() => setIsPhotoUploadOpen(false)}
        familyId={currentFamily?.id || ''}
        onSave={handleSavePhoto}
      />

      <AIAssistantDrawer
        isOpen={isAIDrawerOpen}
        onClose={() => setIsAIDrawerOpen(false)}
        family={currentFamily}
        members={members}
        boundMemberId={user?.boundMemberId}
        onAskAI={handleAskAI}
      />

      <ExportGenealogyModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        family={currentFamily}
        members={members}
        generationOrders={generationOrders}
        onImportMembers={handleImportMembers}
      />

      <AIBatchEntryModal
        isOpen={isAIBatchOpen}
        onClose={() => setIsAIBatchOpen(false)}
        familyId={currentFamily?.id || ''}
        onBatchImportDone={() => loadFamilySpace(currentFamily?.id || '')}
      />
    </div>
  );
}
