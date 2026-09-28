import React from 'react';
import { X, Calendar, BookOpen, User } from 'lucide-react';
import { FamilyStory } from '../../types/genealogy';

interface StoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: FamilyStory | null;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({ isOpen, onClose, story }) => {
  if (!isOpen || !story) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-lg w-full border border-[#D9CDB8] shadow-2xl overflow-hidden relative max-h-[85vh] flex flex-col">
        {story.coverUrl && (
          <div className="h-48 w-full relative">
            <img src={story.coverUrl} alt={story.title} className="w-full h-full object-cover" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white p-1 rounded-full bg-black/40 hover:bg-black/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <span className="text-[10px] bg-[#8B5A2B]/10 text-[#8B5A2B] px-2 py-0.5 rounded-full font-semibold uppercase">
              {story.category === 'motto'
                ? '家训家规'
                : story.category === 'history'
                ? '家族通史'
                : story.category === 'oral'
                ? '口述历史'
                : '重大纪事'}
            </span>
            <h2 className="text-xl font-bold font-serif text-[#1A1A1A] mt-2">{story.title}</h2>
            <div className="flex items-center gap-3 text-xs text-[#666666] mt-2">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#8B5A2B]" /> {story.authorName || '修谱人'}
              </span>
              {story.eventYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#8B5A2B]" /> {story.eventYear} 年
                </span>
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8DFD1] text-xs text-[#1A1A1A] leading-relaxed font-serif whitespace-pre-line shadow-xs">
            {story.content}
          </div>
        </div>
      </div>
    </div>
  );
};
