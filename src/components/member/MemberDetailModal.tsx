import React, { useState } from 'react';
import {
  X,
  User,
  Heart,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Briefcase,
  GraduationCap,
  Calendar,
  Sparkles,
  GitCommit,
  UserCheck,
} from 'lucide-react';
import { FamilyMember } from '../../types/genealogy';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: FamilyMember | null;
  currentUserId?: string;
  onEdit: (member: FamilyMember) => void;
  onDelete: (memberId: string) => void;
  onAddChild: (parent: FamilyMember) => void;
  onAddSpouse: (member: FamilyMember) => void;
  onCalculateKinship: (targetMemberId: string) => void;
}

export const MemberDetailModal: React.FC<MemberDetailModalProps> = ({
  isOpen,
  onClose,
  member,
  onEdit,
  onDelete,
  onAddChild,
  onAddSpouse,
  onCalculateKinship,
}) => {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-lg w-full border border-[#D9CDB8] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header Hero */}
        <div className="bg-gradient-to-r from-[#8B5A2B] to-[#663F1A] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full bg-black/20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={member.avatarUrl}
              alt={member.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-white/80 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-serif">{member.name}</h2>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-sans">
                  第 {member.generationNum} 世
                </span>
                {member.isDeceased && (
                  <span className="text-xs bg-black/40 px-2 py-0.5 rounded-full font-sans">已故</span>
                )}
              </div>
              <p className="text-xs text-white/80 mt-1">
                字辈：{member.generationChar || '无'} {member.usedName ? `· 曾用名/字号：${member.usedName}` : ''}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-[#1A1A1A]">
          {/* Quick Kinship Query Banner */}
          <button
            onClick={() => onCalculateKinship(member.id)}
            className="w-full bg-[#D4A359]/15 border border-[#D4A359]/40 hover:bg-[#D4A359]/25 text-[#8B5A2B] rounded-xl p-3 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-2 font-semibold">
              <Sparkles className="w-4 h-4 text-[#B83B26]" />
              <span>推算与我的亲属关系 / 称谓</span>
            </div>
            <span className="text-[10px] bg-[#8B5A2B] text-white px-2 py-0.5 rounded-md">AI称谓分析</span>
          </button>

          {/* Key Attributes */}
          <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-[#E8DFD1]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#8B5A2B]" />
              <div>
                <span className="text-gray-400 block text-[10px]">出生日期</span>
                <span className="font-medium">{member.birthDate || '未录入'}</span>
              </div>
            </div>

            {member.isDeceased && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <span className="text-gray-400 block text-[10px]">享年卒日</span>
                  <span className="font-medium">{member.deathDate || '未知'}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#8B5A2B]" />
              <div>
                <span className="text-gray-400 block text-[10px]">籍贯 / 现居</span>
                <span className="font-medium">{member.livingPlace || member.birthPlace || '未记载'}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#8B5A2B]" />
              <div>
                <span className="text-gray-400 block text-[10px]">职业功名</span>
                <span className="font-medium">{member.occupation || '未记载'}</span>
              </div>
            </div>
          </div>

          {/* Direct Relatives List */}
          <div className="space-y-2">
            <h3 className="font-bold font-serif text-sm text-[#8B5A2B] flex items-center gap-1.5">
              <GitCommit className="w-4 h-4" />
              <span>直系亲属</span>
            </h3>

            <div className="bg-white p-3 rounded-xl border border-[#E8DFD1] space-y-2 text-xs">
              <div>
                <span className="text-gray-400 font-medium">父母：</span>
                {member.parents && member.parents.length > 0 ? (
                  member.parents.map((p) => (
                    <span key={p.id} className="mr-2 font-semibold text-[#8B5A2B]">
                      {p.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">未关联</span>
                )}
              </div>

              <div>
                <span className="text-gray-400 font-medium">配偶：</span>
                {member.spouses && member.spouses.length > 0 ? (
                  member.spouses.map((sp) => (
                    <span key={sp.member.id} className="mr-2 font-semibold text-[#B83B26]">
                      {sp.member.name} ({sp.marriageType === 'first_marriage' ? '原配' : '续弦'})
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">未关联</span>
                )}
              </div>

              <div>
                <span className="text-gray-400 font-medium">子女：</span>
                {member.children && member.children.length > 0 ? (
                  member.children.map((c) => (
                    <span key={c.id} className="mr-2 font-semibold text-[#1A1A1A]">
                      {c.name}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">未关联</span>
                )}
              </div>
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-1.5">
            <h3 className="font-bold font-serif text-sm text-[#8B5A2B]">生平传记</h3>
            <div className="bg-white p-4 rounded-xl border border-[#E8DFD1] text-gray-700 leading-relaxed font-serif">
              {member.biography || '暂未整理本成员之人生生平传记。可点击“编辑”补充资料。'}
            </div>
          </div>
        </div>

        {/* Modal Footer Action Buttons */}
        <div className="p-4 bg-white border-t border-[#E8DFD1] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                onClose();
                onAddSpouse(member);
              }}
              className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-[#B83B26] px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <Heart className="w-3.5 h-3.5" />
              <span>加配偶</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onAddChild(member);
              }}
              className="flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-[#8B5A2B] px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>加子女</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(member);
              }}
              className="flex items-center gap-1 border border-[#D9CDB8] hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-xl text-xs font-semibold transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>编辑</span>
            </button>

            <button
              onClick={() => {
                if (confirm(`确认删除成员 ${member.name} 吗？`)) {
                  onDelete(member.id);
                  onClose();
                }
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
