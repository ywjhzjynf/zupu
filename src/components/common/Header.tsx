import React from 'react';
import { ChevronDown, Sparkles, UserCheck, Share2 } from 'lucide-react';
import { Family } from '../../types/genealogy';

interface HeaderProps {
  currentFamily: Family | null;
  onOpenFamilySwitch: () => void;
  onOpenInvite: () => void;
  onToggleAIDrawer: () => void;
  boundMemberName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentFamily,
  onOpenFamilySwitch,
  onOpenInvite,
  onToggleAIDrawer,
  boundMemberName,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FDFBF7]/90 backdrop-blur-md border-b border-[#E8DFD1] px-4 py-3 flex items-center justify-between">
      {/* Family Switcher Badge */}
      <button
        onClick={onOpenFamilySwitch}
        className="flex items-center gap-2 text-left bg-white/80 hover:bg-white border border-[#D9CDB8] rounded-xl px-3 py-1.5 shadow-xs transition-all active:scale-98"
      >
        <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#8B5A2B]/10 border border-[#8B5A2B]/30 flex items-center justify-center font-serif text-[#8B5A2B] font-bold">
          {currentFamily ? currentFamily.surname : '氏'}
        </div>
        <div>
          <div className="flex items-center gap-1 font-semibold text-sm text-[#1A1A1A]">
            <span>{currentFamily ? currentFamily.name : '选择家族'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8B5A2B]" />
          </div>
          <div className="text-[11px] text-[#8B5A2B] flex items-center gap-1">
            <span>堂号：{currentFamily?.hallName || '未标'}</span>
            {boundMemberName && (
              <span className="bg-[#8B5A2B]/10 text-[#8B5A2B] px-1 rounded text-[10px] flex items-center gap-0.5">
                <UserCheck className="w-2.5 h-2.5" /> {boundMemberName}
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Right Action Icons */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenInvite}
          className="p-2 text-[#8B5A2B] hover:bg-[#8B5A2B]/10 rounded-full transition-colors flex items-center gap-1 text-xs font-medium"
          title="邀请家人"
        >
          <Share2 className="w-4 h-4" />
          <span className="hidden sm:inline">邀请</span>
        </button>

        <button
          onClick={onToggleAIDrawer}
          className="flex items-center gap-1.5 bg-gradient-to-r from-[#8B5A2B] to-[#B83B26] text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-sm hover:opacity-95 active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>AI 族谱助手</span>
        </button>
      </div>
    </header>
  );
};
