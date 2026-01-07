import Database from 'better-sqlite3';
import path from 'path';

// Initialize database
const dbPath = path.join(process.cwd(), 'tienda.db');
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    discount_percentage INTEGER DEFAULT 0,
    discount_end_date TEXT,
    in_stock INTEGER DEFAULT 1,
    stock INTEGER DEFAULT 0,
    rating REAL DEFAULT 5.0,
    review_count INTEGER DEFAULT 0,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    is_featured INTEGER DEFAULT 0,
    is_on_sale INTEGER DEFAULT 0,
    total_sold INTEGER DEFAULT 0,
    customizable INTEGER DEFAULT 1,
    product_type TEXT DEFAULT 'cup',
    template_image TEXT,
    FOREIGN KEY (category_id) REFERENCES categories(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'client',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    guest_email TEXT,
    guest_name TEXT,
    guest_phone TEXT,
    shipping_address TEXT,
    items_json TEXT NOT NULL,
    customization_json TEXT,
    subtotal REAL NOT NULL,
    discount REAL DEFAULT 0,
    total REAL NOT NULL,
    coupon_code TEXT,
    payment_method TEXT,
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    min_purchase REAL DEFAULT 0,
    max_uses INTEGER,
    uses INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    expires_at TEXT,
    created_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    deactivated_by INTEGER,
    deactivated_at TEXT,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (deactivated_by) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS discounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    discount_type TEXT NOT NULL,
    discount_value REAL NOT NULL,
    applies_to TEXT NOT NULL,
    target_id INTEGER NOT NULL,
    start_date TEXT,
    end_date TEXT,
    active INTEGER DEFAULT 1,
    created_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id)
  );
`);

export default db;
