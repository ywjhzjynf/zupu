import React, { useState } from 'react';
import {
  UserCheck,
  Shield,
  Download,
  Building,
  Key,
  Lock,
  Share2,
  ChevronRight,
  LogOut,
  Award,
  BookOpen,
} from 'lucide-react';
import { Family, FamilyMember, User } from '../types/genealogy';

interface ProfileViewProps {
  user: User | null;
  family: Family | null;
  members: FamilyMember[];
  boundMember: FamilyMember | null;
  onBindMember: (memberId: string) => void;
  onOpenFamilySwitch: () => void;
  onOpenInvite: () => void;
  onOpenExport: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  family,
  members,
  boundMember,
  onBindMember,
  onOpenFamilySwitch,
  onOpenInvite,
  onOpenExport,
}) => {
  return (
    <div className="space-y-4 pb-20 px-4 pt-3 max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
      {/* User Header Profile Card */}
      <div className="bg-white p-5 rounded-2xl border border-[#E8DFD1] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.nickname}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#8B5A2B]/30"
          />
          <div>
            <h2 className="font-bold text-base text-[#1A1A1A] font-serif">{user?.nickname || '微信族员'}</h2>
            <p className="text-xs text-[#8B5A2B] mt-0.5 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> 族长 / 核心修谱理事
            </p>
          </div>
        </div>
      </div>

      {/* Profile Binding Selection Box */}
      <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#D9CDB8] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold font-serif text-xs text-[#8B5A2B] flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-[#B83B26]" />
            <span>绑定我的族谱成员档案</span>
          </span>
          <span className="text-[10px] text-gray-500">绑定后高亮显示与一键寻根</span>
        </div>

        <select
          value={boundMember?.id || ''}
          onChange={(e) => onBindMember(e.target.value)}
          className="w-full text-xs px-3 py-2.5 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
        >
          <option value="">未绑定 (请在名册中选择本人)</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} (第 {m.generationNum} 世 {m.generationChar ? `· [${m.generationChar}]字辈` : ''})
            </option>
          ))}
        </select>
      </div>

      {/* Settings Action List */}
      <div className="bg-white rounded-2xl border border-[#E8DFD1] divide-y divide-gray-100 text-xs overflow-hidden shadow-xs">
        <button
          onClick={onOpenFamilySwitch}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Building className="w-4 h-4 text-[#8B5A2B]" />
            <span className="font-semibold text-[#1A1A1A]">切换 / 创建家族空间</span>
          </div>
          <div className="flex items-center gap-1 text-[#8B5A2B]">
            <span>{family?.name}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </button>

        <button
          onClick={onOpenInvite}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Share2 className="w-4 h-4 text-[#8B5A2B]" />
            <span className="font-semibold text-[#1A1A1A]">家族专属邀请码</span>
          </div>
          <div className="flex items-center gap-1 text-[#B83B26] font-mono font-bold">
            <span>{family?.inviteCode}</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </button>

        <button
          onClick={onOpenExport}
          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-[#8B5A2B]" />
            <span className="font-semibold text-[#1A1A1A]">导出宣纸风苏式/欧式 PDF & JSON 备份</span>
          </div>
          <div className="flex items-center gap-1 text-[#8B5A2B] font-semibold">
            <span>传统排印导出</span>
            <ChevronRight className="w-4 h-4 text-gray-400" />
          </div>
        </button>
      </div>

      {/* Privacy Policy Card */}
      <div className="bg-white p-4 rounded-2xl border border-[#E8DFD1] space-y-2 text-xs">
        <div className="flex items-center gap-2 font-bold text-[#8B5A2B]">
          <Lock className="w-4 h-4" />
          <span>隐私与安全保护说明</span>
        </div>
        <p className="text-[#666666] leading-relaxed text-[11px]">
          本家族修撰图谱严格遵循家内私密保护模式。手机号、详细现居地址等敏感隐私数据仅对本家族管理员内部可见，非家族成员无法通过搜索查看。
        </p>
      </div>
    </div>
  );
};
