import React, { useState } from 'react';
import { X, Plus, Check, Key, ShieldCheck } from 'lucide-react';
import { Family } from '../../types/genealogy';

interface FamilySwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  families: Family[];
  currentFamilyId?: string;
  onSelectFamily: (id: string) => void;
  onOpenCreateModal: () => void;
  onJoinByCode: (code: string) => Promise<void>;
}

export const FamilySwitchModal: React.FC<FamilySwitchModalProps> = ({
  isOpen,
  onClose,
  families,
  currentFamilyId,
  onSelectFamily,
  onOpenCreateModal,
  onJoinByCode,
}) => {
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    setLoading(true);
    setError('');
    try {
      await onJoinByCode(inviteCode.trim());
      setInviteCode('');
      onClose();
    } catch (err: any) {
      setError(err.message || '通过邀请码加入失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-md w-full border border-[#D9CDB8] shadow-2xl p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold font-serif text-[#1A1A1A] mb-1">切换家族空间</h2>
        <p className="text-xs text-[#666666] mb-5">修撰与传承您的家族历史</p>

        {/* Existing Families List */}
        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
          {families.map((fam) => {
            const isSelected = fam.id === currentFamilyId;
            return (
              <button
                key={fam.id}
                onClick={() => {
                  onSelectFamily(fam.id);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'border-[#8B5A2B] bg-[#8B5A2B]/10 shadow-xs'
                    : 'border-[#E8DFD1] bg-white hover:border-[#8B5A2B]/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#8B5A2B] text-white flex items-center justify-center font-bold text-lg font-serif shadow-xs">
                    {fam.surname}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-[#1A1A1A]">{fam.name}</h3>
                    <div className="text-xs text-[#666666] flex items-center gap-2 mt-0.5">
                      <span>堂号: {fam.hallName || '未标'}</span>
                      <span>·</span>
                      <span>{fam.ancestralHome || '中国'}</span>
                    </div>
                  </div>
                </div>
                {isSelected && <Check className="w-5 h-5 text-[#8B5A2B]" />}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2 border-t border-[#E8DFD1]">
          {/* Join by Code Form */}
          <form onSubmit={handleJoin} className="flex gap-2">
            <div className="relative flex-1">
              <Key className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="输入家族邀请码 (如: LXLI2026)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inviteCode.trim()}
              className="bg-[#8B5A2B] hover:bg-[#663F1A] text-white text-xs font-medium px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              {loading ? '加入中...' : '加入'}
            </button>
          </form>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <button
            onClick={() => {
              onClose();
              onOpenCreateModal();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-[#8B5A2B] text-[#8B5A2B] hover:bg-[#8B5A2B]/5 rounded-xl text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>创建全新家族空间</span>
          </button>
        </div>
      </div>
    </div>
  );
};
