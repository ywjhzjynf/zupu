import React, { useState, useMemo } from 'react';
import {
  CalendarHeart,
  Flame,
  Cake,
  ChevronRight,
  Sparkles,
  Heart,
  Clock,
  Flower2,
  Bell,
  Calendar,
} from 'lucide-react';
import { FamilyMember } from '../../types/genealogy';

interface MemorialItem {
  id: string;
  member: FamilyMember;
  type: 'birthday' | 'death_anniversary';
  dateStr: string; // e.g., '10-01'
  fullDateStr: string; // e.g., '1952-10-01'
  nextDate: Date;
  daysLeft: number;
  yearsCount: number; // e.g., 74 岁 or 48 周年
  title: string;
  isToday: boolean;
  isSoon: boolean; // within 7 days
}

interface FamilyMemorialSectionProps {
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
}

export const FamilyMemorialSection: React.FC<FamilyMemorialSectionProps> = ({
  members,
  onSelectMember,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'birthday' | 'death'>('all');
  const [blessingSentMap, setBlessingSentMap] = useState<Record<string, string>>({});

  // Calculate upcoming memorials
  const memorialList = useMemo(() => {
    const now = new Date();
    // Reset time to start of today for precise day differences
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const items: MemorialItem[] = [];

    members.forEach((m) => {
      // 1. Birthday / Birth anniversary
      if (m.birthDate) {
        const parts = m.birthDate.split(/[-/]/);
        if (parts.length >= 3) {
          const birthYear = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);

          if (!isNaN(month) && !isNaN(day)) {
            let nextDate = new Date(today.getFullYear(), month, day);
            if (nextDate.getTime() < today.getTime()) {
              // already passed this year, next occurrence is next year
              nextDate = new Date(today.getFullYear() + 1, month, day);
            }

            const diffTime = nextDate.getTime() - today.getTime();
            const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));
            const yearsCount = nextDate.getFullYear() - birthYear;

            items.push({
              id: `b_${m.id}`,
              member: m,
              type: 'birthday',
              dateStr: `${month + 1}月${day}日`,
              fullDateStr: m.birthDate,
              nextDate,
              daysLeft,
              yearsCount: isNaN(yearsCount) ? 0 : yearsCount,
              title: m.isDeceased
                ? `${m.name} 诞辰 ${yearsCount} 周年`
                : `${m.name} ${yearsCount} 岁大寿`,
              isToday: daysLeft === 0,
              isSoon: daysLeft > 0 && daysLeft <= 7,
            });
          }
        }
      }

      // 2. Death anniversary (忌日 / 忌辰)
      if (m.isDeceased && m.deathDate) {
        const parts = m.deathDate.split(/[-/]/);
        if (parts.length >= 3) {
          const deathYear = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);

          if (!isNaN(month) && !isNaN(day)) {
            let nextDate = new Date(today.getFullYear(), month, day);
            if (nextDate.getTime() < today.getTime()) {
              nextDate = new Date(today.getFullYear() + 1, month, day);
            }

            const diffTime = nextDate.getTime() - today.getTime();
            const daysLeft = Math.round(diffTime / (1000 * 60 * 60 * 24));
            const yearsCount = nextDate.getFullYear() - deathYear;

            items.push({
              id: `d_${m.id}`,
              member: m,
              type: 'death_anniversary',
              dateStr: `${month + 1}月${day}日`,
              fullDateStr: m.deathDate,
              nextDate,
              daysLeft,
              yearsCount: isNaN(yearsCount) ? 0 : yearsCount,
              title: `${m.name} 逝世 ${yearsCount} 周年忌日`,
              isToday: daysLeft === 0,
              isSoon: daysLeft > 0 && daysLeft <= 7,
            });
          }
        }
      }
    });

    // Sort by days left ascending
    items.sort((a, b) => a.daysLeft - b.daysLeft);
    return items;
  }, [members]);

  const filteredItems = useMemo(() => {
    if (filterType === 'birthday') return memorialList.filter((i) => i.type === 'birthday');
    if (filterType === 'death') return memorialList.filter((i) => i.type === 'death_anniversary');
    return memorialList;
  }, [memorialList, filterType]);

  // Count within 30 days
  const soonCount = useMemo(() => {
    return memorialList.filter((i) => i.daysLeft <= 30).length;
  }, [memorialList]);

  const handleSendBlessing = (item: MemorialItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const actionText = item.type === 'birthday' ? '已送上寿诞祝福 🌸' : '已奉茶献花缅怀 🕯️';
    setBlessingSentMap((prev) => ({
      ...prev,
      [item.id]: actionText,
    }));
  };

  return (
    <div className="bg-gradient-to-br from-white via-[#FCF9F2] to-[#FAF4EA] rounded-3xl p-5 border border-[#E8DFD1] shadow-xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#8B5A2B]/10 text-[#8B5A2B] flex items-center justify-center font-bold shadow-xs">
            <CalendarHeart className="w-5 h-5 text-[#B83B26]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold font-serif text-base text-[#1A1A1A]">家族纪念日与提醒</h2>
              {soonCount > 0 && (
                <span className="text-[10px] bg-[#B83B26]/10 text-[#B83B26] font-semibold px-2 py-0.5 rounded-full border border-[#B83B26]/20">
                  近30天内 {soonCount} 个
                </span>
              )}
            </div>
            <p className="text-[11px] text-[#8B5A2B] mt-0.5">
              敬天法祖 · 缅怀先哲 · 恭贺寿诞
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1 bg-white/80 p-1 rounded-xl border border-[#E8DFD1] text-[11px]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg transition-colors font-medium ${
              filterType === 'all'
                ? 'bg-[#8B5A2B] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilterType('birthday')}
            className={`px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 ${
              filterType === 'birthday'
                ? 'bg-[#B83B26] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Cake className="w-3 h-3" />
            <span>寿诞</span>
          </button>
          <button
            onClick={() => setFilterType('death')}
            className={`px-2.5 py-1 rounded-lg transition-colors font-medium flex items-center gap-1 ${
              filterType === 'death'
                ? 'bg-[#663F1A] text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Flame className="w-3 h-3 text-amber-500" />
            <span>忌辰</span>
          </button>
        </div>
      </div>

      {/* Memorial Cards Carousel / List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white/60 p-6 rounded-2xl border border-dashed border-[#D9CDB8] text-center text-xs text-gray-500">
          暂无录入出生或忌日日期的成员档案，可在成员编辑中补全日期。
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredItems.slice(0, 4).map((item) => {
            const isSent = Boolean(blessingSentMap[item.id]);

            return (
              <div
                key={item.id}
                onClick={() => onSelectMember(item.member)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer shadow-xs flex flex-col justify-between group relative overflow-hidden ${
                  item.isToday
                    ? 'bg-gradient-to-r from-red-50 to-amber-50 border-[#B83B26] ring-1 ring-[#B83B26]/30'
                    : item.isSoon
                    ? 'bg-white hover:border-[#8B5A2B] border-[#E8DFD1]'
                    : 'bg-white/80 hover:bg-white border-[#E8DFD1]'
                }`}
              >
                {/* Top Row: Avatar + Title & Type */}
                <div className="flex items-start gap-3">
                  <div className="relative shrink-0">
                    <img
                      src={item.member.avatarUrl}
                      alt={item.member.name}
                      className="w-11 h-11 rounded-xl object-cover border border-[#8B5A2B]/20"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] shadow-xs text-white ${
                        item.type === 'birthday' ? 'bg-amber-500' : 'bg-stone-600'
                      }`}
                    >
                      {item.type === 'birthday' ? '🎂' : '🕯️'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold font-serif text-xs text-[#1A1A1A] truncate">
                        {item.title}
                      </span>
                      {item.isToday ? (
                        <span className="text-[10px] font-bold bg-[#B83B26] text-white px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                          今天
                        </span>
                      ) : item.daysLeft <= 7 ? (
                        <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full shrink-0">
                          {item.daysLeft} 天后
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-md shrink-0">
                          {item.daysLeft} 天后
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-[#666666]">
                      <span className="flex items-center gap-1 font-medium text-[#8B5A2B]">
                        <Calendar className="w-3 h-3" />
                        {item.dateStr}
                      </span>
                      <span>·</span>
                      <span>第 {item.member.generationNum} 世</span>
                      {item.member.isDeceased ? (
                        <span className="text-[9px] bg-stone-100 text-stone-600 px-1 rounded">先祖</span>
                      ) : (
                        <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 rounded">健在</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Action and Greeting */}
                <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-gray-400">
                    {item.type === 'birthday'
                      ? item.member.isDeceased
                        ? '深切缅怀先祖诞辰'
                        : '恭祝长辈安康添寿'
                      : '追远崇德，焚香致敬'}
                  </span>

                  <button
                    onClick={(e) => handleSendBlessing(item, e)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                      isSent
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : item.type === 'birthday'
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
                    }`}
                  >
                    {isSent ? (
                      <span>{blessingSentMap[item.id]}</span>
                    ) : item.type === 'birthday' ? (
                      <>
                        <Flower2 className="w-3 h-3 text-amber-600" />
                        <span>送福寿</span>
                      </>
                    ) : (
                      <>
                        <Flame className="w-3 h-3 text-stone-600" />
                        <span>点心灯</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
