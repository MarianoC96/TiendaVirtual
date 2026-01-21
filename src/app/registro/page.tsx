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
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [highlightedField, setHighlightedField] = useState<string | null>(null);

  // Allow only numbers
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setPhone(val);
    if (highlightedField === 'phone') setHighlightedField(null);
  };

  const handleInputChange = (setter: (val: string) => void, field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setter(e.target.value);
    if (highlightedField === field) setHighlightedField(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setHighlightedField(null);

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      setHighlightedField('confirmPassword');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      setHighlightedField('password');
      return;
    }

    if (phone.length < 9) {
      setError('El teléfono debe tener al menos 9 dígitos');
      setHighlightedField('phone');
      return;
    }

    setLoading(true);
    const result = await register(email, password, name, phone);

    if (result.success) {
      router.push('/');
    } else {
      const errMsg = result.error || 'Error al registrarse';
      setError(errMsg);

      // Map backend errors to fields
      if (errMsg.includes('email') || errMsg.includes('correo')) {
        setHighlightedField('email');
      } else if (errMsg.includes('nombre') || errMsg.includes('usuario')) {
        setHighlightedField('name');
      } else if (errMsg.includes('teléfono')) {
        setHighlightedField('phone');
      }
    }
    setLoading(false);
  };

  const getInputClass = (fieldName: string) => {
    const baseClass = "w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all";
    if (highlightedField === fieldName) {
      return `${baseClass} border-red-500 focus:ring-red-200 focus:border-red-500 bg-red-50`;
    }
    return `${baseClass} border-gray-300 focus:ring-teal-500 focus:border-transparent`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="MAE Party & Print" className="h-24 w-auto" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Crear Cuenta</h1>
            <p className="text-gray-500 mt-2">Únete a nuestra comunidad</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 border rounded-xl text-sm flex items-start gap-3 ${highlightedField ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-50 border-red-200 text-red-600'
              }`}>
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={handleInputChange(setName, 'name')}
                required
                className={getInputClass('name')}
                placeholder="Tu nombre"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={handleInputChange(setEmail, 'email')}
                required
                className={getInputClass('email')}
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                required
                maxLength={15}
                className={`${getInputClass('phone')} ${phone.length > 0 && phone.length < 9
                    ? '!border-red-500 !focus:ring-red-200 !focus:border-red-500 !bg-red-50'
                    : ''
                  }`}
                placeholder="999888777"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={handleInputChange(setPassword, 'password')}
                required
                className={getInputClass('password')}
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirmar Contraseña</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={handleInputChange(setConfirmPassword, 'confirmPassword')}
                required
                className={getInputClass('confirmPassword')}
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
