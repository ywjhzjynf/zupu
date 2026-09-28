import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Send, Bot, User, HelpCircle, RefreshCw } from 'lucide-react';
import { AIChatMessage, Family, FamilyMember } from '../../types/genealogy';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  family: Family | null;
  members: FamilyMember[];
  boundMemberId?: string;
  onAskAI: (question: string) => Promise<string>;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  family,
  members,
  boundMemberId,
  onAskAI,
}) => {
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: `您好！我是「${family?.name || '数字族谱'} AI 百事通」。我可以基于当前记录的家族事实为您：\n1. 推算亲属称谓（如：“我和李新华是什么关系？”）\n2. 解析字辈谱与代际序数\n3. 润色生平故事与口述历史\n4. 整理家族历史时间线`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!isOpen) return null;

  const quickPrompts = [
    '我和李新华是什么关系？',
    '我爷爷的哥哥应该怎么称谓？',
    '根据这些资料生成家族历史简介',
    '解释本家族的字辈传承与含义',
  ];

  const handleSend = async (questionText?: string) => {
    const q = questionText || input.trim();
    if (!q || loading) return;

    const userMsg: AIChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!questionText) setInput('');
    setLoading(true);

    try {
      const answer = await onAskAI(q);
      const aiMsg: AIChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'assistant',
        text: answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      const errMsg: AIChatMessage = {
        id: `msg_err_${Date.now()}`,
        sender: 'assistant',
        text: '抱歉，AI 族谱服务暂时出现异常，请稍后再试。',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
      <div className="bg-[#FDFBF7] w-full max-w-md h-full shadow-2xl border-l border-[#D9CDB8] flex flex-col animate-in slide-in-from-right duration-300">
        {/* Drawer Top Header */}
        <div className="bg-gradient-to-r from-[#8B5A2B] to-[#B83B26] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-white/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="font-bold font-serif text-sm">AI 族谱助手</h2>
              <p className="text-[10px] text-white/80">严谨基于真实家族图谱，拒绝幻觉捏造</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-3 bg-white border-b border-[#E8DFD1] flex gap-2 overflow-x-auto">
          {quickPrompts.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="whitespace-nowrap text-[11px] bg-[#8B5A2B]/10 hover:bg-[#8B5A2B]/20 text-[#8B5A2B] font-medium px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 shrink-0"
            >
              <HelpCircle className="w-3 h-3" />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Chat Messages Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-[#8B5A2B] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[82%] rounded-2xl p-3 leading-relaxed font-serif whitespace-pre-line shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-[#8B5A2B] text-white rounded-tr-none'
                    : 'bg-white text-[#1A1A1A] border border-[#E8DFD1] rounded-tl-none'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[9px] mt-1 text-right ${
                    msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-[#B83B26] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#8B5A2B] bg-white p-3 rounded-xl border border-[#E8DFD1] w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>AI 正在研读家族数据并推演中...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Bottom Input Area */}
        <div className="p-3 bg-white border-t border-[#E8DFD1]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="向 AI 询问族谱称谓或家族历史..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 text-xs px-3 py-2.5 rounded-xl border border-[#D9CDB8] bg-[#FDFBF7] focus:outline-none focus:border-[#8B5A2B]"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-[#8B5A2B] hover:bg-[#663F1A] text-white p-2.5 rounded-xl transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
