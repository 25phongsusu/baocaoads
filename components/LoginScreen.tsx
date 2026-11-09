'use client';

import React, { useState } from 'react';
import { Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { checkPassword, AuthUser } from '@/lib/auth';

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser, passwordUsed: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const user = checkPassword(password);
    if (!user) {
      setError('Mật khẩu không chính xác! Vui lòng thử lại.');
      return;
    }

    if (rememberDevice) {
      try {
        localStorage.setItem('meta_app_session', password.trim());
        // Lưu Cookie 1 năm để trình duyệt tự động nhớ thiết bị
        document.cookie = `meta_app_session=${encodeURIComponent(password.trim())}; path=/; max-age=31536000; SameSite=Lax`;
      } catch (err) {
        console.error(err);
      }
    }

    onLoginSuccess(user, password.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-7">
        {/* Brand Icon */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-lg font-bold text-white tracking-tight">
            Xác Thực Truy Cập
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Hệ thống Quản lý Quảng cáo Meta
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                autoFocus
                placeholder="Nhập mật khẩu..."
                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Device Option */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberDevice}
                onChange={(e) => setRememberDevice(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-700 text-blue-600 focus:ring-0 focus:ring-offset-0 bg-slate-800 cursor-pointer"
              />
              <span>Tự động nhớ thiết bị này</span>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-500/20 transition cursor-pointer"
          >
            <span>Vào Bảng Điều Khiển</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
