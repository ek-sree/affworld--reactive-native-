export interface EditProfileModalProps {
  isVisible: boolean;
  onClose: () => void;
  initialData: {
    affiliate_id: string;
    profile: string;
    experience: string;
    company_name: string;
    company_address: string;
    trafficSourceCountry: string;
    affiliate_country: string;
    verticals: string[];
    traffic_sources: string[];
    contact_number: string;
    email_id: string;
    website_address: string;
    youtube_channel_link: string;
    pinterest_profile_link: string;
    tiktok_profile_link: string;
    twitter_handle: string;
    linkedin_profile_link: string;
    telegram_channel_link: string;
    snapchat_handle: string;
    reddit_profile_link: string;
    skype_id: string;
  };
  onSave: (data: any) => void;
}
