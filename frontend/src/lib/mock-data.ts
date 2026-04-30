import { User, Category, CategoryField, Item, Bid, Question, Notification } from '@/types';

export const mockUsers: User[] = [
  { id: 1, username: 'admin', email: 'admin@buyme.com', role: 'admin', is_active: true, created_at: '2025-01-01T00:00:00' },
  { id: 2, username: 'john_seller', email: 'john@example.com', role: 'seller', is_active: true, created_at: '2025-01-15T00:00:00' },
  { id: 3, username: 'jane_buyer', email: 'jane@example.com', role: 'buyer', is_active: true, created_at: '2025-02-01T00:00:00' },
  { id: 4, username: 'rep_mike', email: 'mike@buyme.com', role: 'rep', is_active: true, created_at: '2025-01-10T00:00:00' },
  { id: 5, username: 'alice_buyer', email: 'alice@example.com', role: 'buyer', is_active: true, created_at: '2025-03-01T00:00:00' },
];

export const mockCategories: Category[] = [
  { id: 1, name: 'Vehicles', parent_id: null, level: 'root' },
  { id: 2, name: 'Cars', parent_id: 1, level: 'sub' },
  { id: 3, name: 'Trucks', parent_id: 1, level: 'sub' },
  { id: 4, name: 'Motorcycles', parent_id: 1, level: 'sub' },
  { id: 5, name: 'Sedans', parent_id: 2, level: 'leaf' },
  { id: 6, name: 'SUVs', parent_id: 2, level: 'leaf' },
  { id: 7, name: 'Sports Cars', parent_id: 2, level: 'leaf' },
  { id: 8, name: 'Pickup Trucks', parent_id: 3, level: 'leaf' },
  { id: 9, name: 'Cruisers', parent_id: 4, level: 'leaf' },
  { id: 10, name: 'Sport Bikes', parent_id: 4, level: 'leaf' },
  { id: 11, name: 'Other', parent_id: null, level: 'leaf' },
];

export const mockCategoryFields: CategoryField[] = [
  { id: 1, category_id: 1, field_name: 'Year', field_type: 'number', is_required: true },
  { id: 2, category_id: 1, field_name: 'Make', field_type: 'text', is_required: true },
  { id: 3, category_id: 1, field_name: 'Model', field_type: 'text', is_required: true },
  { id: 4, category_id: 1, field_name: 'Mileage', field_type: 'number', is_required: true },
  { id: 5, category_id: 1, field_name: 'Color', field_type: 'text', is_required: false },
  { id: 6, category_id: 1, field_name: 'VIN', field_type: 'text', is_required: false },
  { id: 7, category_id: 2, field_name: 'Transmission', field_type: 'text', is_required: true },
  { id: 8, category_id: 2, field_name: 'Fuel Type', field_type: 'text', is_required: true },
  { id: 9, category_id: 4, field_name: 'Engine Size (cc)', field_type: 'number', is_required: true },
];

const futureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const pastDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
};

export const mockItems: Item[] = [
  {
    id: 1, seller_id: 2, category_id: 7, title: '2022 Porsche 911 Carrera S',
    description: 'Stunning Guards Red Porsche 911 with Sport Chrono package, only 8,500 miles. Full dealer service history.',
    starting_price: 85000, reserve_price: 95000, bid_increment: 500,
    closes_at: futureDate(3), status: 'active', created_at: pastDate(5),
    current_bid: 92000, bid_count: 14, image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600',
    seller_username: 'john_seller', category_name: 'Sports Cars',
    field_values: { Year: '2022', Make: 'Porsche', Model: '911 Carrera S', Mileage: '8500', Color: 'Guards Red', Transmission: 'PDK', 'Fuel Type': 'Gasoline' },
  },
  {
    id: 2, seller_id: 2, category_id: 6, title: '2021 Toyota RAV4 Hybrid XSE',
    description: 'Low mileage RAV4 Hybrid with premium audio, panoramic sunroof, and all-weather package.',
    starting_price: 28000, reserve_price: 30000, bid_increment: 200,
    closes_at: futureDate(5), status: 'active', created_at: pastDate(3),
    current_bid: 29500, bid_count: 8, image_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600',
    seller_username: 'john_seller', category_name: 'SUVs',
    field_values: { Year: '2021', Make: 'Toyota', Model: 'RAV4 Hybrid XSE', Mileage: '15200', Color: 'Magnetic Gray', Transmission: 'CVT', 'Fuel Type': 'Hybrid' },
  },
  {
    id: 3, seller_id: 2, category_id: 5, title: '2020 Honda Civic EX Sedan',
    description: 'Well-maintained Civic with Honda Sensing suite, Apple CarPlay, and excellent fuel economy.',
    starting_price: 18000, bid_increment: 100,
    closes_at: futureDate(7), status: 'active', created_at: pastDate(2),
    current_bid: 19200, bid_count: 6, image_url: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=600',
    seller_username: 'john_seller', category_name: 'Sedans',
    field_values: { Year: '2020', Make: 'Honda', Model: 'Civic EX', Mileage: '32000', Color: 'Crystal Black', Transmission: 'CVT', 'Fuel Type': 'Gasoline' },
  },
  {
    id: 4, seller_id: 2, category_id: 8, title: '2023 Ford F-150 Lariat 4x4',
    description: 'Fully loaded F-150 Lariat with PowerBoost hybrid, 360° camera, and towing package.',
    starting_price: 48000, reserve_price: 52000, bid_increment: 500,
    closes_at: futureDate(2), status: 'active', created_at: pastDate(7),
    current_bid: 51000, bid_count: 11, image_url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600',
    seller_username: 'john_seller', category_name: 'Pickup Trucks',
    field_values: { Year: '2023', Make: 'Ford', Model: 'F-150 Lariat', Mileage: '5800', Color: 'Antimatter Blue' },
  },
  {
    id: 5, seller_id: 2, category_id: 10, title: '2021 Kawasaki Ninja ZX-6R',
    description: 'Track-ready supersport with Yoshimura exhaust, frame sliders, and quick-shifter.',
    starting_price: 8500, bid_increment: 100,
    closes_at: futureDate(4), status: 'active', created_at: pastDate(1),
    current_bid: 9200, bid_count: 5, image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600',
    seller_username: 'john_seller', category_name: 'Sport Bikes',
    field_values: { Year: '2021', Make: 'Kawasaki', Model: 'Ninja ZX-6R', Mileage: '4200', Color: 'Lime Green', 'Engine Size (cc)': '636' },
  },
  {
    id: 6, seller_id: 2, category_id: 9, title: '2019 Harley-Davidson Road King',
    description: 'Classic American cruiser with stage 2 kit, saddlebags, and windshield.',
    starting_price: 15000, reserve_price: 17000, bid_increment: 200,
    closes_at: pastDate(1), status: 'closed', created_at: pastDate(14),
    current_bid: 17500, bid_count: 9, image_url: 'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=600',
    seller_username: 'john_seller', category_name: 'Cruisers',
    field_values: { Year: '2019', Make: 'Harley-Davidson', Model: 'Road King', Mileage: '12000', Color: 'Vivid Black', 'Engine Size (cc)': '1746' },
  },
];

export const mockBids: Bid[] = [
  { id: 1, item_id: 1, bidder_id: 3, amount: 86000, is_auto: false, placed_at: pastDate(4), bidder_username: 'jane_buyer' },
  { id: 2, item_id: 1, bidder_id: 5, amount: 88000, is_auto: false, placed_at: pastDate(3), bidder_username: 'alice_buyer' },
  { id: 3, item_id: 1, bidder_id: 3, amount: 90000, auto_bid_limit: 95000, is_auto: false, placed_at: pastDate(2), bidder_username: 'jane_buyer' },
  { id: 4, item_id: 1, bidder_id: 5, amount: 91000, is_auto: false, placed_at: pastDate(1), bidder_username: 'alice_buyer' },
  { id: 5, item_id: 1, bidder_id: 3, amount: 92000, is_auto: true, placed_at: pastDate(1), bidder_username: 'jane_buyer' },
];

export const mockQuestions: Question[] = [
  { id: 1, user_id: 3, item_id: 1, question_text: 'Has this car been in any accidents?', asked_at: pastDate(3), user_username: 'jane_buyer' },
  { id: 2, user_id: 5, question_text: 'How do I set up automatic bidding?', asked_at: pastDate(2), rep_id: 4, answer_text: 'When placing a bid, check the "Enable auto-bid" option and enter your maximum limit.', answered_at: pastDate(1), user_username: 'alice_buyer', rep_username: 'rep_mike' },
];

export const mockNotifications: Notification[] = [
  { id: 1, user_id: 3, item_id: 1, type: 'outbid', message: 'You have been outbid on 2022 Porsche 911 Carrera S', is_read: false, created_at: pastDate(1) },
  { id: 2, user_id: 5, item_id: 1, type: 'auto_limit_exceeded', message: 'Your auto-bid limit has been exceeded on 2022 Porsche 911 Carrera S', is_read: false, created_at: pastDate(1) },
  { id: 3, user_id: 3, item_id: 6, type: 'auction_won', message: 'Congratulations! You won the auction for 2019 Harley-Davidson Road King', is_read: true, created_at: pastDate(1) },
];
