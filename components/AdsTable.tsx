'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  Power,
  Search,
  Filter,
  Image as ImageIcon,
  MessageCircle,
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Layers,
} from 'lucide-react';

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

import { AdItem } from '@/lib/meta';

interface AdsTableProps {
  ads: AdItem[];
  currency?: string;
  onToggleStatus: (id: string, campaignId: string, newStatus: 'ACTIVE' | 'PAUSED') => Promise<void>;
  isLoading: boolean;
  accountId?: string;
}

export const AdsTable: React.FC<AdsTableProps> = ({
  ads,
  currency = 'VND',
  onToggleStatus,
  isLoading,
  accountId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

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

  const isCampaignActive = (ad: AdItem) => {
    return (
      ad.campaignStatus === 'ACTIVE' &&
      ad.effectiveStatus !== 'CAMPAIGN_PAUSED' &&
      ad.status === 'ACTIVE'
    );
  };

  const handleToggle = async (ad: AdItem) => {
    const currentActive = isCampaignActive(ad);
    const nextStatus = currentActive ? 'PAUSED' : 'ACTIVE';
    try {
      setUpdatingId(ad.campaignId || ad.id);
      await onToggleStatus(ad.id, ad.campaignId, nextStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  // Lọc dữ liệu theo tên chiến dịch & Ưu tiên chiến dịch ĐANG BẬT / HOẠT ĐỘNG lên đầu
  const filteredAds = ads
    .filter((ad) => {
      const matchSearch =
        ad.campaignName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ad.adsetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ad.creative.body && ad.creative.body.toLowerCase().includes(searchQuery.toLowerCase()));

      const active = isCampaignActive(ad);
      const matchStatus =
        statusFilter === 'ALL'
          ? true
          : statusFilter === 'ACTIVE'
          ? active
          : !active;

      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      const aActive = isCampaignActive(a) ? 1 : 0;
      const bActive = isCampaignActive(b) ? 1 : 0;
      // 1. Ưu tiên BẬT / ĐANG HOẠT ĐỘNG lên đầu
      if (bActive !== aActive) {
        return bActive - aActive;
      }
      // 2. Cùng trạng thái thì ưu tiên chiến dịch có chi tiêu (spend) cao hơn
      const aSpend = a.insights?.spend || 0;
      const bSpend = b.insights?.spend || 0;
      return bSpend - aSpend;
    });

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
      {/* Search and Filters Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên chiến dịch, nội dung bài viết..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center space-x-2">
          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                statusFilter === 'ALL'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả ({ads.length})
            </button>
            <button
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                statusFilter === 'ACTIVE'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Đang chạy ({ads.filter((a) => isCampaignActive(a)).length})
            </button>
            <button
              onClick={() => setStatusFilter('PAUSED')}
              className={`px-3 py-1.5 rounded-md font-medium transition ${
                statusFilter === 'PAUSED'
                  ? 'bg-slate-700 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Tạm dừng ({ads.filter((a) => !isCampaignActive(a)).length})
            </button>
          </div>
        </div>
      </div>

      {/* Table container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase font-semibold text-[11px] tracking-wider">
              <th className="py-3 px-4 w-16 text-center">Bật/Tắt</th>
              <th className="py-3 px-4 min-w-[320px]">Tên Chiến Dịch & Bài Viết</th>
              <th className="py-3 px-4 min-w-[140px]">Link Bài Viết</th>
              <th className="py-3 px-4 text-right">Chi tiêu</th>
              <th className="py-3 px-4 text-right">Kết quả</th>
              <th className="py-3 px-4 text-right">CPR</th>
              <th className="py-3 px-4 text-right">Clicks / CTR</th>
              <th className="py-3 px-4 text-right">CPC / CPM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {isLoading && ads.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Loader2 className="w-7 h-7 text-blue-500 animate-spin" />
                    <span>Đang kết nối Meta API và tải danh sách chiến dịch...</span>
                  </div>
                </td>
              </tr>
            ) : filteredAds.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Filter className="w-8 h-8 text-slate-600" />
                    <span className="font-medium text-slate-300">Không tìm thấy chiến dịch nào</span>
                    <span className="text-slate-500 text-[11px]">
                      Thử thay đổi từ khoá tìm kiếm hoặc bộ lọc trạng thái
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredAds.map((ad) => {
                const active = isCampaignActive(ad);
                const isUpdating = updatingId === (ad.campaignId || ad.id);
                const insights = ad.insights;
                const creative = ad.creative;
                const postUrl = creative.postUrl;
                const instagramUrl = creative.instagramUrl;

                return (
                  <tr
                    key={ad.id}
                    className={`hover:bg-slate-800/40 transition group ${
                      !active ? 'opacity-70 bg-slate-950/20' : ''
                    }`}
                  >
                    {/* BẬT / TẮT SWITCH BUTTON CHO CHIẾN DỊCH */}
                    <td className="py-3.5 px-4 text-center align-middle">
                      <button
                        onClick={() => handleToggle(ad)}
                        disabled={isUpdating}
                        title={active ? 'Bấm để TẠM DỪNG chiến dịch' : 'Bấm để BẬT CHIẾN DỊCH'}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                          active ? 'bg-emerald-500' : 'bg-slate-700'
                        } ${isUpdating ? 'opacity-50 cursor-wait' : ''}`}
                      >
                        <span className="sr-only">Toggle campaign status</span>
                        {isUpdating ? (
                          <span className="flex items-center justify-center w-5 h-5">
                            <Loader2 className="w-3 h-3 text-white animate-spin" />
                          </span>
                        ) : (
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              active ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        )}
                      </button>
                      <div className="text-[10px] font-semibold mt-1">
                        {active ? (
                          <span className="text-emerald-400">BẬT</span>
                        ) : (
                          <span className="text-slate-400">TẮT</span>
                        )}
                      </div>
                    </td>

                    {/* HIỂN THỊ THEO TÊN CHIẾN DỊCH (CORE REQUIREMENT) */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex items-start space-x-3">
                        {/* Thumbnail ảnh bài viết */}
                        <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0 flex items-center justify-center group-hover:border-slate-600 transition">
                          {creative.imageUrl || creative.thumbnailUrl ? (
                            <img
                              src={creative.imageUrl || creative.thumbnailUrl}
                              alt={ad.campaignName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-6 h-6 text-slate-500" />
                          )}
                        </div>

                        {/* Tên Chiến Dịch to rõ & Thông tin bổ trợ */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* TÊN CHIẾN DỊCH TO ĐẬM */}
                            <span className="font-bold text-white text-sm sm:text-base hover:text-blue-400 transition cursor-default tracking-tight">
                              {ad.campaignName}
                            </span>
                            {/* Status badge */}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                active
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}
                            >
                              {active ? 'Đang chạy' : 'Đã tạm dừng'}
                            </span>
                          </div>

                          {/* Nhóm & Tên bài viết */}
                          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="bg-slate-800/80 px-1.5 py-0.5 rounded text-slate-300">
                              Nhóm: {ad.adsetName}
                            </span>
                            {ad.budget?.daily ? (
                              <span className="text-amber-400 font-mono text-[10px]">
                                Ngân sách: {formatMoney(ad.budget.daily)}/ngày
                              </span>
                            ) : null}
                          </div>

                          {/* Caption snippet bài viết */}
                          {creative.body && (
                            <p className="text-[11px] text-slate-400 line-clamp-1 mt-1 italic">
                              "{creative.body}"
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* LINK BÀI VIẾT ĐANG CHẠY */}
                    <td className="py-3.5 px-4 align-middle">
                      <div className="flex flex-col space-y-1.5">
                        {postUrl ? (
                          <a
                            href={postUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 hover:border-blue-400 rounded-lg text-xs font-medium transition shadow-sm"
                          >
                            <FacebookIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>Mở bài viết FB</span>
                            <ExternalLink className="w-3 h-3 shrink-0 ml-auto" />
                          </a>
                        ) : null}

                        {instagramUrl ? (
                          <a
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-pink-600/20 hover:bg-pink-600/30 text-pink-400 border border-pink-500/30 hover:border-pink-400 rounded-lg text-xs font-medium transition shadow-sm"
                          >
                            <InstagramIcon className="w-3.5 h-3.5 shrink-0" />
                            <span>Mở Instagram</span>
                            <ExternalLink className="w-3 h-3 shrink-0 ml-auto" />
                          </a>
                        ) : null}

                        {!postUrl && !instagramUrl ? (
                          <div className="text-[11px] text-slate-500 italic">
                            Chưa tìm thấy link post
                          </div>
                        ) : null}

                        {/* ID bài viết */}
                        {creative.effectiveObjectStoryId && (
                          <span
                            className="text-[10px] font-mono text-slate-500 truncate"
                            title={`Story ID: ${creative.effectiveObjectStoryId}`}
                          >
                            ID: {creative.effectiveObjectStoryId}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* CHI TIÊU */}
                    <td className="py-3.5 px-4 text-right align-middle font-semibold text-slate-100">
                      {formatMoney(insights?.spend)}
                    </td>

                    {/* KẾT QUẢ */}
                    <td className="py-3.5 px-4 text-right align-middle">
                      <div className="font-bold text-slate-100">
                        {formatNumber(insights?.results)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {insights?.resultType || 'Kết quả'}
                      </div>
                    </td>

                    {/* CHI PHÍ / KẾT QUẢ (CPR) */}
                    <td className="py-3.5 px-4 text-right align-middle">
                      <div className="font-semibold text-blue-400">
                        {insights?.results && insights.results > 0
                          ? formatMoney(insights.costPerResult)
                          : '-'}
                      </div>
                      <div className="text-[10px] text-slate-500">mỗi kết quả</div>
                    </td>

                    {/* CLICKS / CTR */}
                    <td className="py-3.5 px-4 text-right align-middle">
                      <div className="font-medium text-slate-200">
                        {formatNumber(insights?.clicks)} clicks
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-400">
                        CTR: {insights?.ctr ? insights.ctr.toFixed(2) + '%' : '0.00%'}
                      </div>
                    </td>

                    {/* CPC / CPM */}
                    <td className="py-3.5 px-4 text-right align-middle text-slate-300">
                      <div>CPC: {formatMoney(insights?.cpc)}</div>
                      <div className="text-[10px] text-slate-400">
                        CPM: {formatMoney(insights?.cpm)}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
