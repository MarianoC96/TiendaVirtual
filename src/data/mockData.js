// Datos mock para la tienda online
export const categories = [
  {
    id: 1,
    name: "Electrónicos",
    icon: "📱",
    slug: "electronicos",
    description: "Smartphones, tablets, laptops y más"
  },
  {
    id: 2,
    name: "Computadoras",
    icon: "💻",
    slug: "computadoras",
    description: "PCs, laptops, componentes y accesorios"
  },
  {
    id: 3,
    name: "Gaming",
    icon: "🎮",
    slug: "gaming",
    description: "Consolas, juegos y accesorios gaming"
  },
  {
    id: 4,
    name: "Audio",
    icon: "🎧",
    slug: "audio",
    description: "Auriculares, parlantes, micrófonos"
  },
  {
    id: 5,
    name: "Hogar",
    icon: "🏠",
    slug: "hogar",
    description: "Electrodomésticos y artículos para el hogar"
  },
  {
    id: 6,
    name: "Deportes",
    icon: "⚽",
    slug: "deportes",
    description: "Equipos deportivos y fitness"
  }
];

export const products = [
  {
    id: 1,
    name: "AMD Ryzen 5 5600G",
    category: "computadoras",
    categoryId: 2,
    price: 199.99,
    originalPrice: 249.99,
    discount: 20,
    discountEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días
    inStock: true,
    stock: 15,
    rating: 4.8,
    reviewCount: 124,
    description: "Procesador AMD Ryzen 5 5600G con gráficos integrados Radeon. Perfecto para gaming casual y productividad.",
    shortDescription: "Procesador 6 núcleos con gráficos integrados",
    features: [
      "6 núcleos, 12 hilos",
      "Velocidad base: 3.9GHz",
      "Boost hasta 4.4GHz",
      "Gráficos Radeon integrados",
      "Socket AM4"
    ],
    images: [
      "https://images.unsplash.com/photo-1555617778-02ba2a6cd2ad?w=500",
      "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=500"
    ],
    tags: ["AMD", "Ryzen", "Procesador", "Gaming"],
    isFeatured: true,
    isOnSale: true
  },
  {
    id: 2,
    name: "iPhone 14 Pro Max 128GB",
    category: "electronicos",
    categoryId: 1,
    price: 1199.99,
    originalPrice: 1299.99,
    discount: 8,
    discountEndTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 días
    inStock: true,
    stock: 8,
    rating: 4.9,
    reviewCount: 256,
    description: "El iPhone 14 Pro Max con Dynamic Island, cámara de 48MP y chip A16 Bionic. La experiencia iPhone más avanzada.",
    shortDescription: "Smartphone premium con cámara profesional",
    features: [
      "Pantalla Super Retina XDR 6.7\"",
      "Chip A16 Bionic",
      "Cámara principal 48MP",
      "Dynamic Island",
      "5G ultra rápido"
    ],
    images: [
      "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500",
      "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=500"
    ],
    tags: ["iPhone", "Apple", "Smartphone", "5G"],
    isFeatured: true,
    isOnSale: true
  },
  {
    id: 3,
    name: "PlayStation 5 Console",
    category: "gaming",
    categoryId: 3,
    price: 499.99,
    originalPrice: null,
    discount: 0,
    inStock: true,
    stock: 3,
    rating: 4.7,
    reviewCount: 189,
    description: "Consola PlayStation 5 con tecnología de próxima generación. Ray tracing, SSD ultra rápido y audio 3D.",
    shortDescription: "Consola de nueva generación",
    features: [
      "SSD de alta velocidad",
      "Ray tracing por hardware",
      "Audio 3D Tempest",
      "Retrocompatible con PS4",
      "Control DualSense incluido"
    ],
    images: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500",
      "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500"
    ],
    tags: ["PlayStation", "PS5", "Gaming", "Console"],
    isFeatured: true,
    isOnSale: false
  },
  {
    id: 4,
    name: "MacBook Air M2 13\" 256GB",
    category: "computadoras",
    categoryId: 2,
    price: 1199.99,
    originalPrice: 1399.99,
    discount: 14,
    discountEndTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días
    inStock: true,
    stock: 12,
    rating: 4.9,
    reviewCount: 342,
    description: "MacBook Air con chip M2, diseño súper delgado y batería de todo el día. Perfecto para trabajar en cualquier lugar.",
    shortDescription: "Laptop ultra delgada con chip M2",
    features: [
      "Chip M2 de Apple",
      "Pantalla Liquid Retina 13.6\"",
      "Hasta 18 horas de batería",
      "Peso solo 1.24 kg",
      "Carga MagSafe"
    ],
    images: [
      "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500"
    ],
    tags: ["MacBook", "Apple", "Laptop", "M2"],
    isFeatured: true,
    isOnSale: true
  },
  {
    id: 5,
    name: "Samsung Galaxy S23 Ultra 256GB",
    category: "electronicos",
    categoryId: 1,
    price: 1149.99,
    originalPrice: null,
    discount: 0,
    inStock: true,
    stock: 20,
    rating: 4.6,
    reviewCount: 178,
    description: "Samsung Galaxy S23 Ultra con S Pen integrado, cámara de 200MP y pantalla Dynamic AMOLED 2X.",
    shortDescription: "Smartphone Android premium con S Pen",
    features: [
      "Pantalla Dynamic AMOLED 6.8\"",
      "Cámara principal 200MP",
      "S Pen integrado",
      "Batería 5000mAh",
      "Procesador Snapdragon 8 Gen 2"
    ],
    images: [
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=500",
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500"
    ],
    tags: ["Samsung", "Galaxy", "Android", "S Pen"],
    isFeatured: false,
    isOnSale: false
  },
  {
    id: 6,
    name: "Sony WH-1000XM5 Auriculares",
    category: "audio",
    categoryId: 4,
    price: 349.99,
    originalPrice: 399.99,
    discount: 13,
    discountEndTime: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 día
    inStock: true,
    stock: 25,
    rating: 4.8,
    reviewCount: 298,
    description: "Auriculares inalámbricos con la mejor cancelación de ruido del mundo y calidad de audio superior.",
    shortDescription: "Auriculares premium con cancelación de ruido",
    features: [
      "Cancelación de ruido líder",
      "30 horas de batería",
      "Carga rápida (3 min = 3 hrs)",
      "Audio de alta resolución",
      "Multipoint conectividad"
    ],
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=500"
    ],
    tags: ["Sony", "Auriculares", "Wireless", "ANC"],
    isFeatured: true,
    isOnSale: true
  },
  {
    id: 7,
    name: "Nintendo Switch OLED",
    category: "gaming",
    categoryId: 3,
    price: 349.99,
    originalPrice: null,
    discount: 0,
    inStock: true,
    stock: 18,
    rating: 4.5,
    reviewCount: 156,
    description: "Nintendo Switch OLED con pantalla vibrante de 7 pulgadas, perfecto para jugar en casa o en movimiento.",
    shortDescription: "Consola híbrida con pantalla OLED",
    features: [
      "Pantalla OLED 7 pulgadas",
      "64GB almacenamiento interno",
      "Dock con puerto LAN",
      "Soporte ajustable mejorado",
      "Audio mejorado"
    ],
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500"
    ],
    tags: ["Nintendo", "Switch", "OLED", "Gaming"],
    isFeatured: false,
    isOnSale: false
  },
  {
    id: 8,
    name: "Dell XPS 13 i7 16GB",
    category: "computadoras",
    categoryId: 2,
    price: 1299.99,
    originalPrice: 1499.99,
    discount: 13,
    discountEndTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 días
    inStock: true,
    stock: 7,
    rating: 4.4,
    reviewCount: 89,
    description: "Dell XPS 13 ultrabook premium con procesador Intel i7, ideal para profesionales y estudiantes.",
    shortDescription: "Ultrabook premium para profesionales",
    features: [
      "Intel Core i7 11ª gen",
      "16GB RAM DDR4",
      "SSD 512GB NVMe",
      "Pantalla InfinityEdge 13.4\"",
      "Peso 1.2 kg"
    ],
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
      "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=500"
    ],
    tags: ["Dell", "XPS", "Intel", "Ultrabook"],
    isFeatured: false,
    isOnSale: true
  },
  {
    id: 9,
    name: "AirPods Pro 2ª Generación",
    category: "audio",
    categoryId: 4,
    price: 249.99,
    originalPrice: null,
    discount: 0,
    inStock: true,
    stock: 30,
    rating: 4.7,
    reviewCount: 445,
    description: "AirPods Pro con cancelación activa de ruido, audio espacial personalizado y estuche MagSafe.",
    shortDescription: "Auriculares inalámbricos con ANC",
    features: [
      "Cancelación activa de ruido",
      "Audio espacial personalizado",
      "Chip H2",
      "Hasta 6 horas de uso",
      "Estuche MagSafe"
    ],
    images: [
      "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=500",
      "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=500"
    ],
    tags: ["AirPods", "Apple", "Wireless", "Pro"],
    isFeatured: true,
    isOnSale: false
  },
  {
    id: 10,
    name: "Robot Aspiradora Roomba i7+",
    category: "hogar",
    categoryId: 5,
    price: 599.99,
    originalPrice: 799.99,
    discount: 25,
    discountEndTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 días
    inStock: true,
    stock: 5,
    rating: 4.3,
    reviewCount: 267,
    description: "Robot aspiradora inteligente con vaciado automático y mapeo avanzado de tu hogar.",
    shortDescription: "Aspiradora robot con vaciado automático",
    features: [
      "Vaciado automático por 60 días",
      "Mapeo inteligente",
      "Control por app",
      "Compatible con Alexa",
      "Succión potente"
    ],
    images: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500",
      "https://images.unsplash.com/photo-1540031130240-3e3b85cad36a?w=500"
    ],
    tags: ["Roomba", "Robot", "Aspiradora", "Smart"],
    isFeatured: false,
    isOnSale: true
  },
  {
    id: 11,
    name: "Bicicleta Montaña Trek X-Caliber 7",
    category: "deportes",
    categoryId: 6,
    price: 899.99,
    originalPrice: 999.99,
    discount: 10,
    discountEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
    inStock: true,
    stock: 4,
    rating: 4.6,
    reviewCount: 78,
    description: "Bicicleta de montaña Trek con cuadro de aluminio, perfecta para senderos y aventuras al aire libre.",
    shortDescription: "Bicicleta de montaña profesional",
    features: [
      "Cuadro aluminio Alpha Silver",
      "Suspensión delantera",
      "21 velocidades",
      "Frenos de disco hidráulicos",
      "Neumáticos todo terreno"
    ],
    images: [
      "https://images.unsplash.com/photo-1544191696-15693072fb2a?w=500",
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500"
    ],
    tags: ["Trek", "Bicicleta", "Montaña", "Deportes"],
    isFeatured: false,
    isOnSale: true
  },
  {
    id: 12,
    name: "Smart TV Samsung 55\" 4K QLED",
    category: "electronicos",
    categoryId: 1,
    price: 799.99,
    originalPrice: 899.99,
    discount: 11,
    discountEndTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días
    inStock: true,
    stock: 10,
    rating: 4.5,
    reviewCount: 193,
    description: "Smart TV Samsung QLED 4K con Quantum Dot, HDR10+ y sistema operativo Tizen para la mejor experiencia.",
    shortDescription: "Smart TV 4K con tecnología QLED",
    features: [
      "Pantalla QLED 55 pulgadas",
      "Resolución 4K UHD",
      "HDR10+ y Dolby Vision",
      "Sistema Tizen OS",
      "Control por voz"
    ],
    images: [
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500",
      "https://images.unsplash.com/photo-1461151304267-38535e780c79?w=500"
    ],
    tags: ["Samsung", "Smart TV", "QLED", "4K"],
    isFeatured: true,
    isOnSale: true
  }
];

// Función para obtener productos destacados
export const getFeaturedProducts = () => {
  return products.filter(product => product.isFeatured);
};

// Función para obtener productos en oferta
export const getProductsOnSale = () => {
  return products.filter(product => product.isOnSale);
};

// Función para buscar productos
export const searchProducts = (query) => {
  if (!query) return products;

  const lowercaseQuery = query.toLowerCase();
  return products.filter(product =>
    product.name.toLowerCase().includes(lowercaseQuery) ||
    product.description.toLowerCase().includes(lowercaseQuery) ||
    product.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
  );
};

// Función para filtrar por categoría
export const getProductsByCategory = (categorySlug) => {
  return products.filter(product => product.category === categorySlug);
};

// Función para obtener producto por ID
export const getProductById = (id) => {
  return products.find(product => product.id === parseInt(id));
};

// Datos para el carrito de compras
export const cartInitialState = {
  items: [],
  total: 0,
  itemCount: 0
};

// Función para calcular tiempo restante de descuento
export const getRemainingTime = (endTime) => {
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const difference = end - now;

  if (difference > 0) {
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds, isExpired: false };
  }

  return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
};
