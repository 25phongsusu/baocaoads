export interface AuthUser {
  role: 'admin' | 'thuong' | 'quynh';
  displayName: string;
  keyword?: string;
}

export function removeVietnameseTones(str: string = ''): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export function checkPassword(password: string): AuthUser | null {
  const cleanPass = password.trim();

  if (cleanPass === 'admin') {
    return {
      role: 'admin',
      displayName: 'Admin',
      keyword: undefined,
    };
  }

  if (cleanPass === 'thuong123') {
    return {
      role: 'thuong',
      displayName: 'Thương',
      keyword: 'thuong',
    };
  }

  if (cleanPass === 'quynh123') {
    return {
      role: 'quynh',
      displayName: 'Quỳnh ila',
      keyword: 'quynh ila',
    };
  }

  return null;
}

export function filterAdsByKeyword(ads: any[], keyword?: string): any[] {
  if (!keyword) return ads;

  const target = removeVietnameseTones(keyword);

  return ads.filter((ad) => {
    // Ưu tiên lọc theo Tên Chiến Dịch (Campaign Name)
    const campaignNorm = removeVietnameseTones(ad.campaignName || '');
    if (campaignNorm.includes(target)) {
      return true;
    }

    // Phụ trợ nếu tên nhóm hoặc quảng cáo có chứa
    const fallbackSpace = removeVietnameseTones(
      [ad.name, ad.adsetName, ad.creative?.name].filter(Boolean).join(' ')
    );
    return fallbackSpace.includes(target);
  });
}
