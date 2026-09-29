import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  UserPlus,
  Loader2,
  CheckCircle2,
  MessageSquare,
  Trash2,
  Wand2,
  Camera,
  Image as ImageIcon,
  FileText,
} from 'lucide-react';
import { api } from '../../api/client';

interface AIBatchEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  familyId: string;
  onBatchImportDone: () => void;
}

export const AIBatchEntryModal: React.FC<AIBatchEntryModalProps> = ({
  isOpen,
  onClose,
  familyId,
  onBatchImportDone,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'photo'>('text');
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [ocrResultText, setOcrResultText] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [parsedMembers, setParsedMembers] = useState<any[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [importing, setImporting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const examplePrompts = [
    '我是李建国，我父亲叫李维国（已故），1922年出生在甘肃陇西，做水利工程师；我母亲叫陈秀英，我还有一个弟弟叫李维民，做大学教授。',
    '始祖李德诚，光绪秀才，设私塾。长子李维国，次子李维民。维国之子李新华，生于1952年成都，做机械高工。',
    '我叫李小明，1995年出生在深圳，我是李明的儿子，我母亲是林悦，从事设计师工作。',
  ];

  const handleParseText = async (textToParse?: string) => {
    const query = textToParse || inputText;
    if (!query.trim()) return;

    setLoading(true);
    setIsDone(false);
    try {
      const res = await api.parseAIText(query);
      setParsedMembers(res.members || []);
    } catch (err) {
      console.error('AI parse error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setPhotoPreview(base64);
      setLoading(true);
      setIsDone(false);

      try {
        const res = await api.parseAIPhoto(base64);
        setOcrResultText(res.text || '');
        setParsedMembers(res.members || []);
      } catch (err) {
        console.error('Photo OCR parse error:', err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleBatchConfirm = async () => {
    if (parsedMembers.length === 0) return;
    setImporting(true);

    try {
      for (const m of parsedMembers) {
        await api.addMember(familyId, {
          name: m.name || '新宗亲',
          gender: m.gender || 'male',
          generationNum: m.generationNum || 3,
          birthDate: m.birthDate,
          isDeceased: Boolean(m.isDeceased),
          deathDate: m.deathDate,
          birthPlace: m.birthPlace,
          livingPlace: m.livingPlace,
          occupation: m.occupation,
          biography: m.biography || '由 AI 口述/老照片智能建谱助手自动提炼生成。',
          parentName: m.parentName,
          spouseName: m.spouseName,
        });
      }
      setIsDone(true);
      setTimeout(() => {
        onBatchImportDone();
        onClose();
        setIsDone(false);
        setParsedMembers([]);
        setInputText('');
        setPhotoPreview(null);
      }, 1500);
    } catch (err) {
      console.error('Batch import failed:', err);
    } finally {
      setImporting(false);
    }
  };

  const handleRemoveItem = (index: number) => {
    setParsedMembers((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] rounded-3xl max-w-xl w-full border border-[#D9CDB8] shadow-2xl overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B5A2B] via-[#663F1A] to-[#B83B26] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Wand2 className="w-4 h-4 text-[#D4A359]" />
            </div>
            <div>
              <h2 className="font-bold font-serif text-base">✨ AI 智能建谱 (文本口述 / 照片视觉识别)</h2>
              <p className="text-[10px] text-[#D4A359]">告别逐字手动填表，支持拍照、老照片或粘贴文本建谱</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="p-3 bg-white border-b border-[#E8DFD1] flex gap-2 text-xs">
          <button
            onClick={() => setActiveTab('text')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'text' ? 'bg-[#8B5A2B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>文本/口述一键提炼</span>
          </button>

          <button
            onClick={() => setActiveTab('photo')}
            className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'photo' ? 'bg-[#8B5A2B] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>老族谱/碑文拍照识别</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-[#1A1A1A]">
          {activeTab === 'text' && (
            <>
              {/* Preset Example Quick Fill */}
              <div className="space-y-1.5">
                <span className="font-semibold text-gray-700 flex items-center gap-1 text-[11px]">
                  <MessageSquare className="w-3.5 h-3.5 text-[#8B5A2B]" />
                  <span>快捷范例 (点击自动解析测验)：</span>
                </span>
                <div className="flex flex-col gap-1.5">
                  {examplePrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setInputText(prompt);
                        handleParseText(prompt);
                      }}
                      className="text-left bg-white p-2 rounded-xl border border-[#E8DFD1] hover:border-[#8B5A2B] text-[11px] text-[#666666] hover:text-[#1A1A1A] transition-colors truncate"
                    >
                      “{prompt}”
                    </button>
                  ))}
                </div>
              </div>

              {/* Textarea Input */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold font-serif text-xs text-[#8B5A2B]">
                    贴入家族叙述 / 微信聊天记录 / 复制的资料：
                  </label>
                  <span className="text-[10px] text-gray-400">自动提炼多位宗亲</span>
                </div>
                <textarea
                  rows={4}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="例如：“我是李小明，父亲是李明，祖父是李新华（生于1952年成都做高工），大伯叫李新民在北京...”"
                  className="w-full text-xs p-3 rounded-2xl border border-[#D9CDB8] bg-white focus:outline-none focus:border-[#8B5A2B] leading-relaxed"
                />
                <button
                  onClick={() => handleParseText()}
                  disabled={loading || !inputText.trim()}
                  className="w-full bg-[#8B5A2B] hover:bg-[#663F1A] text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI 正在提取人物关系与世系档案...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>✨ AI 智能提取人物与生成图谱预览</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {activeTab === 'photo' && (
            <div className="space-y-3">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#8B5A2B]/40 hover:border-[#8B5A2B] bg-white rounded-2xl p-6 text-center cursor-pointer transition-colors space-y-2 group"
              >
                {photoPreview ? (
                  <div className="space-y-2">
                    <img
                      src={photoPreview}
                      alt="老照片预览"
                      className="max-h-40 mx-auto rounded-xl object-contain border border-[#E8DFD1]"
                    />
                    <p className="text-[11px] text-[#8B5A2B] font-semibold">点击重新拍摄或选择其他照片</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-[#8B5A2B]/10 text-[#8B5A2B] flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Camera className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-[#1A1A1A] block">点击上传 / 拍照老族谱、合影或墓碑照片</span>
                      <span className="text-[10px] text-gray-500">支持 JPG、PNG 图片，AI 自动提取人名与世系信息</span>
                    </div>
                  </>
                )}
              </div>

              {ocrResultText && (
                <div className="p-3 bg-[#FCF9F2] rounded-xl border border-[#E8DFD1] text-[11px] text-[#8B5A2B]">
                  <span className="font-bold block mb-1">OCR 图片识谱描述：</span>
                  <p className="leading-relaxed">{ocrResultText}</p>
                </div>
              )}
            </div>
          )}

          {/* Parsed Results Preview */}
          {parsedMembers.length > 0 && (
            <div className="space-y-2 bg-white p-4 rounded-2xl border border-[#E8DFD1]">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="font-bold text-xs text-[#8B5A2B]">
                  已由 AI 成功提炼 {parsedMembers.length} 位宗亲：
                </span>
                <span className="text-[10px] text-gray-400">核对无误后点击批量入谱</span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {parsedMembers.map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-[#FDFBF7] rounded-xl border border-[#E8DFD1] flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-bold text-xs text-[#1A1A1A]">
                        <span>{m.name}</span>
                        <span className="text-[10px] text-[#8B5A2B] font-normal">
                          第 {m.generationNum || 3} 世 · {m.gender === 'female' ? '女' : '男'} · {m.isDeceased ? '故人' : '健在'}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-1">{m.biography}</p>
                    </div>

                    <button
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                      title="移除该条记录"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleBatchConfirm}
                disabled={importing}
                className="w-full mt-2 bg-[#B83B26] hover:bg-[#8B5A2B] text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>正在批量写入家族数据库...</span>
                  </>
                ) : isDone ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-300" />
                    <span>入谱成功！已自动更新家族世系图</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>一键确认入谱 ({parsedMembers.length} 人)</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
