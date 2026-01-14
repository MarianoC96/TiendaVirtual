import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: Obtener permisos de un usuario específico (para verificar acceso)
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'userId es requerido' },
                { status: 400 }
            );
        }

        // Obtener el usuario y su rol
        const { data: user, error: userError } = await db
            .from('users')
            .select('id, role')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Si es admin, tiene todos los permisos
        if (user.role === 'admin') {
            return NextResponse.json({
                role: 'admin',
                permissions: ['dashboard', 'productos', 'categorias', 'pedidos', 'historial', 'descuentos', 'cupones', 'accesos'],
                hasFullAccess: true
            });
        }

        // Si es trabajador o asistente, obtener sus permisos específicos
        if (user.role === 'worker' || user.role === 'assistant') {
            const { data: permissions } = await db
                .from('worker_permissions')
                .select('permission_key')
                .eq('user_id', userId);

            return NextResponse.json({
                role: user.role,
                permissions: (permissions || []).map(p => p.permission_key),
                hasFullAccess: false
            });
        }

        // Usuario normal no tiene acceso al admin
        return NextResponse.json({
            role: 'user',
            permissions: [],
            hasFullAccess: false
        });
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        return NextResponse.json(
            { error: 'Error al obtener permisos del usuario' },
            { status: 500 }
        );
    }
}
