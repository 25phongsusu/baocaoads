'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Navbar } from '@/components/Navbar';
import { StatsOverview } from '@/components/StatsOverview';
import { AdsTable } from '@/components/AdsTable';
import { SetupGuide } from '@/components/SetupGuide';
import { LoginScreen } from '@/components/LoginScreen';
import { AdItem, AdInsights, AccountOverview } from '@/lib/meta';
import { checkPassword, filterAdsByKeyword, AuthUser } from '@/lib/auth';
import { AlertCircle, Shield, Filter } from 'lucide-react';

export default function DashboardPage() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  const [datePreset, setDatePreset] = useState<string>('today');
  const [account, setAccount] = useState<AccountOverview | null>(null);
  const [totalInsights, setTotalInsights] = useState<AdInsights | undefined>(undefined);
  const [ads, setAds] = useState<AdItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSetupNeeded, setIsSetupNeeded] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Khôi phục phiên làm việc tự động (nhớ thiết bị)
  useEffect(() => {
    try {
      let savedPass = localStorage.getItem('meta_app_session') || localStorage.getItem('meta_app_password');

      if (!savedPass && typeof document !== 'undefined') {
        const match = document.cookie.match(/(?:^|;\s*)meta_app_session=([^;]*)/);
        if (match) {
          savedPass = decodeURIComponent(match[1]);
        }
      }

      if (savedPass) {
        const user = checkPassword(savedPass);
        if (user) {
          setCurrentUser(user);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  const handleLoginSuccess = (user: AuthUser, passwordUsed: string) => {
    try {
      localStorage.setItem('meta_app_session', passwordUsed);
      document.cookie = `meta_app_session=${encodeURIComponent(passwordUsed)}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(user);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('meta_app_session');
      localStorage.removeItem('meta_app_password');
      document.cookie = 'meta_app_session=; path=/; max-age=0; SameSite=Lax';
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
  };

  // Load toàn bộ dữ liệu từ API
  const loadData = useCallback(async (preset = datePreset) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Fetch Overview (Account Info & Total Insights)
      const overviewRes = await fetch(`/api/overview?datePreset=${preset}`, { cache: 'no-store' });
      const overviewJson = await overviewRes.json();

      if (!overviewRes.ok || !overviewJson.success) {
        if (
          overviewJson.error?.includes('Chưa cấu hình') ||
          overviewJson.error?.includes('access_token') ||
          overviewJson.error?.includes('An access token is required')
        ) {
          setIsSetupNeeded(true);
          setIsLoading(false);
          return;
        }
        throw new Error(overviewJson.error || 'Lỗi khi tải thông tin tài khoản');
      }

      setAccount(overviewJson.data?.account || null);
      setTotalInsights(overviewJson.data?.insights);

      // 2. Fetch Ads List & Post Links
      const adsRes = await fetch(`/api/ads?datePreset=${preset}`, { cache: 'no-store' });
      const adsJson = await adsRes.json();

      if (!adsRes.ok || !adsJson.success) {
        throw new Error(adsJson.error || 'Lỗi khi tải danh sách quảng cáo');
      }

      setAds(adsJson.data || []);
      setIsSetupNeeded(false);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Không thể kết nối Meta API');
    } finally {
      setIsLoading(false);
    }
  }, [datePreset]);

  useEffect(() => {
    if (currentUser) {
      loadData(datePreset);
    }
  }, [currentUser, datePreset, loadData]);

  // Xử lý bật/tắt chiến dịch 1 click
  const handleToggleStatus = async (id: string, campaignId: string, newStatus: 'ACTIVE' | 'PAUSED') => {
    const originalAds = [...ads];
    setAds((prev) =>
      prev.map((ad) =>
        ad.id === id || (campaignId && ad.campaignId === campaignId)
          ? { ...ad, status: newStatus, campaignStatus: newStatus }
          : ad
      )
    );

    try {
      const res = await fetch('/api/toggle-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, campaignId, status: newStatus }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Cập nhật trạng thái thất bại');
      }
    } catch (err: any) {
      setAds(originalAds);
      alert(`Lỗi khi đổi trạng thái: ${err.message}`);
    }
  };

  // Lọc danh sách Ads theo quyền của User đăng nhập
  const displayedAds = useMemo(() => {
    if (!currentUser || currentUser.role === 'admin') {
      return ads;
    }
    return filterAdsByKeyword(ads, currentUser.keyword);
  }, [ads, currentUser]);

  // Tính toán lại Báo cáo Thống kê cho User đã lọc (Thương hoặc Quỳnh)
  const displayedInsights = useMemo<AdInsights | undefined>(() => {
    if (!currentUser || currentUser.role === 'admin') {
      return totalInsights;
    }

    // Tính tổng chỉ số dựa trên các ads thuộc về user đó
    let spend = 0;
    let impressions = 0;
    let reach = 0;
    let clicks = 0;
    let results = 0;

    for (const ad of displayedAds) {
      if (ad.insights) {
        spend += ad.insights.spend || 0;
        impressions += ad.insights.impressions || 0;
        reach += ad.insights.reach || 0;
        clicks += ad.insights.clicks || 0;
        results += ad.insights.results || 0;
      }
    }

    const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
    const cpc = clicks > 0 ? spend / clicks : 0;
    const cpm = impressions > 0 ? (spend / impressions) * 1000 : 0;
    const costPerResult = results > 0 ? spend / results : 0;

    return {
      spend,
      impressions,
      reach,
      clicks,
      cpc,
      cpm,
      ctr,
      results,
      costPerResult,
      resultType: 'Cuộc trò chuyện',
    };
  }, [currentUser, displayedAds, totalInsights]);

  // Nếu đang kiểm tra phiên đăng nhập
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Nếu chưa đăng nhập -> Hiển thị màn hình nhập mật khẩu
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        accountName={account?.name}
        accountId={account?.id}
        currency={account?.currency || 'VND'}
        accountStatus={account?.accountStatus}
        datePreset={datePreset}
        onDatePresetChange={(preset) => setDatePreset(preset)}
        onRefresh={() => loadData(datePreset)}
        isLoading={isLoading}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isSetupNeeded ? (
          <SetupGuide />
        ) : (
          <>
            {/* Error Banner */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold text-rose-200">Lỗi kết nối Meta API:</span> {errorMessage}
                </div>
                <button
                  onClick={() => loadData(datePreset)}
                  className="underline hover:text-white shrink-0 ml-2"
                >
                  Thử lại
                </button>
              </div>
            )}



            {/* Thống kê Tổng quan (Spend, Kết quả, Impressions, Clicks) */}
            <StatsOverview
              insights={displayedInsights}
              currency={account?.currency || 'VND'}
              isLoading={isLoading}
            />

            {/* Bảng Quản trị Quảng cáo & Bật/Tắt & Link bài viết */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    Danh Sách Chiến Dịch
                    <span className="text-xs font-normal text-slate-400">
                      ({displayedAds.length} chiến dịch {currentUser.role !== 'admin' ? `của ${currentUser.displayName}` : ''})
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">
                    Bấm vào nút gạt để Bật/Tắt chiến dịch tức thì hoặc click mở link bài viết đang chạy trên Facebook
                  </p>
                </div>
              </div>

              <AdsTable
                ads={displayedAds}
                currency={account?.currency || 'VND'}
                onToggleStatus={handleToggleStatus}
                isLoading={isLoading}
                accountId={account?.id}
              />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-[11px] text-slate-500">
        Meta Ads Dashboard • Đăng nhập với quyền: {currentUser.displayName} • Kết nối trực tiếp Meta Marketing API
      </footer>
    </div>
  );
}
