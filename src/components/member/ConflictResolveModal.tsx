import React, { useState } from 'react';
import { X, Check, ArrowRight, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { FamilyMember } from '../../types/genealogy';

export interface ConflictItem {
  existingMember: FamilyMember;
  newParsedData: any;
}

interface ConflictResolveModalProps {
  isOpen: boolean;
  onClose: () => void;
  conflicts: ConflictItem[];
  onResolve: (resolvedMembers: any[]) => void;
}

export const ConflictResolveModal: React.FC<ConflictResolveModalProps> = ({
  isOpen,
  onClose,
  conflicts,
  onResolve,
}) => {
  const [selections, setSelections] = useState<Record<number, 'existing' | 'new' | 'merge'>>({});

  if (!isOpen || conflicts.length === 0) return null;

  const handleChoice = (index: number, choice: 'existing' | 'new' | 'merge') => {
    setSelections((prev) => ({ ...prev, [index]: choice }));
  };

  const handleConfirm = () => {
    const finalResults = conflicts.map((c, index) => {
      const choice = selections[index] || 'merge';
      if (choice === 'existing') {
        return c.existingMember;
      }
      if (choice === 'new') {
        return {
          ...c.newParsedData,
          id: c.existingMember.id,
        };
      }
      // Merge: Combine both, preference to new non-empty fields
      return {
        ...c.existingMember,
        birthDate: c.newParsedData.birthDate || c.existingMember.birthDate,
        deathDate: c.newParsedData.deathDate || c.existingMember.deathDate,
        birthPlace: c.newParsedData.birthPlace || c.existingMember.birthPlace,
        livingPlace: c.newParsedData.livingPlace || c.existingMember.livingPlace,
        occupation: c.newParsedData.occupation || c.existingMember.occupation,
        biography: `${c.existingMember.biography || ''}\n【口述/OCR补记】: ${c.newParsedData.biography || ''}`.trim(),
      };
    });

    onResolve(finalResults);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-3xl max-w-2xl w-full border border-[#D9CDB8] shadow-2xl overflow-hidden relative flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#B83B26] to-[#8B5A2B] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-amber-200" />
            </div>
            <div>
              <h2 className="font-bold font-serif text-sm">✨ 智能冲突对比与差异核对</h2>
              <p className="text-[10px] text-amber-100">检测到新提取的口述/照片信息与已有图谱档案存在重复或差异</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conflicts List */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#1A1A1A]">
          {conflicts.map((item, idx) => {
            const currentChoice = selections[idx] || 'merge';
            return (
              <div key={idx} className="bg-white rounded-2xl border border-[#E8DFD1] p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-bold text-sm text-[#8B5A2B] font-serif">
                    【重复/碰撞宗亲】: {item.existingMember.name}
                  </span>
                  <span className="text-[10px] bg-amber-100 text-[#8B5A2B] px-2 py-0.5 rounded-md font-semibold">
                    同名合并校验
                  </span>
                </div>

                {/* Grid Comparison */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Existing Record */}
                  <div className={`p-3 rounded-xl border text-[11px] transition-all ${
                    currentChoice === 'existing' ? 'border-[#8B5A2B] bg-[#FDFBF7]' : 'border-gray-200 bg-gray-50/50'
                  }`}>
                    <span className="font-bold text-[#8B5A2B] block mb-1">📜 系统原有记载:</span>
                    <ul className="space-y-1 text-gray-600">
                      <li>出生日期: {item.existingMember.birthDate || '未录入'}</li>
                      <li>生卒状态: {item.existingMember.isDeceased ? '已故' : '健在'}</li>
                      <li>现居/籍贯: {item.existingMember.livingPlace || '未录入'}</li>
                      <li className="line-clamp-2">生平故事: {item.existingMember.biography || '无'}</li>
                    </ul>
                  </div>

                  {/* AI Parsed Record */}
                  <div className={`p-3 rounded-xl border text-[11px] transition-all ${
                    currentChoice === 'new' ? 'border-[#B83B26] bg-red-50/30' : 'border-gray-200 bg-gray-50/50'
                  }`}>
                    <span className="font-bold text-[#B83B26] block mb-1">✨ 最新 AI / 口述提取:</span>
                    <ul className="space-y-1 text-gray-700">
                      <li>出生日期: {item.newParsedData.birthDate || '未识别'}</li>
                      <li>生卒状态: {item.newParsedData.isDeceased ? '已故' : '健在'}</li>
                      <li>现居/籍贯: {item.newParsedData.livingPlace || '未识别'}</li>
                      <li className="line-clamp-2">生平故事: {item.newParsedData.biography || '无'}</li>
                    </ul>
                  </div>
                </div>

                {/* Resolution Choices */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => handleChoice(idx, 'existing')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-colors ${
                      currentChoice === 'existing'
                        ? 'bg-[#8B5A2B] text-white border-[#8B5A2B]'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    保留原档案
                  </button>
                  <button
                    onClick={() => handleChoice(idx, 'new')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-colors ${
                      currentChoice === 'new'
                        ? 'bg-[#B83B26] text-white border-[#B83B26]'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    采用新提取
                  </button>
                  <button
                    onClick={() => handleChoice(idx, 'merge')}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-colors flex items-center gap-1 ${
                      currentChoice === 'merge'
                        ? 'bg-amber-700 text-white border-amber-700'
                        : 'bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>智能互补融合 (推荐)</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Confirm */}
        <div className="p-4 bg-white border-t border-[#E8DFD1] flex items-center justify-between">
          <span className="text-[11px] text-gray-500">已核对 {conflicts.length} 项差异</span>
          <button
            onClick={handleConfirm}
            className="bg-[#8B5A2B] hover:bg-[#663F1A] text-white font-bold px-5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-md text-xs"
          >
            <CheckCircle2 className="w-4 h-4 text-amber-300" />
            <span>确认合并更新至全景世系图</span>
          </button>
        </div>
      </div>
    </div>
  );
};
