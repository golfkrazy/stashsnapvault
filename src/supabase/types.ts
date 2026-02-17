export interface Category {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  location: string | null;
  category_id: string | null;
  value: number | null;
  photo_url: string | null;
  photo_path: string | null;
  is_draft: boolean;
  effective_date?: string | null;
  expiration_date?: string | null;
  reminder_enabled?: boolean;
  jurisdiction_city?: string | null;
  jurisdiction_state?: string | null;
  jurisdiction_country?: string | null;
  created_at: string;
  updated_at: string;

  // Optional related data
  category?: Category;
  tags?: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone_number?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  role: 'user' | 'admin';
  subscription_tier: 'free' | 'premium';
  subscription_status: 'active' | 'past_due' | 'canceled' | null;
  created_at: string | null;
}

export interface VaultItem extends Item { } // Alias for compatibility

export interface ItemTag {
  id: string;
  item_id: string;
  tag: string;
  created_at: string;
}

export interface TrashItem {
  id: string;
  user_id: string;
  item_id: string | null;
  item_data: any;
  photo_path: string | null;
  deleted_at: string;
  expires_at: string;
  reason: string | null;
  is_permanent: boolean;
}
