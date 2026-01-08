'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface LowStockProduct {
  id: number;
  name: string;
  stock: number;
  image_url?: string;
}

interface Coupon {
  id: number;
  code: string;
  name: string;
  discount_type: string;
  discount_value: number;
  uses: number;
  max_uses: number | null;
}

interface Discount {
  id: number;
  name: string;
  discount_type: string;
  discount_value: number;
  applies_to: string;
}

interface MonthlySale {
  month: string;
  revenue: number;
  orders: number;
}

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalCategories: number;
  activeCoupons: Coupon[];
  activeDiscounts: Discount[];
  lowStockProducts: LowStockProduct[];
  monthlySales: MonthlySale[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  // Calculate max revenue for chart scaling
  const maxRevenue = Math.max(...(stats?.monthlySales.map(s => s.revenue) || [1]));

  return (
    <div>
      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 lg:mb-6">Dashboard</h1>

      {/* Row 1: Ingresos + Stats principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
        {/* Ingresos Totales */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Ingresos Totales</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">S/ {(stats?.totalRevenue || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Ingresos Mensuales */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Ingresos del Mes</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-1">S/ {(stats?.monthlyRevenue || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Pedidos */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
            </div>
          </div>
        </div>

        {/* Productos */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Productos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalProducts || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Gráfica + Stock Bajo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* Gráfica de Ventas */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Ventas Mensuales</h2>
          <div className="flex items-end gap-3 h-48">
            {stats?.monthlySales.map((sale, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col items-center">
                  <span className="text-xs font-medium text-gray-600 mb-1">
                    S/ {sale.revenue.toLocaleString('es-PE', { maximumFractionDigits: 0 })}
                  </span>
                  <div
                    className="w-full bg-indigo-500 rounded-t-lg transition-all duration-500 hover:bg-indigo-600"
                    style={{
                      height: `${Math.max((sale.revenue / maxRevenue) * 140, 8)}px`
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 capitalize">{sale.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Productos Stock Bajo */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Stock Bajo</h2>
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
              {stats?.lowStockProducts.length || 0} productos
            </span>
          </div>
          <div className="space-y-3 max-h-44 overflow-y-auto pr-1">
            {stats?.lowStockProducts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Sin productos con stock bajo</p>
            ) : (
              stats?.lowStockProducts.map(product => (
                <div key={product.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-xl">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">📦</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${product.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                    {product.stock}
                  </span>
                </div>
              ))
            )}
          </div>
          <Link href="/admin/productos" className="mt-3 block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Ver todos →
          </Link>
        </div>
      </div>

      {/* Row 3: Cupones + Descuentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cupones Activos */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Cupones Activos</h2>
            <span className="text-2xl">🎟️</span>
          </div>
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {stats?.activeCoupons.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Sin cupones activos</p>
            ) : (
              stats?.activeCoupons.map(coupon => (
                <div key={coupon.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <div>
                    <p className="font-mono font-bold text-amber-700">{coupon.code}</p>
                    <p className="text-xs text-gray-500">{coupon.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-amber-600">
                      {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `S/ ${coupon.discount_value}`}
                    </span>
                    <p className="text-xs text-gray-400">
                      {coupon.uses}/{coupon.max_uses || '∞'} usos
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <Link href="/admin/cupones" className="mt-3 block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Gestionar cupones →
          </Link>
        </div>

        {/* Descuentos Activos */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Descuentos Activos</h2>
            <span className="text-2xl">💰</span>
          </div>
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {stats?.activeDiscounts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Sin descuentos activos</p>
            ) : (
              stats?.activeDiscounts.map(discount => (
                <div key={discount.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-100">
                  <div>
                    <p className="font-medium text-green-700">{discount.name}</p>
                    <p className="text-xs text-gray-500 capitalize">Aplica a: {discount.applies_to}</p>
                  </div>
                  <span className="font-bold text-green-600">
                    {discount.discount_type === 'percentage' ? `${discount.discount_value}%` : `S/ ${discount.discount_value}`}
                  </span>
                </div>
              ))
            )}
          </div>
          <Link href="/admin/descuentos" className="mt-3 block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
            Gestionar descuentos →
          </Link>
        </div>
      </div>
    </div >
  );
}
