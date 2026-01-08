import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
        const month = searchParams.get('month'); // Optional: 1-12

        // Get all orders for the year (including deleted ones for historical record)
        let query = db
            .from('orders')
            .select('*')
            .gte('created_at', `${year}-01-01T00:00:00`)
            .lt('created_at', `${year + 1}-01-01T00:00:00`)
            .order('created_at', { ascending: false });

        // Filter by month if provided
        if (month) {
            const monthNum = parseInt(month);
            const startDate = new Date(year, monthNum - 1, 1);
            const endDate = new Date(year, monthNum, 1);
            query = db
                .from('orders')
                .select('*')
                .gte('created_at', startDate.toISOString())
                .lt('created_at', endDate.toISOString())
                .order('created_at', { ascending: false });
        }

        const { data: orders, error } = await query;

        if (error) throw error;

        // Add metadata about deletion status
        const enrichedOrders = (orders || []).map((order: { deleted_at: string | null; created_at: string }) => ({
            ...order,
            is_deleted: !!order.deleted_at,
            can_edit: !order.deleted_at && isWithin30Days(order.created_at)
        }));

        return NextResponse.json(enrichedOrders);
    } catch (error) {
        console.error('Error fetching order history:', error);
        return NextResponse.json({ error: 'Failed to fetch order history' }, { status: 500 });
    }
}

function isWithin30Days(createdAt: string): boolean {
    const orderDate = new Date(createdAt);
    const now = new Date();
    const diffMs = now.getTime() - orderDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays <= 30;
}
