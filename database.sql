-- Creación de Base de Datos
CREATE DATABASE IF NOT EXISTS tienda_online;
USE tienda_online;

-- Tabla de Usuarios
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- En producción esto debe ser hasheado
    role ENUM('admin', 'user') DEFAULT 'user',
    status ENUM('active', 'inactive') DEFAULT 'active',
    avatar VARCHAR(255),
    address TEXT,
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Tabla de Categorías
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    icon VARCHAR(50),
    description TEXT
);

-- Tabla de Productos
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    category_id INT,
    image_url VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    is_on_sale BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Tabla de Descuentos
CREATE TABLE IF NOT EXISTS discounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    product_id INT,
    percentage INT NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Tabla de Pedidos (Orders)
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    total DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    shipping_address TEXT,
    payment_method VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Tabla de Items del Pedido
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT,
    product_id INT,
    quantity INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);

-- SEED DATA (Datos de prueba)

-- Usuarios (Password default: '123456')
INSERT INTO users (name, email, password, role, avatar) VALUES 
('Administrador', 'admin@tienda.com', 'admin123', 'admin', 'https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff'),
('Juan Pérez', 'juan@email.com', 'user123', 'user', 'https://ui-avatars.com/api/?name=Juan+Perez&background=random'),
('Maria Lopez', 'maria@email.com', 'user123', 'user', 'https://ui-avatars.com/api/?name=Maria+Lopez&background=random');

-- Categorías
INSERT INTO categories (name, slug, icon, description) VALUES
('Electrónicos', 'electronicos', '📱', 'Smartphones, tablets y accesorios'),
('Computadoras', 'computadoras', '💻', 'Laptop, Desktop y componentes'),
('Gaming', 'gaming', '🎮', 'Consolas y videojuegos'),
('Audio', 'audio', '🎧', 'Audífonos y parlantes'),
('Hogar', 'hogar', '🏠', 'Artículos para el hogar'),
('Deportes', 'deportes', '⚽', 'Equipamiento deportivo');

-- Productos (Ejemplos)
INSERT INTO products (name, category_id, price, stock, description, image_url, is_featured, is_on_sale) VALUES
('iPhone 14 Pro', 1, 999.99, 10, 'El último iPhone con cámara avanzada', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500', TRUE, TRUE),
('MacBook Air M2', 2, 1199.99, 15, 'Potencia y portabilidad con chip M2', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', TRUE, FALSE),
('PS5 Console', 3, 499.99, 5, 'Consola de nueva generación', 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500', TRUE, FALSE),
('Sony WH-1000XM5', 4, 349.99, 20, 'Audífonos con cancelación de ruido', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', FALSE, TRUE),
('Robot Aspiradora', 5, 299.99, 8, 'Limpieza automatizada para tu hogar', 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500', FALSE, TRUE);

-- Descuentos
INSERT INTO discounts (name, product_id, percentage, start_date, end_date) VALUES
('Oferta de Verano', 1, 10, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY)),
('Flash Sale Auriculares', 4, 15, NOW(), DATE_ADD(NOW(), INTERVAL 2 DAY));

-- Ordenes de Prueba
INSERT INTO orders (user_id, total, status, shipping_address, payment_method) VALUES
(2, 999.99, 'delivered', 'Calle Falsa 123', 'credit_card'),
(3, 499.99, 'processing', 'Avenida Siempre Viva 742', 'paypal');

INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) VALUES
(1, 1, 1, 999.99),
(2, 3, 1, 499.99);
