import { NextRequest, NextResponse } from 'next/server';
import { getAdAccountInfo, getAccountTotalInsights } from '@/lib/meta';

export async function GET(request: NextRequest) {
  try {
    const datePreset = request.nextUrl.searchParams.get('datePreset') || 'today';

    const [account, totalInsights] = await Promise.all([
      getAdAccountInfo(),
      getAccountTotalInsights(datePreset),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        account,
        insights: totalInsights,
      },
    });
  } catch (error: any) {
    console.error('API Overview Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Lỗi khi tải thông tin tài khoản',
      },
      { status: 500 }
    );
  }
}
