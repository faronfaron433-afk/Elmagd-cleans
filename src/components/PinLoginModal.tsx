import React, { useState } from 'react';
import { Lock, X, AlertCircle, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface PinLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPin: string;
}

export const PinLoginModal: React.FC<PinLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPin,
}) => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === currentPin.trim()) {
      setError(false);
      setPin('');
      setShowPin(false);
      onSuccess();
    } else {
      setError(true);
    }
  };

  const handleQuickKey = (num: string) => {
    if (pin.length < 8) {
      setPin((prev) => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-right">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-400" />
            <h3 className="font-bold text-base">دخول المدير السري</h3>
          </div>
          <button
            onClick={() => {
              setPin('');
              setError(false);
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-slate-800">
              أدخل رمز المرور السري الخاص بالمدير
            </p>
            <p className="text-xs text-slate-500">
              صلاحية تعديل الأسعار وإضافة الأصناف مخصصة للمدير فقط
            </p>
          </div>

          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              inputMode="numeric"
              maxLength={8}
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="••••"
              className="w-full text-center tracking-[0.5em] text-2xl font-bold py-3 pr-10 pl-10 bg-slate-50 border-2 border-slate-200 rounded-xl focus:outline-hidden focus:border-teal-500 focus:bg-white transition-all text-slate-800 tabular-nums"
            />
            <button
              type="button"
              onClick={() => setShowPin(!showPin)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              title={showPin ? 'إخفاء الرمز' : 'إظهار الرمز'}
            >
              {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
            {error && (
              <p className="flex items-center justify-center gap-1.5 mt-2 text-xs text-rose-600 font-bold">
                <AlertCircle className="w-4 h-4" />
                <span>رمز المرور غير صحيح، يرجى المحاولة مرة أخرى</span>
              </p>
            )}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleQuickKey(digit)}
                className="py-3 text-lg font-bold text-slate-800 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 active:scale-95 rounded-xl transition-all cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all cursor-pointer"
            >
              مسح
            </button>
            <button
              type="button"
              onClick={() => handleQuickKey('0')}
              className="py-3 text-lg font-bold text-slate-800 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 active:scale-95 rounded-xl transition-all cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={() => setPin('')}
              className="py-3 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 active:scale-95 rounded-xl transition-all cursor-pointer"
            >
              تفريغ
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={!pin}
              className="flex-1 py-3 px-4 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-5 h-5" />
              <span>دخول</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setPin('');
                setError(false);
                onClose();
              }}
              className="py-3 px-4 border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium rounded-xl transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
