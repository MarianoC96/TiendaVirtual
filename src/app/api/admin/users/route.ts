import { NextResponse } from 'next/server';
import db from '@/lib/db';

// GET: List all users
export async function GET() {
    try {
        const { data: users, error } = await db
            .from('users')
            .select('id, name, email, role, created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Add active status (default true if column doesn't exist)
        const usersWithActive = (users || []).map(user => ({
            ...user,
            active: (user as any).active !== undefined ? (user as any).active : true
        }));

        return NextResponse.json(usersWithActive);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
    }
}

// POST: Create new user
export async function POST(request: Request) {
    try {
        const { name, email, password, role } = await request.json();

        // Validate required fields
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Nombre, email y contraseña son requeridos' }, { status: 400 });
        }

        // Validate role
        const validRoles = ['user', 'worker', 'admin'];
        if (role && !validRoles.includes(role)) {
            return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
        }

        // Check if email already exists
        const { data: existingUser } = await db
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return NextResponse.json({ error: 'El correo ya está registrado' }, { status: 400 });
        }

        // In production, you should hash the password
        // For now, we'll store it as-is (assuming auth is handled elsewhere)
        const { data: newUser, error } = await db
            .from('users')
            .insert({
                name,
                email,
                password, // Should be hashed in production
                role: role || 'user',
                active: true
            })
            .select('id')
            .single();

        if (error) throw error;

        return NextResponse.json({ success: true, id: newUser?.id });
    } catch (error) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
    }
}
