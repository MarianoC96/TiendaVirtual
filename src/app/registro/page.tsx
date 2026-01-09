'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    const result = await register(email, password, name);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Error al registrarse');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <span className="text-3xl">☕</span>
              <span className="text-2xl font-bold text-teal-600">CustomCups</span>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
            <p className="text-gray-500 mt-2">Únete a nuestra comunidad</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Repite tu contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-500">
              ¿Ya tienes cuenta?{' '}
              <Link href="/login" className="text-teal-600 font-medium hover:underline">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
