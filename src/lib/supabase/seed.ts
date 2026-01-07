import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease create a .env.local file with your Supabase credentials.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Seed data
const categories = [
  { name: "Tazas Personalizadas", icon: "☕", slug: "tazas-personalizadas", description: "Tazas con tu diseño único" },
  { name: "Polos Personalizados", icon: "👕", slug: "polos-personalizados", description: "Camisetas con tu estilo" },
  { name: "Cuadernos Personalizados", icon: "📓", slug: "cuadernos-personalizados", description: "Cuadernos con portada única" },
  { name: "Vasos Térmicos", icon: "🥤", slug: "vasos-termicos", description: "Mantén tu bebida caliente o fría" },
  { name: "Sets de Regalo", icon: "🎁", slug: "sets-regalo", description: "Combos perfectos para regalar" },
  { name: "Corporativo", icon: "🏢", slug: "corporativo", description: "Soluciones para empresas" }
];

const products = [
  {
    name: "Taza Personalizada Clásica 11oz",
    category: "tazas-personalizadas",
    category_id: 1,
    price: 25.00,
    original_price: 30.00,
    discount_percentage: 17,
    discount_end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    in_stock: true,
    stock: 100,
    rating: 4.9,
    review_count: 328,
    description: "Nuestra taza clásica de cerámica de 11oz perfecta para personalizar con fotos, logos o mensajes especiales. Apta para microondas y lavavajillas.",
    short_description: "Taza cerámica 11oz personalizable",
    image_url: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500",
    is_featured: true,
    is_on_sale: true,
    total_sold: 328,
    customizable: true,
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
    in_stock: true,
    stock: 75,
    rating: 4.7,
    review_count: 89,
    description: "¡Sorprende a todos! Esta taza revela tu diseño personalizado cuando viertes una bebida caliente.",
    short_description: "Taza que revela tu diseño con calor",
    image_url: "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=500",
    is_featured: true,
    is_on_sale: false,
    total_sold: 89,
    customizable: true,
    product_type: "cup",
    template_image: "/templates/cup-magic-template.png"
  },
  {
    name: "Polo Personalizado Algodón Premium",
    category: "polos-personalizados",
    category_id: 2,
    price: 45.00,
    original_price: 55.00,
    discount_percentage: 18,
    discount_end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    in_stock: true,
    stock: 200,
    rating: 4.8,
    review_count: 156,
    description: "Polo de algodón 100% pima de alta calidad. Disponible en tallas S, M, L, XL. Impresión full color que no se decolora.",
    short_description: "Polo algodón personalizable",
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
    is_featured: true,
    is_on_sale: true,
    total_sold: 156,
    customizable: true,
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
    in_stock: true,
    stock: 150,
    rating: 4.6,
    review_count: 98,
    description: "Polo negro de algodón ideal para diseños claros y vibrantes. Tallas S-XL disponibles.",
    short_description: "Polo negro personalizable",
    image_url: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500",
    is_featured: false,
    is_on_sale: false,
    total_sold: 98,
    customizable: true,
    product_type: "tshirt",
    template_image: "/templates/tshirt-black-template.png"
  },
  {
    name: "Cuaderno A5 Tapa Dura Personalizada",
    category: "cuadernos-personalizados",
    category_id: 3,
    price: 28.00,
    original_price: 35.00,
    discount_percentage: 20,
    discount_end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    in_stock: true,
    stock: 80,
    rating: 4.9,
    review_count: 67,
    description: "Cuaderno A5 con 120 hojas rayadas y tapa dura personalizable con tu foto o diseño favorito.",
    short_description: "Cuaderno A5 tapa personalizable",
    image_url: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500",
    is_featured: true,
    is_on_sale: true,
    total_sold: 67,
    customizable: true,
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
    in_stock: true,
    stock: 50,
    rating: 4.8,
    review_count: 45,
    description: "Cuaderno ejecutivo con acabado premium, elástico de cierre y bolsillo interior. Ideal para regalo corporativo.",
    short_description: "Cuaderno ejecutivo personalizable",
    image_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500",
    is_featured: false,
    is_on_sale: false,
    total_sold: 45,
    customizable: true,
    product_type: "notebook",
    template_image: "/templates/notebook-executive-template.png"
  },
  {
    name: "Vaso Térmico Premium 500ml",
    category: "vasos-termicos",
    category_id: 4,
    price: 48.00,
    original_price: 58.00,
    discount_percentage: 17,
    discount_end_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    in_stock: true,
    stock: 60,
    rating: 4.8,
    review_count: 112,
    description: "Vaso térmico de acero inoxidable con doble pared. Mantiene bebidas calientes 12h y frías 24h.",
    short_description: "Vaso acero inoxidable personalizable",
    image_url: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=500",
    is_featured: true,
    is_on_sale: true,
    total_sold: 112,
    customizable: true,
    product_type: "cup",
    template_image: "/templates/tumbler-template.png"
  },
  {
    name: "Set Regalo Completo - Taza + Cuaderno",
    category: "sets-regalo",
    category_id: 5,
    price: 65.00,
    original_price: 80.00,
    discount_percentage: 19,
    discount_end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    in_stock: true,
    stock: 40,
    rating: 5.0,
    review_count: 34,
    description: "El regalo perfecto: taza personalizada + cuaderno con el mismo diseño. Incluye caja de regalo premium.",
    short_description: "Set taza + cuaderno personalizable",
    image_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500",
    is_featured: true,
    is_on_sale: true,
    total_sold: 34,
    customizable: true,
    product_type: "set",
    template_image: null
  },
  {
    name: "Pack Corporativo 10 Polos",
    category: "corporativo",
    category_id: 6,
    price: 380.00,
    original_price: 450.00,
    discount_percentage: 16,
    discount_end_date: null,
    in_stock: true,
    stock: 20,
    rating: 4.7,
    review_count: 28,
    description: "Pack de 10 polos personalizados con el logo de tu empresa. Ideal para uniformes y eventos.",
    short_description: "10 polos con logo corporativo",
    image_url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=500",
    is_featured: false,
    is_on_sale: true,
    total_sold: 28,
    customizable: true,
    product_type: "tshirt",
    template_image: "/templates/tshirt-template.png"
  }
];

const coupons = [
  { code: "BIENVENIDO10", name: "Descuento de bienvenida", discount_type: "percentage", discount_value: 10, min_purchase: 0, max_uses: null, active: true, created_by: 1 },
  { code: "ENVIOGRATIS", name: "Envío gratis", discount_type: "fixed", discount_value: 15, min_purchase: 50, max_uses: 100, active: true, created_by: 1 },
  { code: "SUPER20", name: "Super descuento 20%", discount_type: "percentage", discount_value: 20, min_purchase: 80, max_uses: 50, active: true, created_by: 1 }
];

const adminUser = {
  email: "admin@customcups.com",
  password: "admin123",
  name: "Administrador",
  role: "admin"
};

async function seedDatabase() {
  console.log('🌱 Seeding database...\n');

  try {
    // Check if already seeded
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (existingCategories && existingCategories.length > 0) {
      console.log('⚠️ Database already seeded. Skipping...');
      console.log('   To reseed, delete all data first.');
      return;
    }

    // Seed admin user
    console.log('👤 Creating admin user...');
    const hashedPassword = bcrypt.hashSync(adminUser.password, 10);
    const { error: userError } = await supabase
      .from('users')
      .insert({
        email: adminUser.email,
        password_hash: hashedPassword,
        name: adminUser.name,
        role: adminUser.role
      });
    
    if (userError) {
      console.error('   ❌ Error creating user:', userError.message);
    } else {
      console.log('   ✅ Admin user created');
    }

    // Seed categories
    console.log('📁 Creating categories...');
    const { error: catError } = await supabase
      .from('categories')
      .insert(categories);
    
    if (catError) {
      console.error('   ❌ Error creating categories:', catError.message);
    } else {
      console.log(`   ✅ ${categories.length} categories created`);
    }

    // Seed products
    console.log('📦 Creating products...');
    const { error: prodError } = await supabase
      .from('products')
      .insert(products);
    
    if (prodError) {
      console.error('   ❌ Error creating products:', prodError.message);
    } else {
      console.log(`   ✅ ${products.length} products created`);
    }

    // Seed coupons
    console.log('🎟️ Creating coupons...');
    const { error: couponError } = await supabase
      .from('coupons')
      .insert(coupons);
    
    if (couponError) {
      console.error('   ❌ Error creating coupons:', couponError.message);
    } else {
      console.log(`   ✅ ${coupons.length} coupons created`);
    }

    console.log('\n✨ Database seeding completed!');
    console.log('\n📧 Admin login:');
    console.log('   Email: admin@customcups.com');
    console.log('   Password: admin123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
