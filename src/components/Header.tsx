'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

interface Category {
  id: number;
  name: string;
  slug: string;
}

export default function Header() {
  const { itemCount } = useCart();
  const { user, isAuthenticated, isAdmin, isWorker, logout } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductsMenu, setShowProductsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const productsMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  // Handle scroll for glass effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (productsMenuRef.current && !productsMenuRef.current.contains(e.target as Node)) {
        setShowProductsMenu(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productos?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setShowMobileMenu(false);
    }
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-white/90 backdrop-blur-xl shadow-lg'
          : 'bg-white shadow-sm'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(true)}
              className="lg:hidden p-2 text-gray-700 hover:text-teal-600 -ml-2"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" alt="MAE Party & Print" className="h-28 w-auto" />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              <Link href="/" className="px-4 py-2 text-gray-700 font-medium hover:text-teal-600 transition-colors">
                Inicio
              </Link>

              {/* Products Dropdown */}
              <div className="relative" ref={productsMenuRef}>
                <button
                  onClick={() => setShowProductsMenu(!showProductsMenu)}
                  className="flex items-center gap-1 px-4 py-2 text-gray-700 font-medium hover:text-teal-600 transition-colors"
                >
                  Productos
                  <svg className={`w-4 h-4 transition-transform ${showProductsMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProductsMenu && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                    <Link href="/productos" onClick={() => setShowProductsMenu(false)} className="block px-4 py-2 text-gray-900 font-semibold hover:bg-teal-50 transition-colors">
                      Ver Todo
                    </Link>
                    <div className="h-px bg-gray-100 my-1" />
                    {categories.map((cat) => (
                      <Link key={cat.id} href={`/productos?categoria=${cat.slug}`} onClick={() => setShowProductsMenu(false)} className="block px-4 py-2 text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-colors">
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/ofertas" className="px-4 py-2 text-amber-600 font-semibold hover:text-amber-700 transition-colors">
                Ofertas
              </Link>

              <Link href="/nosotros" className="px-4 py-2 text-gray-700 font-medium hover:text-teal-600 transition-colors">
                Nosotros
              </Link>
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="hidden md:flex items-center">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar tazas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-40 lg:w-56 pl-10 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </form>

              {/* Cart Button */}
              <Link href="/carrito" aria-label="Ver carrito de compras" className="group flex flex-col items-center gap-0.5 text-gray-700 hover:text-teal-600 transition-colors">
                <div className="relative">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center bg-amber-500 text-white text-[10px] font-bold rounded-full border-2 border-white">
                      {itemCount > 99 ? '99+' : itemCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium leading-none">Carrito</span>
              </Link>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label="Menú de usuario"
                  className="group flex flex-col items-center gap-0.5 text-gray-700 hover:text-teal-600 transition-colors cursor-pointer"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-[10px] font-medium leading-none">
                    {isAuthenticated ? 'Cuenta' : 'Ingresar'}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="font-medium text-gray-900 truncate">{user?.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        {(isAdmin || isWorker) && (
                          <Link href="/admin" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-teal-600 font-medium hover:bg-teal-50">
                            {isAdmin ? 'Panel Admin' : 'Panel Staff'}
                          </Link>
                        )}
                        <Link href="/perfil" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                          Mi Perfil
                        </Link>
                        <Link href="/pedidos" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                          Mis Pedidos
                        </Link>
                        <div className="border-t border-gray-100 my-1" />
                        <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">
                          Cerrar Sesión
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                          Iniciar Sesión
                        </Link>
                        <Link href="/registro" onClick={() => setShowUserMenu(false)} className="block px-4 py-2 text-gray-700 hover:bg-gray-50">
                          Registrarse
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileMenu(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl animate-in slide-in-from-left">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Link href="/" onClick={() => setShowMobileMenu(false)} className="flex items-center gap-2">
                <img src="/logo.png" alt="MAE Party & Print" className="h-20 w-auto" />
              </Link>
              <button onClick={() => setShowMobileMenu(false)} aria-label="Cerrar menú" className="p-2 text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="p-4 border-b">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Mobile Navigation */}
            <nav className="p-4 space-y-1">
              <Link href="/" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl">
                Inicio
              </Link>
              <Link href="/productos" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl">
                Todos los Productos
              </Link>
              <div className="pl-4 space-y-1">
                {categories.map((cat) => (
                  <Link key={cat.id} href={`/productos?categoria=${cat.slug}`} onClick={() => setShowMobileMenu(false)} className="block px-4 py-2 text-gray-500 hover:text-teal-600 rounded-xl">
                    {cat.name}
                  </Link>
                ))}
              </div>
              <Link href="/ofertas" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 text-amber-600 font-semibold hover:bg-amber-50 rounded-xl">
                🔥 Ofertas
              </Link>
              <Link href="/nosotros" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 text-gray-700 font-medium hover:bg-gray-50 rounded-xl">
                👋 Nosotros
              </Link>
            </nav>

            {/* Mobile User Section */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-gray-50">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">Hola, {user?.name}</p>
                  {isAdmin && (
                    <Link href="/admin" onClick={() => setShowMobileMenu(false)} className="block w-full py-2 text-center bg-teal-600 text-white rounded-xl font-medium">
                      Panel Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="block w-full py-2 text-center text-red-600 font-medium">
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Link href="/login" onClick={() => setShowMobileMenu(false)} className="flex-1 py-2 text-center border border-teal-600 text-teal-600 rounded-xl font-medium">
                    Iniciar Sesión
                  </Link>
                  <Link href="/registro" onClick={() => setShowMobileMenu(false)} className="flex-1 py-2 text-center bg-teal-600 text-white rounded-xl font-medium">
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
