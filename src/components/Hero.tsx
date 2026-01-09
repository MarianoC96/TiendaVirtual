'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-cyan-50 to-amber-50">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-200/40 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-100/30 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
              <span className="text-lg">✨</span>
              <span className="text-sm font-medium text-gray-700">Personalización única</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-gray-900">
              Tazas que cuentan
              <br />
              <span className="bg-gradient-to-r from-teal-600 to-cyan-500 bg-clip-text text-transparent">
                tu historia
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Crea tazas únicas con tus fotos, mensajes o diseños.
              El regalo perfecto para cualquier ocasión especial.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link
                href="/productos"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-bold text-lg rounded-full shadow-lg shadow-teal-500/30 hover:shadow-teal-500/50 hover:scale-105 transition-all duration-300"
              >
                Diseña la Tuya
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>

              <Link
                href="/productos?categoria=sets-regalo"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-800 font-semibold text-lg rounded-full shadow-md hover:shadow-lg transition-all duration-300"
              >
                🎁 Ver Regalos
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 pt-8 justify-center lg:justify-start">
              <div className="text-center">
                <p className="text-3xl font-bold text-teal-600">5000+</p>
                <p className="text-sm text-gray-500">Clientes Felices</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-teal-600">24h</p>
                <p className="text-sm text-gray-500">Producción</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-teal-600">100%</p>
                <p className="text-sm text-gray-500">Personalizable</p>
              </div>
            </div>
          </div>

          {/* Right Content - Images */}
          <div className="relative hidden lg:block">
            <div className="relative">
              {/* Main Cup Image */}
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=600&q=80"
                  alt="Taza personalizada"
                  className="rounded-3xl shadow-2xl w-full max-w-md mx-auto transform rotate-2 hover:rotate-0 transition-transform duration-500"
                />
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center animate-bounce" style={{ animationDuration: '3s' }}>
                <span className="text-4xl">☕</span>
              </div>

              <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-xl p-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-teal-400 rounded-full border-2 border-white" />
                    <div className="w-8 h-8 bg-cyan-400 rounded-full border-2 border-white" />
                    <div className="w-8 h-8 bg-amber-400 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">+328 reseñas</p>
                    <div className="flex text-yellow-400 text-sm">★★★★★</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
