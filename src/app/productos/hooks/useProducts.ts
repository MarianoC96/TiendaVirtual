import { useState, useEffect } from 'react';
import { Product, Category } from '../types';

import { fetcher } from '@/lib/fetcher';

export function useProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [productsData, categoriesData] = await Promise.all([
                    fetcher<Product[]>('/api/products'),
                    fetcher<Category[]>('/api/categories')
                ]);

                setProducts(productsData);
                setCategories(categoriesData);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err instanceof Error ? err : new Error('Unknown error'));
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    return { products, categories, loading, error };
}
