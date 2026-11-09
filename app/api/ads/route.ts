import { NextRequest, NextResponse } from 'next/server';
import { getAdsList } from '@/lib/meta';

export async function GET(request: NextRequest) {
  try {
    const datePreset = request.nextUrl.searchParams.get('datePreset') || 'today';

    const ads = await getAdsList(datePreset);
    return NextResponse.json({
      success: true,
      data: ads,
    });
  } catch (error: any) {
    console.error('API Ads Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Lỗi khi tải danh sách quảng cáo',
      },
      { status: 500 }
    );
  }
}
