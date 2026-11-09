'use client';

import React from 'react';
import { RefreshCw, ShieldCheck, AlertCircle, Calendar, User, LogOut } from 'lucide-react';
import { AuthUser } from '@/lib/auth';

interface NavbarProps {
  accountName?: string;
  accountId?: string;
  currency?: string;
  accountStatus?: number;
  datePreset: string;
  onDatePresetChange: (preset: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
  currentUser?: AuthUser | null;
  onLogout?: () => void;
}

const DATE_OPTIONS = [
  { value: 'today', label: 'Hôm nay' },
  { value: 'yesterday', label: 'Hôm qua' },
  { value: 'last_7d', label: '7 ngày qua' },
  { value: 'last_14d', label: '14 ngày qua' },
  { value: 'last_30d', label: '30 ngày qua' },
  { value: 'this_month', label: 'Tháng này' },
  { value: 'maximum', label: 'Toàn bộ thời gian' },
];

export const Navbar: React.FC<NavbarProps> = ({
  accountName,
  accountId,
  currency = 'VND',
  accountStatus,
  datePreset,
  onDatePresetChange,
  onRefresh,
  isLoading,
  currentUser,
  onLogout,
}) => {
  const isAccountActive = accountStatus === 1;

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Account info */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20 font-bold text-white text-lg">
              M
            </div>
            <div>
              <span className="text-white font-bold text-base tracking-wide flex items-center gap-1.5">
                Meta Ads Manager
                <span className="text-[10px] font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
                  Pro
                </span>
              </span>
              <p className="text-xs text-slate-400">1 Tài khoản duy nhất</p>
            </div>
          </div>

          {/* Account Details Badge */}
          {accountId && (
            <div className="hidden lg:flex items-center space-x-2 pl-4 border-l border-slate-800">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-200">
                  {accountName || 'Tài khoản Quảng cáo'}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {accountId} ({currency})
                </span>
              </div>

              {accountStatus !== undefined && (
                <span
                  className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    isAccountActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {isAccountActive ? (
                    <>
                      <ShieldCheck className="w-3 h-3" /> Hoạt động
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3 h-3" /> Bị vô hiệu hoá
                    </>
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* User Badge */}
          {currentUser && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/80 border border-slate-700 rounded-lg text-xs">
              <User className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-slate-200">
                {currentUser.displayName}
              </span>
            </div>
          )}

          {/* Date Selector */}
          <div className="flex items-center bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <select
              value={datePreset}
              onChange={(e) => onDatePresetChange(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {DATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-slate-800 text-slate-200">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            title="Làm mới dữ liệu"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-lg text-xs font-medium transition disabled:opacity-50 shadow-sm shadow-blue-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              title="Đăng xuất / Đổi mật khẩu"
              className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-rose-900/30 hover:border-rose-500/50 hover:text-rose-300 border border-slate-700 text-slate-400 rounded-lg text-xs font-medium transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thoát</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
