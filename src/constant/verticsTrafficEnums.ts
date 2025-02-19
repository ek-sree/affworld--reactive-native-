export const verticalsEnum = [
    "SWEEPS",
    "SEARCH_ARBITRAGE",
    "LEAD_GEN",
    "DATING",
    "APPS",
    "IGAMING",
    "STREAMING",
    "TRAVEL",
    "CARRIER_BILLING",
    "BIZOPP_OFFERS",
    "ECOM_AFFILIATE_OFFERS",
    "ECOM_STORE_OWNER",
    "CONTENT_MARKETING",
    "COD",
    "GAMING",
    "CONTENT_ARBITRAGE",
    "INSURANCE",
    "CRYPTO",
    "FINANCE",
    "HOME_IMPROVEMENT",
    "HEALTH_AND_BEAUTY",
    "NUTRA",
    "PAYPER_CALL"
  ] as const;
  
  export const trafficSourcesEnum = [
    "SEO",
    "PAID_SEARCH",
    "NATIVE",
    "META_TS_FB_INSTA",
    "YOUTUBE_TS",
    "PINTEREST_TS",
    "TIKTOK_TS",
    "EMAIL_TS",
    "PUSH_TS",
    "DISPLAY_DESK_MOB",
    "TWITTER",
    "LINKEDIN",
    "TELEGRAM",
    "SNAPCHAT",
    "POPS_REDIRECT",
    "SMS",
    "REDDIT",
    "NEWSPAPER"
  ] as const;
  
  export type Vertical = typeof verticalsEnum[number];
  export type TrafficSource = typeof trafficSourcesEnum[number];