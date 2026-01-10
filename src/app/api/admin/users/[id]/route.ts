import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: Get user by ID
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const { data: user, error } = await db
            .from('users')
            .select('id, name, email, role, active, created_at')
            .eq('id', parseInt(id))
            .single();

        if (error || !user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Error al obtener usuario' }, { status: 500 });
    }
}

// PATCH: Update user (name, email, role, active status)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, email, role, active } = body;

        // Build update object with only provided fields
        const updateData: Record<string, unknown> = {};

        if (name !== undefined) updateData.name = name;
        if (email !== undefined) updateData.email = email;
        if (role !== undefined) {
            const validRoles = ['user', 'worker', 'admin'];
            if (!validRoles.includes(role)) {
                return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
            }
            updateData.role = role;
        }
        if (active !== undefined) updateData.active = active;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: 'No hay datos para actualizar' }, { status: 400 });
        }

        // Check if email is being changed and if it already exists
        if (email) {
            const { data: existingUser } = await db
                .from('users')
                .select('id')
                .eq('email', email)
                .neq('id', parseInt(id))
                .single();

            if (existingUser) {
                return NextResponse.json({ error: 'El correo ya está en uso' }, { status: 400 });
            }
        }

        const { error } = await db
            .from('users')
            .update(updateData)
            .eq('id', parseInt(id));

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 });
    }
}
