import { useState, useMemo, useEffect } from 'react';
import { Product, Category, ViewMode } from '../types';
import { PREDEFINED_SIZES } from '@/lib/variants';

interface UseProductFiltersProps {
    products: Product[];
    categories: Category[];
    initialSearchQuery?: string;
    initialCategory?: string | null;
}

export function useProductFilters({
    products,
    categories,
    initialSearchQuery = '',
    initialCategory = null,
}: UseProductFiltersProps) {
    // State
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');

    // Mobile/Advanced Filters
    const [selectedCapacity, setSelectedCapacity] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
    const [maxProductPrice, setMaxProductPrice] = useState(1000);

    // Sync with props if needed (e.g. url params change) - optional depending on arch
    useEffect(() => {
        if (initialSearchQuery) setSearchQuery(initialSearchQuery);
        if (initialCategory) setSelectedCategory(initialCategory);
    }, [initialSearchQuery, initialCategory]);

    // Calculate Max Price
    useEffect(() => {
        if (products.length > 0) {
            const max = Math.max(...products.map(p => p.price), 0);
            const roundedMax = Math.ceil(max / 10) * 10;
            setMaxProductPrice(roundedMax);
            setPriceRange(prev => [prev[0], Math.max(prev[1], roundedMax)]);
        }
    }, [products]);

    // 1. First, isolate products by Active Category for accurate filter options
    const productsByCategory = useMemo(() => {
        if (!selectedCategory || selectedCategory === 'all') return products;

        const selectedCat = categories.find(c => c.slug === selectedCategory);
        if (!selectedCat) return products;

        return products.filter(p =>
            p.category_name?.toLowerCase() === selectedCat.name.toLowerCase() ||
            p.category?.toLowerCase() === selectedCat.name.toLowerCase()
        );
    }, [products, selectedCategory, categories]);

    // Extract Filter Options (Based on products in current category)
    const filterOptions = useMemo(() => {
        const capacities = new Set<string>();
        const clothingSizes = new Set<string>();
        const dimensions = new Set<string>();

        // Use the category-filtered list, so we don't show "oz" for T-shirts
        productsByCategory.forEach(p => {
            p.product_variants?.forEach(v => {
                const label = v.variant_label.trim();

                if (v.variant_type === 'capacity') {
                    capacities.add(label);
                } else if (v.variant_type === 'size') {
                    clothingSizes.add(label);
                } else if (v.variant_type === 'dimensions') {
                    dimensions.add(label);
                }
            });
        });

        return {
            capacities: Array.from(capacities).sort((a, b) => parseFloat(a) - parseFloat(b)),
            clothingSizes: Array.from(clothingSizes).sort((a, b) => {
                const idxA = PREDEFINED_SIZES.indexOf(a.toUpperCase());
                const idxB = PREDEFINED_SIZES.indexOf(b.toUpperCase());
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                return a.localeCompare(b);
            }),
            dimensions: Array.from(dimensions).sort()
        };
    }, [productsByCategory]);

    // Filter Logic
    const filteredProducts = useMemo(() => {
        return productsByCategory.filter(product => {
            // 1. Search Query
            const matchesSearch = searchQuery === '' ||
                product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (product.short_description && product.short_description.toLowerCase().includes(searchQuery.toLowerCase()));

            // 2. Capacity
            let matchesCapacity = true;
            if (selectedCapacity) {
                matchesCapacity = product.product_variants?.some(v =>
                    v.variant_type === 'capacity' && v.variant_label === selectedCapacity
                ) || false;
            }

            // 3. Size/Dimensions
            let matchesSize = true;
            if (selectedSize) {
                matchesSize = product.product_variants?.some(v =>
                    (v.variant_type === 'size' || v.variant_type === 'dimensions') && v.variant_label === selectedSize
                ) || false;
            }

            // 4. Price
            let matchesPrice = true;
            if (priceRange[0] > 0 || priceRange[1] < maxProductPrice) {
                matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
            }

            return matchesSearch && matchesCapacity && matchesSize && matchesPrice;
        });
    }, [productsByCategory, searchQuery, selectedCapacity, selectedSize, priceRange, maxProductPrice]);

    // Grouping Logic
    const groupedProducts = useMemo(() => {
        if (viewMode !== 'grouped') return {};

        const groups: { [key: string]: Product[] } = {};
        filteredProducts.forEach(p => {
            const catName = p.category_name || 'Otros';
            if (!groups[catName]) groups[catName] = [];
            groups[catName].push(p);
        });
        return groups;
    }, [filteredProducts, viewMode]);

    const activeFiltersCount = [
        selectedCapacity,
        selectedSize,
        (priceRange[0] > 0 || priceRange[1] < maxProductPrice) ? 'price' : null
    ].filter(Boolean).length;

    const clearFilters = () => {
        setSearchQuery('');
        setSelectedCategory(null);
        setSelectedCapacity(null);
        setSelectedSize(null);
        setPriceRange([0, maxProductPrice]);
    };

    return {
        searchQuery, setSearchQuery,
        selectedCategory, setSelectedCategory,
        viewMode, setViewMode,
        selectedCapacity, setSelectedCapacity,
        selectedSize, setSelectedSize,
        priceRange, setPriceRange,
        maxProductPrice,
        filterOptions,
        filteredProducts,
        groupedProducts,
        activeFiltersCount,
        clearFilters
    };
}
