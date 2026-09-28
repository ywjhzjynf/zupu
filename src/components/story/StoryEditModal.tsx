import React, { useState } from 'react';
import { X, BookOpen, Save } from 'lucide-react';

interface StoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  onSave: (storyData: any) => Promise<void>;
}

export const StoryEditModal: React.FC<StoryEditModalProps> = ({ isOpen, onClose, familyId, onSave }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'history' | 'motto' | 'event' | 'oral' | 'figure'>('history');
  const [content, setContent] = useState('');
  const [eventYear, setEventYear] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    try {
      await onSave({
        familyId,
        title: title.trim(),
        category,
        content: content.trim(),
        eventYear: eventYear.trim(),
        coverUrl: coverUrl.trim() || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600',
      });
      setTitle('');
      setContent('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-lg w-full border border-[#D9CDB8] shadow-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#8B5A2B]/10 text-[#8B5A2B] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold font-serif text-[#1A1A1A]">撰写家族故事 / 家训纪事</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">故事标题 *</label>
            <input
              type="text"
              required
              placeholder="例如: 《崇德传家》家训"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">故事分类</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              >
                <option value="history">家族通史</option>
                <option value="motto">家训家规</option>
                <option value="event">重大纪事 / 迁徙</option>
                <option value="oral">口述历史</option>
                <option value="figure">杰出人物传</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold mb-1">发生年份 (可选)</label>
              <input
                type="text"
                placeholder="例如: 1948"
                value={eventYear}
                onChange={(e) => setEventYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">正文内容 *</label>
            <textarea
              rows={6}
              required
              placeholder="撰写记录祖辈故事、家风传承或口述录音笔记..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !title.trim() || !content.trim()}
            className="w-full bg-[#8B5A2B] hover:bg-[#663F1A] text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? '保存中...' : '发布故事档案'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
