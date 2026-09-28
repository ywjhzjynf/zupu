import React from 'react';
import { X, Calendar, MapPin, Image } from 'lucide-react';
import { FamilyPhoto } from '../../types/genealogy';

interface PhotoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  photo: FamilyPhoto | null;
}

export const PhotoDetailModal: React.FC<PhotoDetailModalProps> = ({ isOpen, onClose, photo }) => {
  if (!isOpen || !photo) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-2xl max-w-lg w-full border border-[#D9CDB8] shadow-2xl overflow-hidden relative flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-white bg-black/50 hover:bg-black/80 p-1.5 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-black flex items-center justify-center min-h-[260px]">
          <img src={photo.photoUrl} alt={photo.caption || '家族老照片'} className="max-h-[70vh] object-contain" />
        </div>

        <div className="p-4 bg-white text-xs space-y-2">
          <p className="font-semibold text-sm text-[#1A1A1A]">{photo.caption || '无标题照片'}</p>
          <div className="flex items-center gap-4 text-[#666666]">
            {photo.takenYear && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#8B5A2B]" /> {photo.takenYear} 年
              </span>
            )}
            {photo.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#8B5A2B]" /> {photo.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
