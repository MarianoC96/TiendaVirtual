import db from './db';
import bcrypt from 'bcryptjs';

// Seed categories - Personalized products
const categories = [
  { name: "Tazas Personalizadas", icon: "☕", slug: "tazas-personalizadas", description: "Tazas con tu diseño único" },
  { name: "Polos Personalizados", icon: "👕", slug: "polos-personalizados", description: "Camisetas con tu estilo" },
  { name: "Cuadernos Personalizados", icon: "📓", slug: "cuadernos-personalizados", description: "Cuadernos con portada única" },
  { name: "Vasos Térmicos", icon: "🥤", slug: "vasos-termicos", description: "Mantén tu bebida caliente o fría" },
  { name: "Sets de Regalo", icon: "🎁", slug: "sets-regalo", description: "Combos perfectos para regalar" },
  { name: "Corporativo", icon: "🏢", slug: "corporativo", description: "Soluciones para empresas" }
];

// Seed products - Cups, T-Shirts, Notebooks
const products = [
  // CUPS
  {
    name: "Taza Personalizada Clásica 11oz",
    category: "tazas-personalizadas",
    category_id: 1,
    price: 25.00,
    original_price: 30.00,
    discount_percentage: 17,
    discount_end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    in_stock: 1,
    stock: 100,
    rating: 4.9,
    review_count: 328,
    description: "Nuestra taza clásica de cerámica de 11oz perfecta para personalizar con fotos, logos o mensajes especiales. Apta para microondas y lavavajillas.",
    short_description: "Taza cerámica 11oz personalizable",
    image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500",
    is_featured: 1,
    is_on_sale: 1,
    total_sold: 328,
    customizable: 1,
    product_type: "cup",
    template_image: "/templates/cup-template.png"
  },
  {
    name: "Taza Mágica Cambio de Color",
    category: "tazas-personalizadas",
    category_id: 1,
    price: 35.00,
    original_price: null,
    discount_percentage: 0,
    discount_end_date: null,
    in_stock: 1,
    stock: 75,
    rating: 4.7,
    review_count: 89,
    description: "¡Sorprende a todos! Esta taza revela tu diseño personalizado cuando viertes una bebida caliente.",
    short_description: "Taza que revela tu diseño con calor",
    image_url: "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=500",
    is_featured: 1,
    is_on_sale: 0,
    total_sold: 89,
    customizable: 1,
    product_type: "cup",
    template_image: "/templates/cup-magic-template.png"
  },
  // T-SHIRTS
  {
    name: "Polo Personalizado Algodón Premium",
    category: "polos-personalizados",
    category_id: 2,
    price: 45.00,
    original_price: 55.00,
    discount_percentage: 18,
    discount_end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    in_stock: 1,
    stock: 200,
    rating: 4.8,
    review_count: 156,
    description: "Polo de algodón 100% pima de alta calidad. Disponible en tallas S, M, L, XL. Impresión full color que no se decolora.",
    short_description: "Polo algodón personalizable",
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    is_featured: 1,
    is_on_sale: 1,
    total_sold: 156,
    customizable: 1,
    product_type: "tshirt",
    template_image: "/templates/tshirt-template.png"
  },
  {
    name: "Polo Negro Básico Personalizado",
    category: "polos-personalizados",
    category_id: 2,
    price: 42.00,
    original_price: null,
    discount_percentage: 0,
    discount_end_date: null,
    in_stock: 1,
    stock: 150,
    rating: 4.6,
    review_count: 98,
    description: "Polo negro de algodón ideal para diseños claros y vibrantes. Tallas S-XL disponibles.",
    short_description: "Polo negro personalizable",
    image_url: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500",
    is_featured: 0,
    is_on_sale: 0,
    total_sold: 98,
    customizable: 1,
    product_type: "tshirt",
    template_image: "/templates/tshirt-black-template.png"
  },
  // NOTEBOOKS
  {
    name: "Cuaderno A5 Tapa Dura Personalizada",
    category: "cuadernos-personalizados",
    category_id: 3,
    price: 28.00,
    original_price: 35.00,
    discount_percentage: 20,
    discount_end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    in_stock: 1,
    stock: 80,
    rating: 4.9,
    review_count: 67,
    description: "Cuaderno A5 con 120 hojas rayadas y tapa dura personalizable con tu foto o diseño favorito.",
    short_description: "Cuaderno A5 tapa personalizable",
    image_url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500",
    is_featured: 1,
    is_on_sale: 1,
    total_sold: 67,
    customizable: 1,
    product_type: "notebook",
    template_image: "/templates/notebook-template.png"
  },
  {
    name: "Cuaderno Ejecutivo Premium",
    category: "cuadernos-personalizados",
    category_id: 3,
    price: 38.00,
    original_price: null,
    discount_percentage: 0,
    discount_end_date: null,
    in_stock: 1,
    stock: 50,
    rating: 4.8,
    review_count: 45,
    description: "Cuaderno ejecutivo con acabado premium, elástico de cierre y bolsillo interior. Ideal para regalo corporativo.",
    short_description: "Cuaderno ejecutivo personalizable",
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500",
    is_featured: 0,
    is_on_sale: 0,
    total_sold: 45,
    customizable: 1,
    product_type: "notebook",
    template_image: "/templates/notebook-executive-template.png"
  },
  // THERMAL
  {
    name: "Vaso Térmico Premium 500ml",
    category: "vasos-termicos",
    category_id: 4,
    price: 48.00,
    original_price: 58.00,
    discount_percentage: 17,
    discount_end_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    in_stock: 1,
    stock: 60,
    rating: 4.8,
    review_count: 112,
    description: "Vaso térmico de acero inoxidable con doble pared. Mantiene bebidas calientes 12h y frías 24h.",
    short_description: "Vaso acero inoxidable personalizable",
    image_url: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=500",
    is_featured: 1,
    is_on_sale: 1,
    total_sold: 112,
    customizable: 1,
    product_type: "cup",
    template_image: "/templates/tumbler-template.png"
  },
  // SETS
  {
    name: "Set Regalo Completo - Taza + Cuaderno",
    category: "sets-regalo",
    category_id: 5,
    price: 65.00,
    original_price: 80.00,
    discount_percentage: 19,
    discount_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    in_stock: 1,
    stock: 40,
    rating: 5.0,
    review_count: 34,
    description: "El regalo perfecto: taza personalizada + cuaderno con el mismo diseño. Incluye caja de regalo premium.",
    short_description: "Set taza + cuaderno personalizable",
    image_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500",
    is_featured: 1,
    is_on_sale: 1,
    total_sold: 34,
    customizable: 1,
    product_type: "set",
    template_image: null
  },
  // CORPORATE
  {
    name: "Pack Corporativo 10 Polos",
    category: "corporativo",
    category_id: 6,
    price: 380.00,
    original_price: 450.00,
    discount_percentage: 16,
    discount_end_date: null,
    in_stock: 1,
    stock: 20,
    rating: 4.7,
    review_count: 28,
    description: "Pack de 10 polos personalizados con el logo de tu empresa. Ideal para uniformes y eventos.",
    short_description: "10 polos con logo corporativo",
    image_url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500",
    is_featured: 0,
    is_on_sale: 1,
    total_sold: 28,
    customizable: 1,
    product_type: "tshirt",
    template_image: "/templates/tshirt-template.png"
  }
];

// Seed coupons with created_by
const coupons = [
  { code: "BIENVENIDO10", name: "Descuento de bienvenida", discount_type: "percentage", discount_value: 10, min_purchase: 0, max_uses: null, active: 1, created_by: 1 },
  { code: "ENVIOGRATIS", name: "Envío gratis", discount_type: "fixed", discount_value: 15, min_purchase: 50, max_uses: 100, active: 1, created_by: 1 },
  { code: "SUPER20", name: "Super descuento 20%", discount_type: "percentage", discount_value: 20, min_purchase: 80, max_uses: 50, active: 1, created_by: 1 }
];

// Admin user
const adminUser = {
  email: "admin@customcups.com",
  password: "admin123",
  name: "Administrador",
  role: "admin"
};

export function seedDatabase() {
  const categoryCount = db.prepare('SELECT COUNT(*) as count FROM categories').get() as { count: number };
  
  if (categoryCount.count === 0) {
    console.log('Seeding database...');
    
    // Insert admin user first
    const hashedPassword = bcrypt.hashSync(adminUser.password, 10);
    db.prepare(`
      INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?)
    `).run(adminUser.email, hashedPassword, adminUser.name, adminUser.role);
    
    // Insert categories
    const insertCategory = db.prepare(`
      INSERT INTO categories (name, icon, slug, description) VALUES (?, ?, ?, ?)
    `);
    
    for (const cat of categories) {
      insertCategory.run(cat.name, cat.icon, cat.slug, cat.description);
    }
    
    // Insert products
    const insertProduct = db.prepare(`
      INSERT INTO products (
        name, category, category_id, price, original_price, discount_percentage,
        discount_end_date, in_stock, stock, rating, review_count, description,
        short_description, image_url, is_featured, is_on_sale, total_sold, customizable,
        product_type, template_image
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    for (const prod of products) {
      insertProduct.run(
        prod.name, prod.category, prod.category_id, prod.price, prod.original_price,
        prod.discount_percentage, prod.discount_end_date, prod.in_stock, prod.stock,
        prod.rating, prod.review_count, prod.description, prod.short_description,
        prod.image_url, prod.is_featured, prod.is_on_sale, prod.total_sold, prod.customizable,
        prod.product_type, prod.template_image
      );
    }

    // Insert coupons with created_by
    const insertCoupon = db.prepare(`
      INSERT INTO coupons (code, name, discount_type, discount_value, min_purchase, max_uses, active, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const coupon of coupons) {
      insertCoupon.run(coupon.code, coupon.name, coupon.discount_type, coupon.discount_value, coupon.min_purchase, coupon.max_uses, coupon.active, coupon.created_by);
    }
    
    console.log('Database seeded successfully!');
  } else {
    console.log('Database already seeded.');
  }
}

seedDatabase();
