import React, { useState } from 'react';
import { X, Smartphone, MessageSquare, ShieldCheck, QrCode, CheckCircle2 } from 'lucide-react';

interface PhoneLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export const PhoneLoginModal: React.FC<PhoneLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [loginMode, setLoginMode] = useState<'phone' | 'wechat'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'input' | 'success'>('input');
  const [countdown, setCountdown] = useState(0);

  if (!isOpen) return null;

  const handleSendCode = () => {
    if (!phone || phone.length < 11) {
      alert('请输入正确的11位手机号码');
      return;
    }
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    alert('验证码已发送 (测试验证码: 8888)');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      alert('请输入手机号');
      return;
    }
    if (loginMode === 'phone' && code !== '8888' && code !== '1234') {
      alert('请输入正确的验证码 (测试验证码: 8888)');
      return;
    }

    setStep('success');
    setTimeout(() => {
      onLoginSuccess({
        id: `usr_${Date.now()}`,
        nickname: phone ? `手机用户_${phone.slice(-4)}` : '微信贵宾',
        phone: phone || '13800138000',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200',
        currentFamilyId: 'fam_1',
      });
      setStep('input');
      onClose();
    }, 1000);
  };

  const handleWeChatSimulate = () => {
    setStep('success');
    setTimeout(() => {
      onLoginSuccess({
        id: `usr_wx_${Date.now()}`,
        nickname: '微信授权宗亲',
        phone: '13912345678',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        currentFamilyId: 'fam_1',
      });
      setStep('input');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] w-full max-w-md rounded-2xl shadow-2xl border border-[#D9CDB8] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B5A2B] to-[#B83B26] text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-lg">数字族谱·登录中心</h2>
            <p className="text-xs text-white/80 mt-0.5">手机号与微信一键快捷登录</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex border-b border-[#E8DFD1] bg-white">
          <button
            type="button"
            onClick={() => setLoginMode('phone')}
            className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              loginMode === 'phone'
                ? 'text-[#8B5A2B] border-b-2 border-[#8B5A2B] bg-[#8B5A2B]/5 font-bold'
                : 'text-gray-500 hover:text-[#1A1A1A]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>手机号快捷登录</span>
          </button>
          <button
            type="button"
            onClick={() => setLoginMode('wechat')}
            className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              loginMode === 'wechat'
                ? 'text-[#07C160] border-b-2 border-[#07C160] bg-[#07C160]/5 font-bold'
                : 'text-gray-500 hover:text-[#1A1A1A]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>微信授权登录</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {step === 'success' ? (
            <div className="py-8 flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#1A1A1A]">登录成功！</h3>
              <p className="text-xs text-gray-500">正在进入家族修谱空间...</p>
            </div>
          ) : loginMode === 'phone' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">手机号码</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-gray-400 font-medium">+86</span>
                  <input
                    type="tel"
                    maxLength={11}
                    placeholder="请输入11位手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-12 pr-3 py-2 text-sm bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">短信验证码</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="请输入验证码 (测试码:8888)"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm bg-white border border-[#D9CDB8] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8B5A2B]"
                  />
                  <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={handleSendCode}
                    className="px-4 py-2 bg-[#8B5A2B]/10 hover:bg-[#8B5A2B]/20 text-[#8B5A2B] text-xs font-semibold rounded-xl shrink-0 transition-colors disabled:opacity-50"
                  >
                    {countdown > 0 ? `${countdown}s 后重试` : '获取验证码'}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#8B5A2B] to-[#B83B26] text-white font-serif font-bold text-sm rounded-xl shadow-md hover:opacity-95 transition-opacity"
                >
                  立即登录 / 注册
                </button>
              </div>

              <p className="text-[10px] text-center text-gray-400 mt-2">
                未注册手机号验证后将自动创建数字族谱账号
              </p>
            </form>
          ) : (
            <div className="py-4 flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-white border-2 border-dashed border-[#D9CDB8] rounded-2xl shadow-xs">
                <div className="w-40 h-40 bg-gray-50 flex flex-col items-center justify-center rounded-xl text-gray-400 gap-2">
                  <QrCode className="w-20 h-20 text-[#07C160]" />
                  <span className="text-[11px] font-medium text-gray-600">请使用微信扫一扫登录</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">支持微信授权一键绑定宗亲档案</p>
              <button
                type="button"
                onClick={handleWeChatSimulate}
                className="w-full py-3 bg-[#07C160] hover:bg-[#06ad56] text-white font-serif font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>模拟微信一键授权登录</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
