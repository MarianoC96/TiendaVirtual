import { NextResponse } from 'next/server';
import db from '@/lib/db';

// Lista de permisos disponibles
const AVAILABLE_PERMISSIONS = [
    'dashboard',
    'productos',
    'categorias',
    'pedidos',
    'historial',
    'descuentos',
    'cupones'
];

// GET: Listar trabajadores con sus permisos
export async function GET() {
    try {
        // Obtener todos los trabajadores (role = 'worker')
        const { data: workers, error: workersError } = await db
            .from('users')
            .select('id, name, email, role')
            .eq('role', 'worker')
            .order('name');

        if (workersError) throw workersError;

        // Obtener permisos de cada trabajador
        const workersWithPermissions = await Promise.all(
            (workers || []).map(async (worker) => {
                const { data: permissions } = await db
                    .from('worker_permissions')
                    .select('permission_key')
                    .eq('user_id', worker.id);

                return {
                    ...worker,
                    permissions: (permissions || []).map(p => p.permission_key)
                };
            })
        );

        return NextResponse.json({
            workers: workersWithPermissions,
            availablePermissions: AVAILABLE_PERMISSIONS
        });
    } catch (error) {
        console.error('Error fetching permissions:', error);
        return NextResponse.json(
            { error: 'Error al obtener permisos' },
            { status: 500 }
        );
    }
}

// POST: Actualizar permisos de un trabajador
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, permissions } = body;

        if (!userId || !Array.isArray(permissions)) {
            return NextResponse.json(
                { error: 'userId y permissions son requeridos' },
                { status: 400 }
            );
        }

        // Verificar que el usuario existe y es trabajador
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

        if (user.role !== 'worker') {
            return NextResponse.json(
                { error: 'Solo se pueden modificar permisos de trabajadores' },
                { status: 403 }
            );
        }

        // Validar que todos los permisos son válidos
        const invalidPermissions = permissions.filter(p => !AVAILABLE_PERMISSIONS.includes(p));
        if (invalidPermissions.length > 0) {
            return NextResponse.json(
                { error: `Permisos inválidos: ${invalidPermissions.join(', ')}` },
                { status: 400 }
            );
        }

        // Eliminar permisos actuales del trabajador
        await db
            .from('worker_permissions')
            .delete()
            .eq('user_id', userId);

        // Insertar nuevos permisos
        if (permissions.length > 0) {
            const newPermissions = permissions.map(permissionKey => ({
                user_id: userId,
                permission_key: permissionKey,
                granted_by: 1 // TODO: Obtener ID del admin logueado
            }));

            const { error: insertError } = await db
                .from('worker_permissions')
                .insert(newPermissions);

            if (insertError) throw insertError;
        }

        return NextResponse.json({ success: true, permissions });
    } catch (error) {
        console.error('Error updating permissions:', error);
        return NextResponse.json(
            { error: 'Error al actualizar permisos' },
            { status: 500 }
        );
    }
}
