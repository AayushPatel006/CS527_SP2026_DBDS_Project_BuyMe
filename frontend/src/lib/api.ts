/**
 * API Service Layer
 * Replace these mock implementations with real Flask API calls.
 * Base URL can be configured via environment variable.
 */

import { mockNotifications } from './mock-data';
import type { User, Item, Bid, Category, CategoryField, Question, Notification, Alert, AuthState, AssistantBidPlan } from '@/types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// Simulated delay
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

// ---- AUTH ----
let currentUser: User | null = null;

export const api = {
  auth: {
    async login(username: string, password: string): Promise<User> {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Invalid credentials');
      }
      currentUser = data as User;
      localStorage.setItem('buyme_user', JSON.stringify(currentUser));
      return currentUser;
    },
    async register(username: string, email: string, password: string, role: 'buyer' | 'seller' = 'buyer'): Promise<User> {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Registration failed');
      }
      currentUser = data as User;
      localStorage.setItem('buyme_user', JSON.stringify(currentUser));
      return currentUser;
    },
    async logout(): Promise<void> {
      currentUser = null;
      localStorage.removeItem('buyme_user');
    },
    getSession(): AuthState {
      if (!currentUser) {
        const stored = localStorage.getItem('buyme_user');
        if (stored) currentUser = JSON.parse(stored);
      }
      return { user: currentUser, isAuthenticated: !!currentUser };
    },
  },

  items: {
    async list(filters?: { category_id?: number; search?: string; status?: string }): Promise<Item[]> {
      const params = new URLSearchParams();
      if (filters?.category_id) params.set('category_id', String(filters.category_id));
      if (filters?.search) params.set('search', filters.search);
      if (filters?.status) params.set('status', filters.status);

      const query = params.toString();
      const response = await fetch(`${API_BASE}/items${query ? `?${query}` : ''}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load items');
      }

      return data as Item[];
    },
    async get(id: number): Promise<Item> {
      const response = await fetch(`${API_BASE}/item/${id}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Item not found');
      }
      return data as Item;
    },
    async create(data: Partial<Item>): Promise<Item> {
      const response = await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result?.error || `Failed to create item (HTTP ${response.status})`);
      }
      return result as Item;
    },
  },

  bids: {
    async listByItem(itemId: number): Promise<Bid[]> {
      const response = await fetch(`${API_BASE}/item/${itemId}/bids`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load bids');
      }
      return data as Bid[];
    },
    async place(itemId: number, amount: number, autoBidLimit?: number, isAuto = false): Promise<Bid> {
      if (!currentUser?.id) {
        throw new Error('You must be signed in to place a bid');
      }

      const response = await fetch(`${API_BASE}/item/${itemId}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidder_id: currentUser.id,
          amount,
          auto_bid_limit: autoBidLimit,
          is_auto: isAuto,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || `Failed to place bid (HTTP ${response.status})`);
      }

      return data as Bid;
    },
  },

  categories: {
    async list(): Promise<Category[]> {
      const response = await fetch(`${API_BASE}/categories`);
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load categories');
      }
      return data as Category[];
    },
    async getFields(categoryId: number): Promise<CategoryField[]> {
      const response = await fetch(`${API_BASE}/categories/${categoryId}/fields`);
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load category fields');
      }
      return data as CategoryField[];
    },
  },

  home: {
    async stats(): Promise<{ active_auctions: number; verified_sellers: number; vehicles_listed: number }> {
      const response = await fetch(`${API_BASE}/stats/home`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load home stats');
      }
      return data as { active_auctions: number; verified_sellers: number; vehicles_listed: number };
    },
  },

  assistant: {
    async planBid(query: string): Promise<AssistantBidPlan> {
      const response = await fetch(`${API_BASE}/assistant/bid-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to plan bid');
      }
      return data as AssistantBidPlan;
    },
  },

  questions: {
    async list(filters?: { user_id?: number; item_id?: number; unanswered?: boolean }): Promise<Question[]> {
      const params = new URLSearchParams();
      if (filters?.user_id) params.set('user_id', String(filters.user_id));
      if (filters?.item_id) params.set('item_id', String(filters.item_id));
      if (filters?.unanswered) params.set('unanswered', 'true');

      const query = params.toString();
      const response = await fetch(`${API_BASE}/questions${query ? `?${query}` : ''}`);
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load questions');
      }
      return data as Question[];
    },
    async ask(questionText: string, itemId?: number): Promise<Question> {
      if (!currentUser?.id) {
        throw new Error('You must be signed in to ask a question');
      }

      const response = await fetch(`${API_BASE}/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.id,
          item_id: itemId,
          question_text: questionText,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to submit question');
      }

      return data as Question;
    },
    async answer(questionId: number, answerText: string): Promise<Question> {
      if (!currentUser?.id) {
        throw new Error('You must be signed in to answer questions');
      }

      const response = await fetch(`${API_BASE}/questions/${questionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rep_id: currentUser.id,
          answer_text: answerText,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to submit answer');
      }

      return data as Question;
    },
  },

  notifications: {
    async list(): Promise<Notification[]> {
      if (!currentUser?.id) {
        return [];
      }

      const response = await fetch(`${API_BASE}/notifications?user_id=${currentUser.id}`);
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load notifications');
      }
      return data as Notification[];
    },
    async markRead(id: number): Promise<void> {
      if (!currentUser?.id) {
        throw new Error('You must be signed in');
      }

      const response = await fetch(`${API_BASE}/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.id }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to mark notification as read');
      }
    },
  },

  admin: {
    async createRep(username: string, email: string, password: string): Promise<User> {
      const response = await fetch(`${API_BASE}/admin/reps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to create rep');
      }
      return data as User;
    },
    async getSalesReport() {
      const response = await fetch(`${API_BASE}/admin/sales-report`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load sales report');
      }
      return data;
    },
    async listUsers(): Promise<User[]> {
      const response = await fetch(`${API_BASE}/admin/users`);
      const data = await response.json().catch(() => []);
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load users');
      }
      return data as User[];
    },
    async getStats(): Promise<{ total_users: number; active_auctions: number; total_items: number; total_bids: number; sold_items: number }> {
      const response = await fetch(`${API_BASE}/admin/stats`);
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error || 'Failed to load admin stats');
      }
      return data as { total_users: number; active_auctions: number; total_items: number; total_bids: number; sold_items: number };
    },
  },
};
