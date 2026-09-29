import React from 'react';
import {
  Users,
  GitFork,
  MapPin,
  Sparkles,
  BookOpen,
  Image as ImageIcon,
  UserPlus,
  Compass,
  Award,
  ArrowRight,
  ChevronRight,
  Wand2,
} from 'lucide-react';
import { Family, FamilyMember, FamilyPhoto, FamilyStory } from '../types/genealogy';
import { FamilyMemorialSection } from '../components/home/FamilyMemorialSection';

interface HomeViewProps {
  family: Family | null;
  members: FamilyMember[];
  stories: FamilyStory[];
  photos: FamilyPhoto[];
  boundMember: FamilyMember | null;
  onNavigateTab: (tab: 'tree' | 'directory' | 'stories' | 'profile') => void;
  onOpenAddMember: () => void;
  onOpenAIBatch: () => void;
  onSelectMember: (member: FamilyMember) => void;
  onSelectStory: (story: FamilyStory) => void;
  onSelectPhoto: (photo: FamilyPhoto) => void;
  onToggleAI: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  family,
  members,
  stories,
  photos,
  boundMember,
  onNavigateTab,
  onOpenAddMember,
  onOpenAIBatch,
  onSelectMember,
  onSelectStory,
  onSelectPhoto,
  onToggleAI,
}) => {
  if (!family) return null;

  const ancestor = members.find((m) => m.generationNum === 1);
  const totalGen = Math.max(...members.map((m) => m.generationNum), 1);
  const deceasedCount = members.filter((m) => m.isDeceased).length;

  return (
    <div className="space-y-6 pb-20 px-4 pt-3 max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
      {/* Hero Family Space Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#8B5A2B] via-[#663F1A] to-[#2C2C2C] text-white p-6 shadow-xl border border-[#D4A359]/30">
        <div className="absolute top-0 right-0 w-48 h-48 bg-radial from-[#D4A359]/20 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="seal-badge text-[#D4A359] border-[#D4A359] text-xs">
              {family.hallName || '陇西堂'}
            </div>
            <span className="text-[11px] text-white/80 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#D4A359]" /> {family.ancestralHome || '甘肃陇西'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-wide mb-2 flex items-center gap-2">
            <span>{family.name}</span>
          </h1>

          <p className="text-xs text-white/80 leading-relaxed font-serif line-clamp-2 mb-6">
            {family.summary || '修撰族谱，承前启后，万代流芳。'}
          </p>

          {/* Quick Statistics Banner */}
          <div className="grid grid-cols-3 gap-2 bg-black/25 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center">
            <div>
              <span className="text-[10px] text-white/70 block">已记录成员</span>
              <span className="text-lg font-bold font-mono text-[#D4A359]">{members.length}</span>
              <span className="text-[9px] text-white/60"> 人</span>
            </div>
            <div className="border-x border-white/10">
              <span className="text-[10px] text-white/70 block">已传承世系</span>
              <span className="text-lg font-bold font-mono text-[#D4A359]">{totalGen}</span>
              <span className="text-[9px] text-white/60"> 代</span>
            </div>
            <div>
              <span className="text-[10px] text-white/70 block">修撰完成度</span>
              <span className="text-lg font-bold font-mono text-emerald-400">92%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Entry Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigateTab('tree')}
          className="bg-white p-3.5 rounded-2xl border border-[#E8DFD1] shadow-xs hover:shadow-md transition-all flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B5A2B]/10 text-[#8B5A2B] flex items-center justify-center font-bold shrink-0">
              <GitFork className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-bold font-serif text-xs text-[#1A1A1A] block">全景族谱图</span>
              <span className="text-[10px] text-[#8B5A2B]">世系拓扑漫游</span>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#8B5A2B] group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={onOpenAIBatch}
          className="bg-gradient-to-r from-[#8B5A2B] to-[#663F1A] text-white p-3.5 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center justify-between group active:scale-98 ring-2 ring-[#D4A359]/40"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold shrink-0">
              <Wand2 className="w-4 h-4 text-amber-300" />
            </div>
            <div className="text-left">
              <span className="font-bold font-serif text-xs block text-amber-200">✨ AI 口述建谱</span>
              <span className="text-[10px] text-white/80">免打字一键生成</span>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-white/80 group-hover:translate-x-1 transition-all" />
        </button>

        <button
          onClick={onOpenAddMember}
          className="bg-white p-3.5 rounded-2xl border border-[#E8DFD1] hover:border-[#8B5A2B] shadow-xs hover:shadow-md transition-all flex items-center justify-between group active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#B83B26]/10 text-[#B83B26] flex items-center justify-center font-bold shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-bold font-serif text-xs text-[#1A1A1A] block">手动添加家人</span>
              <span className="text-[10px] text-gray-500">表单精准建档</span>
            </div>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#B83B26] group-hover:translate-x-1 transition-all" />
        </button>
      </div>

      {/* AI Assistant Quick Banner */}
      <div
        onClick={onToggleAI}
        className="bg-gradient-to-r from-[#D4A359]/20 via-[#8B5A2B]/10 to-[#B83B26]/20 p-4 rounded-2xl border border-[#D4A359]/40 shadow-xs flex items-center justify-between cursor-pointer hover:shadow-sm transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B83B26] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold font-serif text-sm text-[#1A1A1A]">AI 族谱智囊助手</h3>
            <p className="text-xs text-[#8B5A2B]">“我和李三叔是什么关系？” “查查字辈含义”</p>
          </div>
        </div>
        <span className="text-xs bg-[#8B5A2B] text-white px-3 py-1.5 rounded-xl font-medium">即刻提问</span>
      </div>

      {/* Family Memorial & Reminders Section */}
      <FamilyMemorialSection members={members} onSelectMember={onSelectMember} />

      {/* Ancestor / Core Members Highlight Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-bold font-serif text-base text-[#1A1A1A] flex items-center gap-2">
            <Award className="w-4 h-4 text-[#8B5A2B]" />
            <span>核心老祖与宗亲榜</span>
          </h2>
          <button
            onClick={() => onNavigateTab('directory')}
            className="text-xs text-[#8B5A2B] hover:underline flex items-center gap-0.5"
          >
            查看全名册 <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {members.slice(0, 4).map((member) => (
            <div
              key={member.id}
              onClick={() => onSelectMember(member)}
              className="bg-white p-3 rounded-2xl border border-[#E8DFD1] hover:border-[#8B5A2B] transition-all cursor-pointer shadow-xs text-center group"
            >
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-12 h-12 rounded-xl object-cover mx-auto mb-2 border border-[#8B5A2B]/30 group-hover:scale-105 transition-transform"
              />
              <span className="font-bold font-serif text-xs text-[#1A1A1A] block">{member.name}</span>
              <span className="text-[10px] text-[#8B5A2B] block">
                第 {member.generationNum} 世 · {member.isDeceased ? '故人' : '健在'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Stories & Photos Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Story Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="font-bold font-serif text-sm text-[#1A1A1A] flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[#8B5A2B]" />
              <span>精选家史与家训</span>
            </span>
            <button
              onClick={() => onNavigateTab('stories')}
              className="text-xs text-[#8B5A2B] hover:underline"
            >
              更多故事
            </button>
          </div>

          {stories[0] && (
            <div
              onClick={() => onSelectStory(stories[0])}
              className="cursor-pointer group hover:opacity-90 transition-opacity"
            >
              <h3 className="font-bold text-xs text-[#1A1A1A] group-hover:text-[#B83B26] transition-colors">
                {stories[0].title}
              </h3>
              <p className="text-[11px] text-[#666666] line-clamp-3 mt-1 leading-relaxed font-serif">
                {stories[0].content}
              </p>
            </div>
          )}
        </div>

        {/* Photo Card */}
        <div className="bg-white p-5 rounded-2xl border border-[#E8DFD1] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <span className="font-bold font-serif text-sm text-[#1A1A1A] flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-[#8B5A2B]" />
              <span>家族老照片相册</span>
            </span>
            <button
              onClick={() => onNavigateTab('stories')}
              className="text-xs text-[#8B5A2B] hover:underline"
            >
              查看全相册
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {photos.slice(0, 3).map((photo) => (
              <img
                key={photo.id}
                src={photo.photoUrl}
                alt={photo.caption || '照片'}
                onClick={() => onSelectPhoto(photo)}
                className="w-full h-20 rounded-xl object-cover cursor-pointer hover:opacity-90 transition-all border border-[#E8DFD1]"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
