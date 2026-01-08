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
        <div className="fixed top-16 lg:top-20 left-0 right-0 z-40 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 text-white py-2 px-4 shadow-sm">
            <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-sm">
                <span className="text-base">🛒</span>
                <span className="font-medium">
                    ¡<span className="font-bold">{discountText}</span> en compras mayores a S/ {discount.min_cart_value}!
                </span>
                <span className="hidden md:inline text-green-100 text-xs">
                    — {discount.name}
                </span>
                <button
                    onClick={() => setVisible(false)}
                    className="absolute right-4 text-white/70 hover:text-white text-xl leading-none cursor-pointer transition-colors"
                    aria-label="Cerrar"
                >
                    ×
                </button>
            </div>
        </div>
    );
}
