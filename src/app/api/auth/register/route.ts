import { NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    // Check if user exists
    const { data: existingUser } = await db
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está registrado' }, { status: 400 });
    }

    // Hash password and create user
    const hashedPassword = bcrypt.hashSync(password, 10);
    const { data: newUser, error } = await db
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        name,
        role: 'client'
      })
      .select('id, email, name, role')
      .single();

    if (error) throw error;

    return NextResponse.json({
      user: newUser
    });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
