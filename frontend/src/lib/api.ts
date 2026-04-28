/**
 * API Service Layer
 * Replace these mock implementations with real Flask API calls.
 * Base URL can be configured via environment variable.
 */

import { mockUsers, mockItems, mockBids, mockCategories, mockCategoryFields, mockQuestions, mockNotifications } from './mock-data';
import type { User, Item, Bid, Category, CategoryField, Question, Notification, Alert, AuthState } from '@/types';

// const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
// Simulated delay
const delay = (ms = 300) => new Promise(r => setTimeout(r, ms));

// ---- AUTH ----
let currentUser: User | null = null;

export const api = {
  auth: {
    async login(username: string, _password: string): Promise<User> {
      await delay();
      const user = mockUsers.find(u => u.username === username);
      if (!user) throw new Error('Invalid credentials');
      currentUser = user;
      localStorage.setItem('buyme_user', JSON.stringify(user));
      return user;
    },
    async register(username: string, email: string, _password: string): Promise<User> {
      await delay();
      const user: User = { id: Date.now(), username, email, role: 'buyer', is_active: true, created_at: new Date().toISOString() };
      currentUser = user;
      localStorage.setItem('buyme_user', JSON.stringify(user));
      return user;
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
    // async list(filters?: { category_id?: number; search?: string; status?: string }): Promise<Item[]> {
    //   await delay();
    //   let items = [...mockItems];
    //   if (filters?.category_id) items = items.filter(i => i.category_id === filters.category_id);
    //   if (filters?.status) items = items.filter(i => i.status === filters.status);
    //   if (filters?.search) {
    //     const q = filters.search.toLowerCase();
    //     items = items.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    //   }
    //   return items;
    // },
    async list(filters?: { category_id?: number; search?: string; status?: string }): Promise<Item[]> {
      const params = new URLSearchParams();

      if (filters?.category_id !== undefined) {
        params.append('category_id', String(filters.category_id));
      }
      if (filters?.search) {
        params.append('search', filters.search);
      }
      if (filters?.status) {
        params.append('status', filters.status);
      }

      const response = await fetch(`${API_BASE}/items?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }
      return response.json();
    },
    async get(id: number): Promise<Item> {
      await delay();
      const item = mockItems.find(i => i.id === id);
      if (!item) throw new Error('Item not found');
      return item;
    },
    async create(data: Partial<Item>): Promise<Item> {
      await delay();
      const item: Item = { id: Date.now(), status: 'active', created_at: new Date().toISOString(), ...data } as Item;
      return item;
    },
  },

  bids: {
    async listByItem(itemId: number): Promise<Bid[]> {
      await delay();
      return mockBids.filter(b => b.item_id === itemId && !b.removed_at).sort((a, b) => b.amount - a.amount);
    },
    async place(itemId: number, amount: number, autoBidLimit?: number): Promise<Bid> {
      await delay();
      const bid: Bid = {
        id: Date.now(), item_id: itemId, bidder_id: currentUser?.id || 0,
        amount, auto_bid_limit: autoBidLimit, is_auto: false,
        placed_at: new Date().toISOString(), bidder_username: currentUser?.username,
      };
      return bid;
    },
  },

  categories: {
    // async list(): Promise<Category[]> {
    //   await delay(100);
    //   return mockCategories;
    // },
    async list(): Promise<Category[]> {
      const response = await fetch(`${API_BASE}/categories`);
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
    async getFields(categoryId: number): Promise<CategoryField[]> {
      await delay(100);
      // Return fields for this category and all parent categories
      const cat = mockCategories.find(c => c.id === categoryId);
      const ids = [categoryId];
      if (cat?.parent_id) {
        ids.push(cat.parent_id);
        const parent = mockCategories.find(c => c.id === cat.parent_id);
        if (parent?.parent_id) ids.push(parent.parent_id);
      }
      return mockCategoryFields.filter(f => ids.includes(f.category_id));
    },
  },

  questions: {
    async list(): Promise<Question[]> {
      await delay();
      return mockQuestions;
    },
    async ask(questionText: string, itemId?: number): Promise<Question> {
      await delay();
      return { id: Date.now(), user_id: currentUser?.id || 0, item_id: itemId, question_text: questionText, asked_at: new Date().toISOString(), user_username: currentUser?.username };
    },
    async answer(questionId: number, answerText: string): Promise<Question> {
      await delay();
      const q = mockQuestions.find(q => q.id === questionId);
      if (!q) throw new Error('Question not found');
      return { ...q, answer_text: answerText, rep_id: currentUser?.id, answered_at: new Date().toISOString() };
    },
  },

  notifications: {
    async list(): Promise<Notification[]> {
      await delay();
      return currentUser ? mockNotifications.filter(n => n.user_id === currentUser!.id) : [];
    },
    async markRead(id: number): Promise<void> { await delay(100); },
  },

  admin: {
    async createRep(username: string, email: string, password: string): Promise<User> {
      await delay();
      return { id: Date.now(), username, email, role: 'rep', is_active: true, created_at: new Date().toISOString() };
    },
    async getSalesReport() {
      await delay();
      return {
        total_earnings: 134500,
        earnings_by_item: [
          { item_title: 'Harley-Davidson Road King', earnings: 17500 },
          { item_title: 'Porsche 911 Carrera S', earnings: 92000 },
        ],
        earnings_by_type: [
          { category_name: 'Sports Cars', earnings: 92000 },
          { category_name: 'Cruisers', earnings: 17500 },
          { category_name: 'SUVs', earnings: 25000 },
        ],
        earnings_by_user: [
          { username: 'jane_buyer', earnings: 109500 },
          { username: 'alice_buyer', earnings: 25000 },
        ],
        best_selling_items: [
          { item_title: 'Porsche 911 Carrera S', sold_count: 1 },
          { item_title: 'Harley-Davidson Road King', sold_count: 1 },
        ],
        best_buyers: [
          { username: 'jane_buyer', total_spent: 109500 },
          { username: 'alice_buyer', total_spent: 25000 },
        ],
      };
    },
    async listUsers(): Promise<User[]> {
      await delay();
      return mockUsers;
    },
  },

  stats: {
    async get(): Promise<{ active_auctions: number; verified_sellers: number; vehicles_listed: number }> {
      const response = await fetch(`${API_BASE}/stats`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      return response.json();
    },
  },
};
