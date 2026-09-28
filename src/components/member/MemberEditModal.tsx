import React, { useState, useEffect } from 'react';
import { X, UserPlus, Save } from 'lucide-react';
import { FamilyMember, Gender } from '../../types/genealogy';

interface MemberEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberToEdit?: FamilyMember | null;
  parentPreset?: FamilyMember | null;
  spousePreset?: FamilyMember | null;
  familyId: string;
  onSave: (memberData: any) => Promise<void>;
}

export const MemberEditModal: React.FC<MemberEditModalProps> = ({
  isOpen,
  onClose,
  memberToEdit,
  parentPreset,
  spousePreset,
  familyId,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [usedName, setUsedName] = useState('');
  const [gender, setGender] = useState<Gender>('male');
  const [generationNum, setGenerationNum] = useState(1);
  const [generationChar, setGenerationChar] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [isDeceased, setIsDeceased] = useState(false);
  const [deathDate, setDeathDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [livingPlace, setLivingPlace] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [biography, setBiography] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (memberToEdit) {
      setName(memberToEdit.name || '');
      setUsedName(memberToEdit.usedName || '');
      setGender(memberToEdit.gender || 'male');
      setGenerationNum(memberToEdit.generationNum || 1);
      setGenerationChar(memberToEdit.generationChar || '');
      setBirthDate(memberToEdit.birthDate || '');
      setIsDeceased(memberToEdit.isDeceased || false);
      setDeathDate(memberToEdit.deathDate || '');
      setBirthPlace(memberToEdit.birthPlace || '');
      setLivingPlace(memberToEdit.livingPlace || '');
      setOccupation(memberToEdit.occupation || '');
      setEducation(memberToEdit.education || '');
      setBiography(memberToEdit.biography || '');
    } else if (parentPreset) {
      setName('');
      setGender('male');
      setGenerationNum((parentPreset.generationNum || 1) + 1);
      setGenerationChar('');
      setIsDeceased(false);
    } else if (spousePreset) {
      setName('');
      setGender(spousePreset.gender === 'male' ? 'female' : 'male');
      setGenerationNum(spousePreset.generationNum || 1);
      setIsDeceased(false);
    } else {
      setName('');
      setGender('male');
      setGenerationNum(1);
      setIsDeceased(false);
    }
  }, [memberToEdit, parentPreset, spousePreset, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await onSave({
        id: memberToEdit?.id,
        familyId,
        name: name.trim(),
        usedName,
        gender,
        generationNum: Number(generationNum),
        generationChar,
        birthDate,
        isDeceased,
        deathDate,
        birthPlace,
        livingPlace,
        occupation,
        education,
        biography,
        parentId: parentPreset?.id,
        spouseId: spousePreset?.id,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-lg w-full border border-[#D9CDB8] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#8B5A2B] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            <h2 className="font-bold font-serif text-base">
              {memberToEdit
                ? `修改 ${memberToEdit.name} 档案`
                : parentPreset
                ? `为 ${parentPreset.name} 添加子女`
                : spousePreset
                ? `为 ${spousePreset.name} 添加配偶`
                : '新增家族成员档案'}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs text-[#1A1A1A] flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">姓名 *</label>
              <input
                type="text"
                required
                placeholder="例如: 李明"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">曾用名 / 字号</label>
              <input
                type="text"
                placeholder="例如: 李安平"
                value={usedName}
                onChange={(e) => setUsedName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold mb-1">性别</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              >
                <option value="male">男 (Male)</option>
                <option value="female">女 (Female)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">世代 (第几世) *</label>
              <input
                type="number"
                min={1}
                max={50}
                required
                value={generationNum}
                onChange={(e) => setGenerationNum(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">字辈</label>
              <input
                type="text"
                placeholder="例如: 明"
                value={generationChar}
                onChange={(e) => setGenerationChar(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">出生年月日</label>
              <input
                type="text"
                placeholder="例如: 1988-09-15"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="checkbox"
                  checked={isDeceased}
                  onChange={(e) => setIsDeceased(e.target.checked)}
                  className="w-4 h-4 text-[#8B5A2B] rounded border-[#D9CDB8]"
                />
                <span>成员已故</span>
              </label>
            </div>
          </div>

          {isDeceased && (
            <div>
              <label className="block font-semibold mb-1">逝世日期</label>
              <input
                type="text"
                placeholder="例如: 2012-03-30"
                value={deathDate}
                onChange={(e) => setDeathDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">籍贯 / 出生地</label>
              <input
                type="text"
                placeholder="例如: 甘肃陇西"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">现居地</label>
              <input
                type="text"
                placeholder="例如: 四川成都"
                value={livingPlace}
                onChange={(e) => setLivingPlace(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">职业 / 功名</label>
              <input
                type="text"
                placeholder="例如: 工程师 / 教授"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
            <div>
              <label className="block font-semibold mb-1">教育经历</label>
              <input
                type="text"
                placeholder="例如: 浙江大学"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">人生生平简介</label>
            <textarea
              rows={3}
              placeholder="记录生平大事记、家庭贡献与传记..."
              value={biography}
              onChange={(e) => setBiography(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full mt-2 bg-[#8B5A2B] hover:bg-[#663F1A] text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? '保存中...' : '保存成员档案'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
