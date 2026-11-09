'use client';

import React from 'react';
import { KeyRound, ShieldAlert, CheckCircle, ExternalLink, HelpCircle } from 'lucide-react';

export const SetupGuide: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto my-12 p-8 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl text-slate-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
          <KeyRound className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Chưa cấu hình Token & Tài khoản Meta
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Chỉ cần 3 thông số trong file <code className="text-blue-400 bg-slate-800 px-1 py-0.5 rounded">.env.local</code> để kích hoạt web
          </p>
        </div>
      </div>

      <div className="space-y-4 text-xs leading-relaxed">
        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm mb-2">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
              1
            </span>
            <span>Mở hoặc tạo file .env.local trong thư mục dự án</span>
          </div>
          <p className="text-slate-400 mb-3">
            Dán nội dung sau vào file <code className="text-slate-300 font-mono">.env.local</code>:
          </p>
          <pre className="p-3 bg-slate-900 rounded-lg font-mono text-[11px] text-emerald-400 border border-slate-800 overflow-x-auto select-all">
{`# 1. Access Token có quyền ads_read, ads_management
META_ACCESS_TOKEN=EAAB...

# 2. App Secret của Meta App
META_APP_SECRET=a1b2c3...

# 3. ID Tài khoản quảng cáo (bắt đầu bằng act_)
META_AD_ACCOUNT_ID=act_1234567890

# 4. Phiên bản API
META_GRAPH_API_VERSION=v21.0`}
          </pre>
        </div>

        <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs">
              2
            </span>
            <span>Cách lấy 3 thông số trên trên Meta</span>
          </div>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-300">
            <li>
              <strong>ID Tài khoản quảng cáo:</strong> Vào{' '}
              <a
                href="https://adsmanager.facebook.com"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
              >
                Trình quản lý quảng cáo <ExternalLink className="w-3 h-3" />
              </a>
              , nhìn lên thanh địa chỉ (URL) tìm đoạn <code className="text-amber-400">act=123456789</code>.
            </li>
            <li>
              <strong>Access Token & App Secret:</strong> Lấy từ{' '}
              <a
                href="https://developers.facebook.com/tools/explorer/"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline inline-flex items-center gap-0.5"
              >
                Graph API Explorer <ExternalLink className="w-3 h-3" />
              </a>{' '}
              hoặc Cài đặt Ứng dụng &gt; Cài đặt cơ bản &gt; Khóa bí mật của ứng dụng (App Secret).
            </li>
          </ul>
        </div>

        <div className="p-3.5 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-2.5 text-blue-300">
          <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Sau khi bạn gửi token & secret code hoặc điền vào <code className="font-semibold text-white">.env.local</code>, chỉ cần bấm <strong>Làm mới</strong> hoặc F5 là hệ thống sẽ tự động đồng bộ toàn bộ quảng cáo và link bài viết ngay lập tức!
          </span>
        </div>
      </div>
    </div>
  );
};
