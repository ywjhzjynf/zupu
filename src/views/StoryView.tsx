import React, { useState } from 'react';
import { BookOpen, Image as ImageIcon, Plus, Calendar, MapPin, Sparkles } from 'lucide-react';
import { FamilyPhoto, FamilyStory } from '../types/genealogy';

interface StoryViewProps {
  stories: FamilyStory[];
  photos: FamilyPhoto[];
  onSelectStory: (story: FamilyStory) => void;
  onSelectPhoto: (photo: FamilyPhoto) => void;
  onOpenAddStory: () => void;
  onOpenUploadPhoto: () => void;
}

export const StoryView: React.FC<StoryViewProps> = ({
  stories,
  photos,
  onSelectStory,
  onSelectPhoto,
  onOpenAddStory,
  onOpenUploadPhoto,
}) => {
  const [activeTab, setActiveTab] = useState<'stories' | 'photos'>('stories');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredStories = stories.filter((s) => (selectedCategory === 'all' ? true : s.category === selectedCategory));

  return (
    <div className="space-y-4 pb-20 px-4 pt-3 max-w-md mx-auto sm:max-w-xl md:max-w-2xl lg:max-w-4xl">
      {/* Tab Switcher & Add Actions */}
      <div className="flex items-center justify-between">
        <div className="flex bg-white p-1 rounded-2xl border border-[#E8DFD1]">
          <button
            onClick={() => setActiveTab('stories')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
              activeTab === 'stories' ? 'bg-[#8B5A2B] text-white shadow-xs' : 'text-gray-600'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>家族故事 / 家训 ({stories.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
              activeTab === 'photos' ? 'bg-[#8B5A2B] text-white shadow-xs' : 'text-gray-600'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>记忆老相册 ({photos.length})</span>
          </button>
        </div>

        <button
          onClick={activeTab === 'stories' ? onOpenAddStory : onOpenUploadPhoto}
          className="bg-[#B83B26] hover:bg-[#8B5A2B] text-white text-xs font-semibold px-3.5 py-2.5 rounded-2xl shadow-xs transition-all flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          <span>{activeTab === 'stories' ? '撰写故事' : '上传相片'}</span>
        </button>
      </div>

      {/* Stories Tab View */}
      {activeTab === 'stories' && (
        <div className="space-y-3">
          {/* Sub-category Filter Pills */}
          <div className="flex gap-2 overflow-x-auto text-xs py-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                selectedCategory === 'all' ? 'bg-[#8B5A2B] text-white font-semibold' : 'bg-white text-gray-600 border'
              }`}
            >
              全部故事
            </button>
            <button
              onClick={() => setSelectedCategory('motto')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                selectedCategory === 'motto' ? 'bg-[#8B5A2B] text-white font-semibold' : 'bg-white text-gray-600 border'
              }`}
            >
              家训家规
            </button>
            <button
              onClick={() => setSelectedCategory('history')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                selectedCategory === 'history' ? 'bg-[#8B5A2B] text-white font-semibold' : 'bg-white text-gray-600 border'
              }`}
            >
              家族通史
            </button>
            <button
              onClick={() => setSelectedCategory('oral')}
              className={`px-3 py-1.5 rounded-xl transition-colors ${
                selectedCategory === 'oral' ? 'bg-[#8B5A2B] text-white font-semibold' : 'bg-white text-gray-600 border'
              }`}
            >
              口述历史
            </button>
          </div>

          <div className="space-y-3">
            {filteredStories.map((story) => (
              <div
                key={story.id}
                onClick={() => onSelectStory(story)}
                className="bg-white p-4 rounded-2xl border border-[#E8DFD1] hover:border-[#8B5A2B] transition-all cursor-pointer shadow-xs flex flex-col sm:flex-row gap-4"
              >
                {story.coverUrl && (
                  <img
                    src={story.coverUrl}
                    alt={story.title}
                    className="w-full sm:w-32 h-28 rounded-xl object-cover shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-[#8B5A2B]/10 text-[#8B5A2B] px-2 py-0.5 rounded font-semibold">
                      {story.category === 'motto'
                        ? '家训'
                        : story.category === 'history'
                        ? '家史'
                        : story.category === 'oral'
                        ? '口述'
                        : '纪事'}
                    </span>
                    <h3 className="font-bold font-serif text-sm text-[#1A1A1A] truncate">{story.title}</h3>
                  </div>

                  <p className="text-xs text-[#666666] line-clamp-2 mt-2 leading-relaxed font-serif">
                    {story.content}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-3">
                    <span>讲述：{story.authorName || '修谱人'}</span>
                    {story.eventYear && <span>· {story.eventYear} 年</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photos Gallery Tab View */}
      {activeTab === 'photos' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => onSelectPhoto(photo)}
              className="bg-white rounded-2xl border border-[#E8DFD1] overflow-hidden hover:border-[#8B5A2B] transition-all cursor-pointer shadow-xs group"
            >
              <div className="h-36 overflow-hidden relative">
                <img
                  src={photo.photoUrl}
                  alt={photo.caption || '照片'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {photo.takenYear && (
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {photo.takenYear} 年
                  </span>
                )}
              </div>
              <div className="p-2.5 text-xs">
                <p className="font-semibold text-[#1A1A1A] truncate">{photo.caption || '无标题照片'}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
