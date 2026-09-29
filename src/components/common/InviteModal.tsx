import React, { useState } from 'react';
import { X, Copy, Check, Share2, QrCode, Sparkles, Download, Users, MessageCircle } from 'lucide-react';
import { Family } from '../../types/genealogy';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  family: Family | null;
}

export const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose, family }) => {
  const [copied, setCopied] = useState(false);
  const [branchRole, setBranchRole] = useState<'all' | 'branch1' | 'branch2'>('all');

  if (!isOpen || !family) return null;

  const branchText =
    branchRole === 'branch1'
      ? '（大房世系分支）'
      : branchRole === 'branch2'
      ? '（二房世系分支）'
      : '（全族通告）';

  const inviteMessage = `【${family.name}${branchText}】修谱通知：\n先祖庇佑，吾族修谱程序现已建立！诚邀诸位族员宗亲共同补齐名册与口述生平。\n微信邀请码：${family.inviteCode}\n在应用或小程序中输入此码，即可自动归宗接入全景世系图！`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-3xl max-w-md w-full border border-[#D9CDB8] shadow-2xl overflow-hidden relative text-center flex flex-col">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-[#8B5A2B] via-[#663F1A] to-[#B83B26] text-white p-4 relative flex items-center justify-between">
          <div className="flex items-center gap-2 text-left">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Share2 className="w-4 h-4 text-amber-300" />
            </div>
            <div>
              <h2 className="font-bold font-serif text-sm">微信家族群·众包协作请柬</h2>
              <p className="text-[10px] text-amber-200">一键生成微信邀请卡，宗亲各自补全本房档案</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs text-[#1A1A1A]">
          {/* Branch Select */}
          <div className="flex items-center justify-center gap-2 bg-white p-1.5 rounded-2xl border border-[#E8DFD1]">
            <span className="text-[11px] text-[#8B5A2B] font-semibold flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              分支限定:
            </span>
            <button
              onClick={() => setBranchRole('all')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors ${
                branchRole === 'all' ? 'bg-[#8B5A2B] text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              全族通用
            </button>
            <button
              onClick={() => setBranchRole('branch1')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors ${
                branchRole === 'branch1' ? 'bg-[#8B5A2B] text-white' : 'text-[#666666] hover:bg-gray-100'
              }`}
            >
              长房分支
            </button>
            <button
              onClick={() => setBranchRole('branch2')}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors ${
                branchRole === 'branch2' ? 'bg-[#8B5A2B] text-white' : 'text-[#666666] hover:bg-gray-100'
              }`}
            >
              二房分支
            </button>
          </div>

          {/* Simulated WeChat Card Graphic */}
          <div className="bg-gradient-to-b from-[#FFFDF7] to-[#F7F2E6] border-2 border-[#D9CDB8] rounded-2xl p-4 shadow-sm relative overflow-hidden text-left space-y-3">
            <div className="absolute right-3 top-3 w-10 h-10 border-2 border-[#B83B26]/30 text-[#B83B26] rounded-full flex items-center justify-center font-serif text-[10px] font-bold rotate-12 bg-red-50/50">
              {family.hallName ? family.hallName.slice(0, 2) : '宗亲'}
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[#B83B26] text-white text-[10px] font-bold">
                族谱请柬
              </span>
              <span className="font-serif font-bold text-sm text-[#1A1A1A]">{family.name}</span>
            </div>

            <p className="text-[11px] text-[#8B5A2B] leading-relaxed font-serif">
              “敦宗睦族，传承先德。特邀 {branchText} 宗亲共同寻根合谱，填报本房世系名册。”
            </p>

            <div className="flex items-center justify-between bg-white/80 p-3 rounded-xl border border-[#E8DFD1]">
              <div>
                <span className="text-[10px] text-gray-500 block">家族口令邀请码</span>
                <span className="text-xl font-mono font-bold text-[#B83B26] tracking-widest">
                  {family.inviteCode}
                </span>
              </div>

              {/* QR Code Graphic Mock */}
              <div className="w-14 h-14 bg-white p-1 rounded-lg border border-gray-200 flex flex-col items-center justify-center shrink-0 shadow-xs">
                <QrCode className="w-10 h-10 text-[#1A1A1A]" />
                <span className="text-[7px] text-gray-400 scale-90">微信扫码归宗</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleCopy}
              className="w-full flex items-center justify-center gap-2 bg-[#8B5A2B] hover:bg-[#663F1A] text-white font-semibold py-2.5 rounded-xl transition-all shadow-md"
            >
              {copied ? <Check className="w-4 h-4 text-green-300" /> : <MessageCircle className="w-4 h-4" />}
              <span>{copied ? '邀请文案与口令已复制！' : '复制微信群专属邀请文案'}</span>
            </button>

            <p className="text-[10px] text-gray-400">
              提示：复制文案后发到家族微信群，亲人们点开链接或输入邀请码，即可各自补齐家庭档案！
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
