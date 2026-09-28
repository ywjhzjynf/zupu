import React, { useState } from 'react';
import { X, Building2 } from 'lucide-react';
import { Family } from '../../types/genealogy';

interface CreateFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: Partial<Family>) => Promise<void>;
}

export const CreateFamilyModal: React.FC<CreateFamilyModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [surname, setSurname] = useState('');
  const [name, setName] = useState('');
  const [hallName, setHallName] = useState('');
  const [ancestralHome, setAncestralHome] = useState('');
  const [currentLocation, setCurrentLocation] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!surname.trim()) return;
    setLoading(true);
    try {
      await onCreate({
        surname: surname.trim(),
        name: name.trim() || `${surname.trim()}氏家族`,
        hallName: hallName.trim() || `${surname.trim()}氏堂`,
        ancestralHome: ancestralHome.trim() || '中国',
        currentLocation: currentLocation.trim() || '全国',
        summary: summary.trim() || '传承家风，崇德向善，记录家族源流。',
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-md w-full border border-[#D9CDB8] shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#8B5A2B]/10 flex items-center justify-center text-[#8B5A2B]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-serif text-[#1A1A1A]">创建新家族空间</h2>
            <p className="text-xs text-[#666666]">立族立谱，寻根问祖</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">家族姓氏 *</label>
            <input
              type="text"
              required
              placeholder="例如: 李"
              value={surname}
              onChange={(e) => {
                setSurname(e.target.value);
                if (!name) setName(`${e.target.value}氏修撰宗族`);
                if (!hallName) setHallName(`${e.target.value}氏陇西堂`);
              }}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">家族全称</label>
            <input
              type="text"
              placeholder="例如: 陇西李氏修撰宗族"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">堂号 / 字辈</label>
              <input
                type="text"
                placeholder="例如: 陇西堂"
                value={hallName}
                onChange={(e) => setHallName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">家族祖籍</label>
              <input
                type="text"
                placeholder="例如: 甘肃陇西"
                value={ancestralHome}
                onChange={(e) => setAncestralHome(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1A1A1A] mb-1">家族简介</label>
            <textarea
              rows={3}
              placeholder="记录家族源流、迁徙历史或修谱宗旨..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !surname.trim()}
            className="w-full mt-2 bg-[#8B5A2B] hover:bg-[#663F1A] text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? '创建中...' : '确认创建'}
          </button>
        </form>
      </div>
    </div>
  );
};
