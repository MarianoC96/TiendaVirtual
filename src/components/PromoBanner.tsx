'use client';

import { useState, useEffect } from 'react';

interface CartDiscount {
    id: number;
    name: string;
    discount_type: string;
    discount_value: number;
    min_cart_value: number;
}

export default function PromoBanner() {
    const [discount, setDiscount] = useState<CartDiscount | null>(null);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const fetchDiscount = async () => {
            try {
                const res = await fetch('/api/discounts/cart');
                const data = await res.json();
                if (data) {
                    setDiscount(data);
                }
            } catch (error) {
                console.error('Error fetching cart discount:', error);
            }
        };
        fetchDiscount();
    }, []);

    if (!discount || !visible) return null;

    const discountText = discount.discount_type === 'percentage'
        ? `${discount.discount_value}% OFF`
        : `S/ ${discount.discount_value} OFF`;

    return (
        <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 text-white py-2 px-4 relative">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 text-sm">
                <span className="animate-pulse">🎉</span>
                <span className="font-medium">
                    ¡{discountText} en compras mayores a S/ {discount.min_cart_value}!
                </span>
                <span className="hidden sm:inline text-rose-100">
                    — {discount.name}
                </span>
                <button
                    onClick={() => setVisible(false)}
                    className="absolute right-4 text-white/70 hover:text-white text-lg leading-none cursor-pointer"
                    aria-label="Cerrar"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
