import React, { useState } from 'react';
import { X, Copy, Check, Share2, QrCode } from 'lucide-react';
import { Family } from '../../types/genealogy';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: Family | null;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, family }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !family) return null;

  const handleCopy = () => {
    const text = `【${family.name}】诚邀您加入数字族谱！\n家族邀请码：${family.inviteCode}\n在小程序/应用中输入邀请码即可查看家族基因与修撰族谱。`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-sm w-full border border-[#D9CDB8] shadow-2xl p-6 relative text-center">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-[#8B5A2B]/10 text-[#8B5A2B] flex items-center justify-center mx-auto mb-3">
          <Share2 className="w-6 h-6" />
        </div>

        <h2 className="text-lg font-bold font-serif text-[#1A1A1A]">{family.name}</h2>
        <p className="text-xs text-[#666666] mb-4">邀请亲朋族员共同完善世系图谱</p>

        {/* Invite Code Display Box */}
        <div className="bg-white border-2 border-dashed border-[#8B5A2B]/40 rounded-2xl p-4 mb-4">
          <span className="text-[11px] text-[#8B5A2B] font-semibold uppercase tracking-wider block mb-1">
            家族专属邀请码
          </span>
          <div className="text-2xl font-mono font-bold text-[#B83B26] tracking-widest my-1">
            {family.inviteCode}
          </div>
          <p className="text-[10px] text-gray-500">成员凭借此邀请码可在“切换家族”中直接进入本空间</p>
        </div>

        <button
          onClick={handleCopy}
          className="w-full flex items-center justify-center gap-2 bg-[#8B5A2B] hover:bg-[#663F1A] text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-sm"
        >
          {copied ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
          <span>{copied ? '已复制邀请链接与文案' : '复制邀请文字'}</span>
        </button>
      </div>
    </div>
  );
};
