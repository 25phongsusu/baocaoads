import crypto from 'crypto';

export interface MetaConfig {
  accessToken: string;
  appSecret?: string;
  adAccountId: string;
  apiVersion?: string;
}

export interface AdCreativeInfo {
  id?: string;
  name?: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  postUrl?: string;
  instagramUrl?: string;
  effectiveObjectStoryId?: string;
  objectStoryId?: string;
}

export interface AdInsights {
  spend: number;
  impressions: number;
  reach: number;
  clicks: number;
  cpc: number;
  cpm: number;
  ctr: number;
  results: number;
  costPerResult: number;
  resultType: string;
}

export interface AdItem {
  id: string;
  name: string;
  status: 'ACTIVE' | 'PAUSED' | string;
  effectiveStatus: string;
  campaignId: string;
  campaignName: string;
  campaignStatus: 'ACTIVE' | 'PAUSED' | string;
  adsetId: string;
  adsetName: string;
  budget?: {
    daily?: number;
    lifetime?: number;
  };
  creative: AdCreativeInfo;
  insights?: AdInsights;
  updatedTime?: string;
}

export interface AccountOverview {
  id: string;
  name: string;
  accountStatus: number;
  currency: string;
  timezoneName: string;
  amountSpent: number;
  balance?: number;
}

export function getMetaConfig(): MetaConfig {
  const accessToken = process.env.META_ACCESS_TOKEN || '';
  let adAccountId = process.env.META_AD_ACCOUNT_ID || '';
  const appSecret = process.env.META_APP_SECRET || '';
  const apiVersion = process.env.META_GRAPH_API_VERSION || 'v21.0';

  if (adAccountId && !adAccountId.startsWith('act_')) {
    adAccountId = `act_${adAccountId}`;
  }

  return {
    accessToken,
    appSecret,
    adAccountId,
    apiVersion,
  };
}

const ZERO_DECIMAL_CURRENCIES = ['VND', 'JPY', 'KRW', 'CLP', 'PYG', 'UGX', 'VUV'];

export function parseCurrencyAmount(amount: string | number | undefined, currency: string = 'VND'): number {
  if (amount === undefined || amount === null) return 0;
  const num = Number(amount);
  if (isNaN(num)) return 0;
  return ZERO_DECIMAL_CURRENCIES.includes(currency.toUpperCase()) ? num : num / 100;
}

export function getAppSecretProof(accessToken: string, appSecret?: string): string | undefined {
  if (!appSecret || !accessToken) return undefined;
  return crypto.createHmac('sha256', appSecret).update(accessToken).digest('hex');
}

function buildGraphUrl(endpoint: string, params: Record<string, string> = {}): string {
  const config = getMetaConfig();
  const url = new URL(`https://graph.facebook.com/${config.apiVersion}/${endpoint}`);

  url.searchParams.set('access_token', config.accessToken);

  const proof = getAppSecretProof(config.accessToken, config.appSecret);
  if (proof) {
    url.searchParams.set('appsecret_proof', proof);
  }

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

/**
 * Xử lý link bài viết thực tế đang chạy trên Facebook hoặc Instagram
 */
export function extractPostUrl(creative: any): { postUrl?: string; instagramUrl?: string } {
  if (!creative) return {};

  const effectiveStoryId = creative.effective_object_story_id || creative.object_story_id;
  const instagramUrl = creative.instagram_permalink_url;
  let postUrl: string | undefined = undefined;

  if (effectiveStoryId) {
    if (effectiveStoryId.includes('_')) {
      const [pageId, postId] = effectiveStoryId.split('_');
      // Link chuẩn Facebook: mở đúng bài viết kèm bình luận
      postUrl = `https://www.facebook.com/permalink.php?story_fbid=${postId}&id=${pageId}`;
    } else {
      postUrl = `https://www.facebook.com/${effectiveStoryId}`;
    }
  } else if (creative.object_story_spec?.link_data?.link) {
    postUrl = creative.object_story_spec.link_data.link;
  }

  return {
    postUrl,
    instagramUrl,
  };
}

/**
 * Lấy thông tin tài khoản quảng cáo
 */
export async function getAdAccountInfo(): Promise<AccountOverview | null> {
  const config = getMetaConfig();
  if (!config.accessToken || !config.adAccountId) return null;

  const url = buildGraphUrl(config.adAccountId, {
    fields: 'id,name,account_status,currency,timezone_name,amount_spent,balance',
  });

  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Lỗi khi lấy thông tin tài khoản quảng cáo');
  }

  const currency = data.currency || 'VND';

  return {
    id: data.id,
    name: data.name,
    accountStatus: data.account_status,
    currency,
    timezoneName: data.timezone_name,
    amountSpent: parseCurrencyAmount(data.amount_spent, currency),
    balance: data.balance ? parseCurrencyAmount(data.balance, currency) : undefined,
  };
}

/**
 * Bóc tách chỉ số Insights từ Meta API
 */
function parseInsights(insightItem: any): AdInsights {
  if (!insightItem) {
    return {
      spend: 0,
      impressions: 0,
      reach: 0,
      clicks: 0,
      cpc: 0,
      cpm: 0,
      ctr: 0,
      results: 0,
      costPerResult: 0,
      resultType: 'Kết quả',
    };
  }

  const spend = Number(insightItem.spend || 0);
  const impressions = Number(insightItem.impressions || 0);
  const reach = Number(insightItem.reach || 0);
  const clicks = Number(insightItem.clicks || 0);
  const cpc = Number(insightItem.cpc || 0);
  const cpm = Number(insightItem.cpm || 0);
  const ctr = Number(insightItem.ctr || 0);

  // Tìm kết quả chính (Tin nhắn, Chuyển đổi mua hàng, hoặc Lead)
  let results = 0;
  let resultType = 'Kết quả';
  let costPerResult = 0;

  if (Array.isArray(insightItem.actions)) {
    // Ưu tiên tin nhắn
    const msgAction = insightItem.actions.find((a: any) =>
      a.action_type === 'onsite_conversion.messaging_conversation_started_7d' ||
      a.action_type === 'messaging_conversation_started_7d'
    );
    // Ưu tiên mua hàng (purchase)
    const purchaseAction = insightItem.actions.find((a: any) =>
      a.action_type === 'purchase' || a.action_type === 'omni_purchase'
    );
    // Ưu tiên Lead
    const leadAction = insightItem.actions.find((a: any) =>
      a.action_type === 'lead' || a.action_type === 'onsite_conversion.lead_grouped'
    );
    // Link click
    const linkClickAction = insightItem.actions.find((a: any) => a.action_type === 'link_click');

    if (msgAction) {
      results = Number(msgAction.value);
      resultType = 'Cuộc trò chuyện';
    } else if (purchaseAction) {
      results = Number(purchaseAction.value);
      resultType = 'Lượt mua hàng';
    } else if (leadAction) {
      results = Number(leadAction.value);
      resultType = 'Khách hàng tiềm năng';
    } else if (linkClickAction) {
      results = Number(linkClickAction.value);
      resultType = 'Lượt click link';
    } else if (insightItem.actions.length > 0) {
      results = Number(insightItem.actions[0].value);
      resultType = insightItem.actions[0].action_type;
    }
  }

  if (results > 0 && spend > 0) {
    costPerResult = spend / results;
  }

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
    resultType,
  };
}

/**
 * Lấy danh sách Ads kèm đầy đủ Creative (Link bài viết) và Insights
 */
export async function getAdsList(datePreset: string = 'today'): Promise<AdItem[]> {
  const config = getMetaConfig();
  if (!config.accessToken || !config.adAccountId) return [];

  const fields = [
    'id',
    'name',
    'status',
    'effective_status',
    'updated_time',
    'campaign{id,name,status}',
    'adset{id,name,status,daily_budget,lifetime_budget}',
    'creative{id,name,title,body,image_url,thumbnail_url,object_story_id,effective_object_story_id,instagram_permalink_url,object_story_spec}',
    `insights.date_preset(${datePreset}){spend,impressions,reach,clicks,cpc,cpm,ctr,actions,cost_per_action_type}`,
  ].join(',');

  const url = buildGraphUrl(`${config.adAccountId}/ads`, {
    fields,
    limit: '100',
  });

  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Lỗi khi lấy danh sách quảng cáo');
  }

  const ads: AdItem[] = (data.data || []).map((ad: any) => {
    const creative = ad.creative || {};
    const { postUrl, instagramUrl } = extractPostUrl(creative);
    const insightData = ad.insights?.data?.[0];

    return {
      id: ad.id,
      name: ad.name,
      status: ad.status,
      effectiveStatus: ad.effective_status,
      updatedTime: ad.updated_time,
      campaignId: ad.campaign?.id || '',
      campaignName: ad.campaign?.name || 'Không rõ',
      campaignStatus: ad.campaign?.status || ad.status,
      adsetId: ad.adset?.id || '',
      adsetName: ad.adset?.name || 'Không rõ',
      budget: {
        daily: ad.adset?.daily_budget ? parseCurrencyAmount(ad.adset.daily_budget, 'VND') : undefined,
        lifetime: ad.adset?.lifetime_budget ? parseCurrencyAmount(ad.adset.lifetime_budget, 'VND') : undefined,
      },
      creative: {
        id: creative.id,
        name: creative.name,
        title: creative.title || creative.object_story_spec?.link_data?.name,
        body: creative.body || creative.object_story_spec?.link_data?.message,
        imageUrl: creative.image_url || creative.thumbnail_url || creative.object_story_spec?.link_data?.picture,
        thumbnailUrl: creative.thumbnail_url,
        postUrl,
        instagramUrl,
        effectiveObjectStoryId: creative.effective_object_story_id,
        objectStoryId: creative.object_story_id,
      },
      insights: parseInsights(insightData),
    };
  });

  return ads;
}

/**
 * Bật/Tắt Quảng cáo, Nhóm hoặc Chiến dịch (ACTIVE ⟷ PAUSED)
 */
export async function toggleObjectStatus(
  objectId: string,
  newStatus: 'ACTIVE' | 'PAUSED'
): Promise<{ success: boolean; id: string; status: string }> {
  const config = getMetaConfig();
  if (!config.accessToken) {
    throw new Error('Chưa cấu hình Access Token');
  }

  const endpointUrl = buildGraphUrl(objectId);

  const res = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: newStatus,
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(data.error.message || `Không thể đổi trạng thái sang ${newStatus}`);
  }

  return {
    success: data.success ?? true,
    id: objectId,
    status: newStatus,
  };
}

/**
 * Lấy báo cáo tổng quan toàn tài khoản theo khoảng thời gian
 */
export async function getAccountTotalInsights(datePreset: string = 'today'): Promise<AdInsights> {
  const config = getMetaConfig();
  if (!config.accessToken || !config.adAccountId) {
    return parseInsights(null);
  }

  const url = buildGraphUrl(`${config.adAccountId}/insights`, {
    fields: 'spend,impressions,reach,clicks,cpc,cpm,ctr,actions,cost_per_action_type',
    date_preset: datePreset,
  });

  const res = await fetch(url, { cache: 'no-store' });
  const data = await res.json();

  if (data.error) {
    console.error('Lỗi khi lấy báo cáo tổng:', data.error);
    return parseInsights(null);
  }

  const insightData = data.data?.[0];
  return parseInsights(insightData);
}
