// Datos mock para la administración de la tienda

// Generar datos de ventas para los últimos 30 días
const generateSalesData = (days = 30) => {
  const salesData = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // Generar ventas aleatorias (más altas los fines de semana)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const baseAmount = isWeekend ? 2500 : 1800;
    const variation = Math.random() * 1000;

    salesData.push({
      date: date.toISOString().split('T')[0],
      amount: Math.round(baseAmount + variation),
      orders: Math.round((baseAmount + variation) / 150), // Promedio de $150 por orden
      customers: Math.round(((baseAmount + variation) / 150) * 0.8), // Algunos clientes hacen múltiples compras
    });
  }

  return salesData;
};

// Datos de productos más vendidos
export const topSellingProducts = [
  {
    id: 1,
    name: "iPhone 14 Pro Max 128GB",
    category: "Electrónicos",
    unitsSold: 245,
    revenue: 293755.55,
    image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=100"
  },
  {
    id: 4,
    name: "MacBook Air M2 13\" 256GB",
    category: "Computadoras",
    unitsSold: 189,
    revenue: 226798.11,
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=100"
  },
  {
    id: 6,
    name: "Sony WH-1000XM5 Auriculares",
    category: "Audio",
    unitsSold: 312,
    revenue: 109196.88,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100"
  },
  {
    id: 12,
    name: "Smart TV Samsung 55\" 4K QLED",
    category: "Electrónicos",
    unitsSold: 156,
    revenue: 124799.44,
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=100"
  },
  {
    id: 9,
    name: "AirPods Pro 2ª Generación",
    category: "Audio",
    unitsSold: 423,
    revenue: 105747.77,
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=100"
  }
];

// Datos de inventario con alertas de stock bajo
export const inventoryAlerts = [
  {
    id: 3,
    name: "PlayStation 5 Console",
    currentStock: 3,
    minStock: 5,
    category: "Gaming",
    price: 499.99,
    status: "critical", // critical, warning, low
    lastRestocked: "2024-01-10"
  },
  {
    id: 11,
    name: "Bicicleta Montaña Trek X-Caliber 7",
    currentStock: 4,
    minStock: 5,
    category: "Deportes",
    price: 899.99,
    status: "critical",
    lastRestocked: "2024-01-05"
  },
  {
    id: 10,
    name: "Robot Aspiradora Roomba i7+",
    currentStock: 5,
    minStock: 8,
    category: "Hogar",
    price: 599.99,
    status: "warning",
    lastRestocked: "2024-01-12"
  },
  {
    id: 8,
    name: "Dell XPS 13 i7 16GB",
    currentStock: 7,
    minStock: 10,
    category: "Computadoras",
    price: 1299.99,
    status: "low",
    lastRestocked: "2024-01-08"
  }
];

// Datos de descuentos activos
export const activeDiscounts = [
  {
    id: "DCT001",
    name: "Descuento AMD Ryzen 5",
    productId: 1,
    productName: "AMD Ryzen 5 5600G",
    discountPercentage: 20,
    startDate: "2024-01-15T00:00:00Z",
    endDate: "2024-01-25T23:59:59Z",
    isActive: true,
    createdBy: "Admin",
    usageCount: 45
  },
  {
    id: "DCT002",
    name: "iPhone 14 Pro Oferta",
    productId: 2,
    productName: "iPhone 14 Pro Max 128GB",
    discountPercentage: 8,
    startDate: "2024-01-10T00:00:00Z",
    endDate: "2024-01-28T23:59:59Z",
    isActive: true,
    createdBy: "Admin",
    usageCount: 23
  },
  {
    id: "DCT003",
    name: "MacBook Air Promoción",
    productId: 4,
    productName: "MacBook Air M2 13\" 256GB",
    discountPercentage: 14,
    startDate: "2024-01-18T00:00:00Z",
    endDate: "2024-01-24T23:59:59Z",
    isActive: true,
    createdBy: "Admin",
    usageCount: 12
  },
  {
    id: "DCT004",
    name: "Sony Auriculares Descuento",
    productId: 6,
    productName: "Sony WH-1000XM5 Auriculares",
    discountPercentage: 13,
    startDate: "2024-01-20T00:00:00Z",
    endDate: "2024-01-22T23:59:59Z",
    isActive: true,
    createdBy: "Admin",
    usageCount: 67
  }
];

// Estadísticas del dashboard
export const dashboardStats = {
  totalRevenue: {
    today: 3450.75,
    week: 18965.22,
    month: 89456.88,
    year: 1025678.99
  },
  totalOrders: {
    today: 23,
    week: 156,
    month: 695,
    year: 8247
  },
  totalCustomers: {
    today: 18,
    week: 124,
    month: 567,
    year: 6834,
    new: 45 // Nuevos clientes este mes
  },
  averageOrderValue: {
    today: 150.03,
    week: 121.57,
    month: 128.79,
    year: 124.32
  },
  productsSold: {
    today: 45,
    week: 289,
    month: 1245,
    year: 14567
  },
  conversionRate: {
    today: 2.8,
    week: 3.2,
    month: 2.9,
    year: 3.1
  }
};

// Datos de ventas por categoría
export const salesByCategory = [
  {
    category: "Electrónicos",
    revenue: 356789.45,
    percentage: 35.2,
    growth: "+12.5%"
  },
  {
    category: "Computadoras",
    revenue: 298456.78,
    percentage: 29.4,
    growth: "+8.7%"
  },
  {
    category: "Audio",
    revenue: 145623.89,
    percentage: 14.3,
    growth: "+15.2%"
  },
  {
    category: "Gaming",
    revenue: 98745.67,
    percentage: 9.7,
    growth: "+6.8%"
  },
  {
    category: "Hogar",
    revenue: 76543.21,
    percentage: 7.5,
    growth: "+4.3%"
  },
  {
    category: "Deportes",
    revenue: 38976.54,
    percentage: 3.9,
    growth: "+2.1%"
  }
];

// Generar ID único para productos
let productIdCounter = 1;
export const generateProductId = () => {
  const id = productIdCounter.toString().padStart(6, '0');
  productIdCounter++;
  return `PRD${id}`;
};

// Generar ID único para descuentos
let discountIdCounter = 1;
export const generateDiscountId = () => {
  const id = discountIdCounter.toString().padStart(3, '0');
  discountIdCounter++;
  return `DCT${id}`;
};

// Generar ID único para categorías
let categoryIdCounter = 7; // Empezamos desde 7 porque ya hay 6 categorías
export const generateCategoryId = () => {
  return categoryIdCounter++;
};

// Generar ID único para usuarios
let userIdCounter = 3; // Empezamos desde 3 porque ya hay 2 usuarios mock
export const generateUserId = () => {
  return userIdCounter++;
};

// Datos de usuarios para CRUD
export const mockUsersData = [
  {
    id: 1,
    name: "Administrador Principal",
    email: "admin@tienda.com",
    role: "admin",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    createdAt: "2024-01-01T10:00:00Z",
    lastLogin: "2024-01-20T15:30:00Z",
    orders: 0,
    totalSpent: 0
  },
  {
    id: 2,
    name: "Juan Pérez",
    email: "juan.perez@email.com",
    role: "user",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    createdAt: "2024-01-05T14:20:00Z",
    lastLogin: "2024-01-19T09:15:00Z",
    orders: 12,
    totalSpent: 2450.75
  },
  {
    id: 3,
    name: "María González",
    email: "maria.gonzalez@email.com",
    role: "user",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150",
    createdAt: "2024-01-08T11:45:00Z",
    lastLogin: "2024-01-20T16:22:00Z",
    orders: 8,
    totalSpent: 1876.90
  },
  {
    id: 4,
    name: "Carlos Rodriguez",
    email: "carlos.rodriguez@email.com",
    role: "user",
    status: "inactive",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    createdAt: "2024-01-12T09:30:00Z",
    lastLogin: "2024-01-15T14:10:00Z",
    orders: 3,
    totalSpent: 567.50
  },
  {
    id: 5,
    name: "Ana Martínez",
    email: "ana.martinez@email.com",
    role: "user",
    status: "active",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    createdAt: "2024-01-15T16:00:00Z",
    lastLogin: "2024-01-20T10:30:00Z",
    orders: 15,
    totalSpent: 3245.80
  }
];

// Datos de órdenes/pedidos
export const ordersData = [
  {
    id: "ORD001",
    userId: 2,
    userName: "Juan Pérez",
    userEmail: "juan.perez@email.com",
    status: "delivered", // pending, processing, shipped, delivered, cancelled
    total: 1199.99,
    items: [
      { productId: 2, productName: "iPhone 14 Pro Max 128GB", quantity: 1, price: 1199.99 }
    ],
    shippingAddress: "Calle 123, Ciudad, País",
    paymentMethod: "credit_card",
    createdAt: "2024-01-18T10:30:00Z",
    updatedAt: "2024-01-20T14:22:00Z"
  },
  {
    id: "ORD002",
    userId: 3,
    userName: "María González",
    userEmail: "maria.gonzalez@email.com",
    status: "shipped",
    total: 449.98,
    items: [
      { productId: 6, productName: "Sony WH-1000XM5 Auriculares", quantity: 1, price: 349.99 },
      { productId: 9, productName: "AirPods Pro 2ª Generación", quantity: 1, price: 249.99 }
    ],
    shippingAddress: "Avenida 456, Ciudad, País",
    paymentMethod: "paypal",
    createdAt: "2024-01-19T15:45:00Z",
    updatedAt: "2024-01-20T09:10:00Z"
  }
];

// Exportar datos de ventas generados
export const salesData = generateSalesData();

// Función para obtener estadísticas de tiempo real
export const getRealTimeStats = () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Simular datos en tiempo real
  return {
    ...dashboardStats,
    lastUpdate: now.toISOString(),
    onlineUsers: Math.floor(Math.random() * 50) + 10,
    cartAbandonment: Math.floor(Math.random() * 15) + 65, // 65-80%
    serverStatus: "online",
    totalProducts: 156,
    totalCategories: 6,
    lowStockProducts: inventoryAlerts.filter(item => item.status === 'critical').length,
    activeDiscounts: activeDiscounts.length
  };
};

// Función para obtener alertas del sistema
export const getSystemAlerts = () => {
  const alerts = [];

  // Alertas de stock bajo
  inventoryAlerts.forEach(item => {
    if (item.status === 'critical') {
      alerts.push({
        id: `stock_${item.id}`,
        type: 'stock',
        severity: 'high',
        title: 'Stock crítico',
        message: `${item.name} tiene solo ${item.currentStock} unidades disponibles`,
        timestamp: new Date().toISOString()
      });
    }
  });

  // Alertas de descuentos próximos a vencer
  activeDiscounts.forEach(discount => {
    const endDate = new Date(discount.endDate);
    const now = new Date();
    const hoursRemaining = (endDate - now) / (1000 * 60 * 60);

    if (hoursRemaining < 24 && hoursRemaining > 0) {
      alerts.push({
        id: `discount_${discount.id}`,
        type: 'discount',
        severity: 'medium',
        title: 'Descuento próximo a vencer',
        message: `El descuento "${discount.name}" vence en ${Math.floor(hoursRemaining)} horas`,
        timestamp: new Date().toISOString()
      });
    }
  });

  return alerts;
};
