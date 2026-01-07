import { NextResponse } from 'next/server';
import db from '@/lib/db';
import '@/lib/seed';

export async function GET() {
  try {
    const discounts = db.prepare(`
      SELECT 
        d.*,
        u.name as creator_name,
        CASE 
          WHEN d.applies_to = 'product' THEN p.name
          WHEN d.applies_to = 'category' THEN c.name
        END as target_name
      FROM discounts d
      LEFT JOIN users u ON d.created_by = u.id
      LEFT JOIN products p ON d.applies_to = 'product' AND d.target_id = p.id
      LEFT JOIN categories c ON d.applies_to = 'category' AND d.target_id = c.id
      ORDER BY d.created_at DESC
    `).all();

    return NextResponse.json(discounts);
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, discount_type, discount_value, applies_to, target_id, start_date, end_date } = body;

    // TODO: Get user ID from session - for now use admin ID 1
    const createdBy = 1;

    // Validate required fields
    if (!name || !discount_type || !discount_value || !applies_to || !target_id) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 });
    }

    // Validate 80% max for percentage discounts
    if (discount_type === 'percentage' && discount_value > 80) {
      return NextResponse.json({ 
        error: 'El descuento porcentual no puede superar el 80%' 
      }, { status: 400 });
    }

    // Validate target exists
    if (applies_to === 'product') {
      const product = db.prepare('SELECT id FROM products WHERE id = ?').get(target_id);
      if (!product) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 400 });
      }
    } else if (applies_to === 'category') {
      const category = db.prepare('SELECT id FROM categories WHERE id = ?').get(target_id);
      if (!category) {
        return NextResponse.json({ error: 'Categoría no encontrada' }, { status: 400 });
      }
    }

    const result = db.prepare(`
      INSERT INTO discounts (name, discount_type, discount_value, applies_to, target_id, start_date, end_date, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      name, 
      discount_type, 
      discount_value, 
      applies_to, 
      target_id, 
      start_date || null, 
      end_date || null, 
      createdBy
    );

    return NextResponse.json({ 
      success: true, 
      id: result.lastInsertRowid 
    });
  } catch (error) {
    console.error('Error creating discount:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
