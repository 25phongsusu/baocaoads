'use client';

import React from 'react';
import { DollarSign, Target, Eye, MousePointerClick, TrendingUp } from 'lucide-react';
import { AdInsights } from '@/lib/meta';

interface StatsOverviewProps {
  insights?: AdInsights;
  currency?: string;
  isLoading?: boolean;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  insights,
  currency = 'VND',
  isLoading = false,
}) => {
  const formatMoney = (val?: number) => {
    if (val === undefined || isNaN(val)) return '0 ' + currency;
    if (currency === 'VND') {
      return Math.round(val).toLocaleString('vi-VN') + ' ₫';
    }
    return `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatNumber = (val?: number) => {
    if (val === undefined || isNaN(val)) return '0';
    return val.toLocaleString('vi-VN');
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 bg-slate-800/60 rounded-xl border border-slate-700/50 animate-pulse p-4"
          />
        ))}
      </div>
    );
  }

  const spend = insights?.spend || 0;
  const results = insights?.results || 0;
  const costPerResult = insights?.costPerResult || 0;
  const resultType = insights?.resultType || 'Kết quả';
  const impressions = insights?.impressions || 0;
  const reach = insights?.reach || 0;
  const clicks = insights?.clicks || 0;
  const ctr = insights?.ctr || 0;
  const cpc = insights?.cpc || 0;
  const cpm = insights?.cpm || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Tổng chi tiêu */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Tổng Chi Tiêu</span>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-white tracking-tight">
          {formatMoney(spend)}
        </div>
        <div className="mt-1 flex items-center text-xs text-slate-400">
          <span>Đã chi tiêu trong khoảng thời gian đã chọn</span>
        </div>
      </div>

      {/* 2. Kết quả & Chi phí / kết quả */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">{resultType}</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-white tracking-tight flex items-baseline gap-2">
          <span>{formatNumber(results)}</span>
          <span className="text-xs font-normal text-slate-400">lượt</span>
        </div>
        <div className="mt-1 flex items-center text-xs text-blue-400 font-medium">
          <span>CPR: {formatMoney(costPerResult)} / kết quả</span>
        </div>
      </div>

      {/* 3. Lượt hiển thị & Tiếp cận */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Hiển Thị & Tiếp Cận</span>
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
            <Eye className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-white tracking-tight">
          {formatNumber(impressions)}
        </div>
        <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
          <span>Tiếp cận: {formatNumber(reach)}</span>
          <span className="text-slate-300 font-medium">CPM: {formatMoney(cpm)}</span>
        </div>
      </div>

      {/* 4. Click & Tỷ lệ nhấp (CTR) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-400">Lượt Click & Tỷ lệ nhấp</span>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <MousePointerClick className="w-4 h-4" />
          </div>
        </div>
        <div className="text-xl font-bold text-white tracking-tight flex items-baseline gap-2">
          <span>{formatNumber(clicks)}</span>
          <span className="text-xs font-semibold text-emerald-400">
            (CTR: {ctr.toFixed(2)}%)
          </span>
        </div>
        <div className="mt-1 flex items-center text-xs text-slate-400">
          <span>CPC trung bình: {formatMoney(cpc)} / click</span>
        </div>
      </div>
    </div>
  );
};
