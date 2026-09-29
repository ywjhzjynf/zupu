import React, { useState } from 'react';
import { X, ImagePlus, Upload } from 'lucide-react';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  onSave: (photoData: any) => Promise<void>;
}

export const PhotoUploadModal: React.FC<PhotoUploadModalProps> = ({ isOpen, onClose, familyId, onSave }) => {
  const [photoUrl, setPhotoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [takenYear, setTakenYear] = useState('');
  const [location, setLocation] = useState('');
  const [albumCategory, setAlbumCategory] = useState<'heritage' | 'gathering' | 'ancestor' | 'daily'>('heritage');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const samplePhotos = [
    'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
    'https://images.unsplash.com/photo-1508807188400-530219db7007?w=600',
    'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=600',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl.trim()) return;
    setLoading(true);
    try {
      await onSave({
        familyId,
        photoUrl: photoUrl.trim(),
        caption: caption.trim(),
        takenYear: takenYear.trim(),
        location: location.trim(),
        albumCategory,
      });
      setPhotoUrl('');
      setCaption('');
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
          <div className="w-9 h-9 rounded-xl bg-[#8B5A2B]/10 text-[#8B5A2B] flex items-center justify-center">
            <ImagePlus className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold font-serif text-[#1A1A1A]">收录家族老照片 / 聚会合影</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold mb-1">图片来源 * (选择本地照片/拍照，或输入网络链接)</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                required
                placeholder="图片 URL 或上传本地图片..."
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
              <label className="bg-[#8B5A2B] hover:bg-[#663F1A] text-white px-3 py-2 rounded-xl font-semibold cursor-pointer flex items-center gap-1 shrink-0">
                <Upload className="w-4 h-4" />
                <span>拍照/选图</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (evt.target?.result) {
                          setPhotoUrl(evt.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {samplePhotos.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt="sample"
                  onClick={() => setPhotoUrl(url)}
                  className={`w-12 h-12 rounded-lg object-cover cursor-pointer border-2 transition-all ${
                    photoUrl === url ? 'border-[#B83B26] scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">照片说明 / 标注</label>
            <input
              type="text"
              placeholder="例如: 1975年成都祖居前全家合影"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold mb-1">拍摄年份</label>
              <input
                type="text"
                placeholder="例如: 1975"
                value={takenYear}
                onChange={(e) => setTakenYear(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">相册分类</label>
              <select
                value={albumCategory}
                onChange={(e) => setAlbumCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
              >
                <option value="heritage">老照片老物件</option>
                <option value="gathering">家族聚会合影</option>
                <option value="ancestor">祖居祖籍地</option>
                <option value="daily">日常照片</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1">拍摄地点</label>
            <input
              type="text"
              placeholder="例如: 甘肃陇西 / 四川成都"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !photoUrl.trim()}
            className="w-full bg-[#8B5A2B] hover:bg-[#663F1A] text-white font-semibold py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            <span>{loading ? '收录中...' : '收录至相册'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
