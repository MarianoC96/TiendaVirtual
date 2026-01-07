import { NextResponse } from 'next/server';
import db from '@/lib/db';
import '@/lib/seed';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const categoria = searchParams.get('categoria');

    let sql = `
      SELECT 
        p.*,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: (string | number)[] = [];

    if (query) {
      sql += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
      params.push(`%${query}%`, `%${query}%`);
    }

    if (categoria) {
      sql += ` AND p.category = ?`;
      params.push(categoria);
    }

    sql += ` ORDER BY p.is_featured DESC, p.total_sold DESC`;

    const products = db.prepare(sql).all(...params);

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
