import React, { useState, useEffect } from 'react';
import { X, Smartphone, QrCode, CheckCircle2, AlertTriangle, ShieldCheck, KeyRound } from 'lucide-react';
import { api, saveStoredToken } from '../../api/client';

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
  const [loginMode, setLoginMode] = useState<'wechat' | 'phone'>('wechat');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [step, setStep] = useState<'login' | 'success'>('login');
  
  // Custom manual input state for web testing real WeChat code
  const [wxCode, setWxCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');
  const [currentOpenId, setCurrentOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setStep('login');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // 1. Silent WeChat Login via wx.login()
  const handleNativeWxLogin = async () => {
    setErrorMsg(null);
    setLoading(true);

    const isWxEnv = typeof (window as any).wx !== 'undefined' && typeof (window as any).wx.login === 'function';

    if (isWxEnv) {
      (window as any).wx.login({
        success: async (res: any) => {
          if (res.code) {
            try {
              const data = await api.wechatLogin(res.code);
              saveStoredToken(data.token);
              setCurrentOpenId(data.openid);
              setStep('success');
              setTimeout(() => {
                onLoginSuccess(data.user);
                onClose();
              }, 1000);
            } catch (err: any) {
              setErrorMsg(err.message || '微信静默登录处理异常');
            } finally {
              setLoading(false);
            }
          } else {
            setLoading(false);
            setErrorMsg('微信 wx.login 未能获取到有效的 code 凭证');
          }
        },
        fail: (err: any) => {
          setLoading(false);
          setErrorMsg(`微信小程序 wx.login 接口调用失败: ${err?.errMsg || '用户取消授权'}`);
        },
      });
    } else {
      // In web/h5 environment, submit the user's WeChat login code
      if (!wxCode.trim()) {
        setLoading(false);
        setErrorMsg('网页开发环境中，请输入微信小程序得到的真实 wx.login() code 提交至后端请求');
        return;
      }
      try {
        const data = await api.wechatLogin(wxCode.trim());
        saveStoredToken(data.token);
        setCurrentOpenId(data.openid);
        setStep('success');
        setTimeout(() => {
          onLoginSuccess(data.user);
          onClose();
        }, 1000);
      } catch (err: any) {
        setErrorMsg(err.message || '微信静默登录失败');
      } finally {
        setLoading(false);
      }
    }
  };

  // 2. Real Phone Number Authorization via WeChat <button open-type="getPhoneNumber">
  const handleGetPhoneNumber = async (e: any) => {
    setErrorMsg(null);
    setLoading(true);

    const detail = e?.detail || {};
    const codeFromWx = detail.code;

    if (!codeFromWx) {
      setLoading(false);
      if (detail.errMsg && detail.errMsg.includes('deny')) {
        setErrorMsg('您拒绝了手机号快捷授权');
      } else {
        setErrorMsg('未获取到微信手机号授权 code 凭证 (网页环境请在下面输入框粘贴真实 getPhoneNumber code 测试)');
      }
      return;
    }

    try {
      const data = await api.wechatGetPhone(codeFromWx, currentOpenId || undefined);
      setStep('success');
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || '微信手机号解密验证失败');
    } finally {
      setLoading(false);
    }
  };

  // 3. Web Manual Phone Code Authorization Submission
  const handleWebPhoneCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneCode.trim()) {
      setErrorMsg('请输入微信 getPhoneNumber 事件返回的真实 phoneCode');
      return;
    }
    setErrorMsg(null);
    setLoading(true);
    try {
      const data = await api.wechatGetPhone(phoneCode.trim(), currentOpenId || undefined);
      setStep('success');
      setTimeout(() => {
        onLoginSuccess(data.user);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || '微信手机号获取失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FDFBF7] w-full max-w-md rounded-2xl shadow-2xl border border-[#D9CDB8] overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#8B5A2B] to-[#B83B26] text-white p-5 flex items-center justify-between">
          <div>
            <h2 className="font-serif font-bold text-lg">数字族谱·微信官方授权中心</h2>
            <p className="text-xs text-white/80 mt-0.5">微信静默登录与手机号组件授权</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex border-b border-[#E8DFD1] bg-white">
          <button
            type="button"
            onClick={() => {
              setLoginMode('wechat');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              loginMode === 'wechat'
                ? 'text-[#07C160] border-b-2 border-[#07C160] bg-[#07C160]/5 font-bold'
                : 'text-gray-500 hover:text-[#1A1A1A]'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>微信静默登录 (wx.login)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginMode('phone');
              setErrorMsg(null);
            }}
            className={`flex-1 py-3 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
              loginMode === 'phone'
                ? 'text-[#8B5A2B] border-b-2 border-[#8B5A2B] bg-[#8B5A2B]/5 font-bold'
                : 'text-gray-500 hover:text-[#1A1A1A]'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>手机号组件授权 (getPhoneNumber)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {/* Prominent Error Banner when AppID/Secret unconfigured or request fails */}
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div className="leading-relaxed font-medium">{errorMsg}</div>
            </div>
          )}

          {step === 'success' ? (
            <div className="py-8 flex flex-col items-center text-center space-y-3">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#1A1A1A]">微信真实授权成功！</h3>
              <p className="text-xs text-gray-500">已保存 Token 并建立安全身份认证...</p>
            </div>
          ) : loginMode === 'wechat' ? (
            <div className="space-y-4">
              <div className="p-4 bg-white border border-[#E8DFD1] rounded-xl flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#07C160]/10 text-[#07C160] flex items-center justify-center">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">微信静默登录</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    系统将调用原生的 <code className="bg-gray-100 px-1 py-0.5 rounded text-[#8B5A2B]">wx.login()</code> 获取临时 code 并向后端换取真实 openid 与 JWT Token
                  </p>
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleNativeWxLogin}
                  className="w-full py-3 bg-[#07C160] hover:bg-[#06ad56] text-white font-serif font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  {loading ? '正在通信换取 Token...' : '执行真实 wx.login() 静默登录'}
                </button>
              </div>

              {/* Web Environment Debug Input */}
              <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Web/H5 环境 Code 调试通道:</span>
                </div>
                <input
                  type="text"
                  placeholder="请输入真实的 wx.login() code"
                  value={wxCode}
                  onChange={(e) => setWxCode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#D9CDB8] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#8B5A2B]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-white border border-[#E8DFD1] rounded-xl flex flex-col items-center text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-[#8B5A2B]/10 text-[#8B5A2B] flex items-center justify-center">
                  <Smartphone className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1A1A1A]">微信手机号组件授权</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    使用微信官方组件按钮获取加密 code，由后端解密出真实 11 位手机号码
                  </p>
                </div>

                {/* WeChat Official Component Button */}
                {/* Note: React renders open-type and bindgetphonenumber attributes for WeChat Mini Program runtime */}
                <button
                  type="button"
                  {...({
                    'open-type': 'getPhoneNumber',
                    bindgetphonenumber: handleGetPhoneNumber,
                  } as any)}
                  onClick={handleGetPhoneNumber}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-[#8B5A2B] to-[#B83B26] text-white font-serif font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-50"
                >
                  {loading ? '正在解密手机号...' : '授权微信绑定真实手机号'}
                </button>
              </div>

              {/* Web Environment Phone Code Manual Submission */}
              <form onSubmit={handleWebPhoneCodeSubmit} className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-800">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Web/H5 环境 getPhoneNumber Code 调试通道:</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="粘贴 getPhoneNumber code"
                    value={phoneCode}
                    onChange={(e) => setPhoneCode(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white border border-[#D9CDB8] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#8B5A2B]"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 py-2 bg-[#8B5A2B] text-white font-bold text-xs rounded-lg shrink-0"
                  >
                    验证
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="text-[10px] text-gray-400 text-center leading-normal">
            微信开放平台认证协议 | 后端自动从环境变量读取 AppID 与 Secret
          </div>
        </div>
      </div>
    </div>
  );
};
