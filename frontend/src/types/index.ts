export type UserRole = 'buyer' | 'seller' | 'rep' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  parent_id: number | null;
  level: 'root' | 'sub' | 'leaf';
}

export interface CategoryField {
  id: number;
  category_id: number;
  field_name: string;
  field_type: 'text' | 'number' | 'boolean' | 'date';
  is_required: boolean;
}

export interface Item {
  id: number;
  seller_id: number;
  category_id: number;
  title: string;
  description: string;
  starting_price: number;
  reserve_price?: number;
  bid_increment: number;
  closes_at: string;
  status: 'active' | 'closed' | 'cancelled';
  created_at: string;
  current_bid?: number;
  bid_count?: number;
  image_url?: string;
  seller_username?: string;
  category_name?: string;
  field_values?: Record<string, string>;
}

export interface Bid {
  id: number;
  item_id: number;
  bidder_id: number;
  amount: number;
  auto_bid_limit?: number;
  is_auto: boolean;
  placed_at: string;
  removed_by?: number;
  removed_at?: string;
  bidder_username?: string;
}

export interface AuctionResult {
  id: number;
  item_id: number;
  winner_id: number | null;
  final_price: number;
  resolved_at: string;
}

export interface Alert {
  id: number;
  user_id: number;
  category_id?: number;
  keyword?: string;
  max_price?: number;
  is_active: boolean;
  created_at: string;
}

export interface Question {
  id: number;
  user_id: number;
  item_id?: number;
  rep_id?: number;
  item_title?: string;
  question_text: string;
  answer_text?: string;
  asked_at: string;
  answered_at?: string;
  user_username?: string;
  rep_username?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  item_id?: number;
  type: 'outbid' | 'auto_limit_exceeded' | 'auction_won' | 'auction_closed' | 'alert_match' | 'question_answered';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface SalesReport {
  total_earnings: number;
  earnings_by_item: { item_title: string; earnings: number }[];
  earnings_by_type: { category_name: string; earnings: number }[];
  earnings_by_user: { username: string; earnings: number }[];
  best_selling_items: { item_title: string; sold_count: number }[];
  best_buyers: { username: string; total_spent: number }[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export interface AssistantBidPlan {
  query: string;
  strategy: string;
  match_quality: 'exact' | 'closest';
  explanation: string;
  recommended_bid: number;
  budget?: number;
  min_year?: number;
  categories: string[];
  item: Item;
}
