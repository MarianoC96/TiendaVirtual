import { Category } from '../types';

interface CategorySidebarProps {
    categories: Category[];
    selectedCategory: string | null;
    setSelectedCategory: (slug: string | null) => void;
}

export function CategorySidebar({ categories, selectedCategory, setSelectedCategory }: CategorySidebarProps) {
    return (
        <div className="hidden lg:block lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                <h3 className="font-semibold text-gray-900 mb-4">Filtrar por Categoría</h3>
                <div className="space-y-2">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`w-full text-left px-4 py-2 rounded-xl transition-colors ${!selectedCategory
                            ? 'bg-teal-100 text-teal-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Todas
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.slug)}
                            className={`w-full text-left px-4 py-2 rounded-xl transition-colors flex items-center gap-2 ${selectedCategory === cat.slug
                                ? 'bg-teal-100 text-teal-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span>{cat.icon}</span>
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
