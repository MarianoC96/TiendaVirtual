import { useState, useMemo, useEffect } from 'react';
import { Product, Category, ViewMode } from '../types';

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
            // Only reset range if it was default? Or expand it? 
            // Let's keep existing logic behavior: initialize, but maybe not reset if user set it? 
            // The original code reset it on load: setPriceRange([0, roundedMax]);
            setPriceRange(prev => [prev[0], Math.max(prev[1], roundedMax)]);
        }
    }, [products]);

    // Extract Filter Options
    const filterOptions = useMemo(() => {
        const capacities = new Set<string>();
        const clothingSizes = new Set<string>();
        const dimensions = new Set<string>();

        const clothingSizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

        products.forEach(p => {
            p.product_variants?.forEach(v => {
                if (v.variant_type === 'capacity') {
                    capacities.add(v.variant_label);
                } else if (v.variant_type === 'size' || v.variant_type === 'dimensions') {
                    const label = v.variant_label.trim();
                    const isClothingSize = clothingSizeOrder.some(s => label.toUpperCase() === s) || /^[A-Za-z]+$/.test(label);

                    if (isClothingSize) {
                        clothingSizes.add(label);
                    } else {
                        dimensions.add(label);
                    }
                }
            });
        });

        return {
            capacities: Array.from(capacities).sort((a, b) => parseFloat(a) - parseFloat(b)),
            clothingSizes: Array.from(clothingSizes).sort((a, b) => {
                const idxA = clothingSizeOrder.indexOf(a.toUpperCase());
                const idxB = clothingSizeOrder.indexOf(b.toUpperCase());
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                return a.localeCompare(b);
            }),
            dimensions: Array.from(dimensions).sort()
        };
    }, [products]);

    // Filter Logic
    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            // 1. Search Query
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.short_description?.toLowerCase().includes(searchQuery.toLowerCase());

            // 2. Category
            let matchesCategory = true;
            if (selectedCategory) {
                const selectedCat = categories.find(c => c.slug === selectedCategory);
                if (selectedCat) {
                    // Check both name and raw category string to be safe
                    matchesCategory = product.category_name?.toLowerCase() === selectedCat.name.toLowerCase() ||
                        product.category?.toLowerCase() === selectedCat.name.toLowerCase();
                } else {
                    matchesCategory = false;
                }
            }

            // 3. Capacity
            let matchesCapacity = true;
            if (selectedCapacity) {
                matchesCapacity = product.product_variants?.some(v =>
                    v.variant_type === 'capacity' && v.variant_label === selectedCapacity
                ) || false;
            }

            // 4. Size/Dimensions
            let matchesSize = true;
            if (selectedSize) {
                matchesSize = product.product_variants?.some(v =>
                    (v.variant_type === 'size' || v.variant_type === 'dimensions') && v.variant_label === selectedSize
                ) || false;
            }

            // 5. Price
            // Logic adjusted: if range is full [0, max], ignore? 
            // Original: if (priceRange[0] > 0 || priceRange[1] < maxProductPrice)
            let matchesPrice = true;
            if (priceRange[0] > 0 || priceRange[1] < maxProductPrice) {
                matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
            }

            return matchesSearch && matchesCategory && matchesCapacity && matchesSize && matchesPrice;
        });
    }, [products, searchQuery, selectedCategory, categories, selectedCapacity, selectedSize, priceRange, maxProductPrice]);

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
