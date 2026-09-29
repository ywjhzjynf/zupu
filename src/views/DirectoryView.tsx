import React, { useState, useMemo } from 'react';
import { Search, UserPlus, Filter, BookBookmark, MapPin, Calendar, Award, Wand2 } from 'lucide-react';
import { FamilyMember, GenerationOrder } from '../types/genealogy';

interface DirectoryViewProps {
  members: FamilyMember[];
  generationOrders: GenerationOrder[];
  onSelectMember: (member: FamilyMember) => void;
  onOpenAddMember: () => void;
  onOpenAIBatch?: () => void;
}

export const DirectoryView: React.FC<DirectoryViewProps> = ({
  members,
  generationOrders,
  onSelectMember,
  onOpenAddMember,
  onOpenAIBatch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGenTab, setActiveGenTab] = useState<number | 'all'>('all');
  const [activeGenderFilter, setActiveGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'living' | 'deceased'>('all');

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // Search text query
      const q = searchQuery.trim().toLowerCase();
      if (q) {
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesUsedName = m.usedName?.toLowerCase().includes(q);
        const matchesChar = m.generationChar?.toLowerCase().includes(q);
        const matchesBirth = m.birthDate?.includes(q);
        const matchesPlace = m.livingPlace?.toLowerCase().includes(q) || m.birthPlace?.toLowerCase().includes(q);
        if (!matchesName && !matchesUsedName && !matchesChar && !matchesBirth && !matchesPlace) {
          return false;
        }
      }

      // Generation Filter
      if (activeGenTab !== 'all' && m.generationNum !== activeGenTab) {
        return false;
      }

      // Gender Filter
      if (activeGenderFilter !== 'all' && m.gender !== activeGenderFilter) {
        return false;
      }

      // Status Filter
      if (activeStatusFilter === 'living' && m.isDeceased) return false;
      if (activeStatusFilter === 'deceased' && !m.isDeceased) return false;

      return true;
    });
  }, [members, searchQuery, activeGenTab, activeGenderFilter, activeStatusFilter]);

  const maxGen = Math.max(...members.map((m) => m.generationNum), 1);

  return (
    <div className="space-y-4 pb-20 px-4 pt-3 max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
      {/* Top Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="搜索姓名、曾用名、字辈、出生年、居住地..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2.5 rounded-2xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B] shadow-xs"
          />
        </div>

        {onOpenAIBatch && (
          <button
            onClick={onOpenAIBatch}
            className="bg-gradient-to-r from-[#8B5A2B] to-[#663F1A] text-white text-xs font-semibold px-3 py-2.5 rounded-2xl shadow-xs transition-all flex items-center gap-1 shrink-0 ring-1 ring-[#D4A359]/40"
          >
            <Wand2 className="w-3.5 h-3.5 text-amber-300" />
            <span>AI 口述建谱</span>
          </button>
        )}

        <button
          onClick={onOpenAddMember}
          className="bg-[#8B5A2B] hover:bg-[#663F1A] text-white text-xs font-semibold px-3 py-2.5 rounded-2xl shadow-xs transition-all flex items-center gap-1 shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>加成员</span>
        </button>
      </div>

      {/* Generation Order (字辈谱系) Card */}
      <div className="bg-gradient-to-r from-[#FDFBF7] to-[#F5EFE6] border border-[#D9CDB8] p-4 rounded-2xl shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold font-serif text-xs text-[#8B5A2B] flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#B83B26]" />
            <span>家族排辈序（字辈谱）</span>
          </h3>
          <span className="text-[10px] text-gray-500">根据字辈可自动判定亲疏世系</span>
        </div>

        <div className="flex gap-2 overflow-x-auto py-1">
          {Array.from({ length: maxGen }).map((_, i) => {
            const genNum = i + 1;
            const genCharObj = generationOrders.find((g) => g.generationNum === genNum);
            const isSelected = activeGenTab === genNum;
            return (
              <button
                key={genNum}
                onClick={() => setActiveGenTab(isSelected ? 'all' : genNum)}
                className={`flex-col items-center justify-center p-2 rounded-xl border min-w-[68px] shrink-0 transition-all ${
                  isSelected
                    ? 'border-[#B83B26] bg-[#B83B26] text-white shadow-xs'
                    : 'border-[#E8DFD1] bg-white text-[#1A1A1A] hover:border-[#8B5A2B]'
                }`}
              >
                <span className="text-[10px] block opacity-80">第 {genNum} 世</span>
                <span className="font-bold text-sm font-serif my-0.5 block">
                  {genCharObj ? genCharObj.character : '未录'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto py-1 text-xs">
        <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-[#E8DFD1]">
          <button
            onClick={() => setActiveGenTab('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              activeGenTab === 'all' ? 'bg-[#8B5A2B] text-white font-semibold' : 'text-gray-600'
            }`}
          >
            全部代数
          </button>
          <button
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'living' ? 'all' : 'living')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              activeStatusFilter === 'living' ? 'bg-[#8B5A2B] text-white font-semibold' : 'text-gray-600'
            }`}
          >
            仅健在
          </button>
          <button
            onClick={() => setActiveStatusFilter(activeStatusFilter === 'deceased' ? 'all' : 'deceased')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              activeStatusFilter === 'deceased' ? 'bg-[#8B5A2B] text-white font-semibold' : 'text-gray-600'
            }`}
          >
            仅已故
          </button>
        </div>

        <span className="text-[11px] text-[#8B5A2B] font-semibold shrink-0">
          符合条件：{filteredMembers.length} 人
        </span>
      </div>

      {/* Members Directory List */}
      <div className="space-y-2.5">
        {filteredMembers.map((member) => (
          <div
            key={member.id}
            onClick={() => onSelectMember(member)}
            className="bg-white p-3.5 rounded-2xl border border-[#E8DFD1] hover:border-[#8B5A2B] transition-all cursor-pointer shadow-xs flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-11 h-11 rounded-xl object-cover border border-[#8B5A2B]/30"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold font-serif text-sm text-[#1A1A1A]">{member.name}</span>
                  <span className="text-[10px] bg-[#8B5A2B]/10 text-[#8B5A2B] px-1.5 py-0.5 rounded font-medium">
                    第 {member.generationNum} 世
                  </span>
                  {member.isDeceased && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1 rounded">故</span>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-[#666666] mt-1">
                  <span>{member.livingPlace || member.birthPlace || '住址未记录'}</span>
                  <span>·</span>
                  <span>{member.occupation || '职业未记录'}</span>
                </div>
              </div>
            </div>

            <span className="text-xs text-[#8B5A2B] font-semibold">查看档案 ›</span>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="bg-white p-8 rounded-2xl border border-dashed border-[#D9CDB8] text-center text-xs text-gray-500">
            未找到匹配的家族成员。
          </div>
        )}
      </div>
    </div>
  );
};
