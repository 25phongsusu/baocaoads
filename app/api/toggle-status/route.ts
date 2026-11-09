import { NextRequest, NextResponse } from 'next/server';
import { toggleObjectStatus } from '@/lib/meta';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, campaignId, status } = body;

    if (!id || !['ACTIVE', 'PAUSED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Thiếu ID hoặc trạng thái không hợp lệ (chỉ chấp nhận ACTIVE hoặc PAUSED)' },
        { status: 400 }
      );
    }

    // Ưu tiên đổi trạng thái Chiến Dịch (Campaign) trước để đồng bộ
    const targetId = campaignId || id;
    const result = await toggleObjectStatus(targetId, status);

    // Nếu có cả id quảng cáo khác campaignId thì cập nhật luôn ad
    if (campaignId && id && campaignId !== id) {
      await toggleObjectStatus(id, status).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('API Toggle Status Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Lỗi khi cập nhật trạng thái',
      },
      { status: 500 }
    );
  }
}
