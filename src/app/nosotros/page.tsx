import Image from 'next/image';

export const metadata = {
    title: 'Nosotros | Tienda Virtual',
    description: 'Conoce nuestra historia, misión y el equipo detrás de Tienda Virtual.',
};

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen font-sans text-gray-900">

            {/* Hero Section */}
            <section className="relative py-20 lg:py-32 overflow-hidden bg-gray-900">
                <div className="absolute inset-0 z-0 opacity-40">
                    <div className="absolute inset-0 bg-gradient-to-r from-teal-900 to-teal-900 mix-blend-multiply" />
                    {/* Abstract background shapes */}
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-500 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-pulse"></div>
                    <div className="absolute top-1/2 right-0 w-64 h-64 bg-teal-500 rounded-full mix-blend-screen filter blur-3xl opacity-30"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8">
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-200 via-white to-teal-200">
                            Creando Experiencias,
                        </span>
                        <br />
                        <span className="text-white">Entregando Calidad.</span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300 leading-relaxed">
                        Somos más que una tienda online. Somos un equipo apasionado dedicado a conectar a las personas con productos que inspiran y mejoran su vida diaria.
                    </p>
                </div>
            </section>

            {/* Our Story / Mision */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-8">
                            <div className="inline-block px-4 py-1.5 bg-teal-50 text-teal-600 rounded-full font-bold text-sm uppercase tracking-wider">
                                Nuestra Historia
                            </div>
                            <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                                De un pequeño sueño a una <span className="text-teal-600">gran realidad.</span>
                            </h2>
                            <div className="text-lg text-gray-600 space-y-6 leading-relaxed">
                                <p>
                                    Fundada en 2020, en medio de un mundo cambiante, Tienda Virtual nació con una idea simple: la tecnología y el estilo deben ser accesibles para todos. Lo que comenzó como un pequeño emprendimiento en un garaje, hoy es una plataforma líder que atiende a miles de clientes felices.
                                </p>
                                <p>
                                    Creemos fielmente que el comercio electrónico no se trata solo de transacciones, sino de relaciones. Por eso, cada paquete que enviamos lleva consigo nuestro compromiso de excelencia y atención al detalle.
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-r from-teal-100 to-teal-100 rounded-2xl transform rotate-2"></div>
                            <div className="relative bg-gray-100 rounded-2xl overflow-hidden shadow-2xl h-[500px]">
                                {/* Placeholder for an office/team image */}
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400">
                                    <span className="text-6xl">🏢</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Grid */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Nuestros Valores Fundamentales</h2>
                        <p className="mt-4 text-xl text-gray-600">Los pilares que sostienen cada decisión que tomamos.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            {
                                icon: "💎",
                                title: "Calidad Intransigente",
                                description: "No vendemos nada que no usaríamos nosotros mismos. Seleccionamos rigurosamente cada producto de nuestro catálogo."
                            },
                            {
                                icon: "🚀",
                                title: "Innovación Constante",
                                description: "Siempre buscamos formas de mejorar. Desde nuestra plataforma web hasta nuestro empaquetado eco-amigable."
                            },
                            {
                                icon: "🤝",
                                title: "Cliente Primero",
                                description: "Tu satisfacción es nuestra brújula. Nuestro equipo de soporte está dedicado 100% a resolver tus dudas."
                            }
                        ].map((value, idx) => (
                            <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                                <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center text-4xl mb-6">
                                    {value.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {value.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-teal-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                        {[
                            { number: "+50k", label: "Clientes Felices" },
                            { number: "98%", label: "Satisfacción" },
                            { number: "+24h", label: "Soporte Activo" },
                            { number: "2500+", label: "Productos" }
                        ].map((stat, idx) => (
                            <div key={idx} className="p-4">
                                <div className="text-4xl md:text-5xl font-extrabold mb-2">{stat.number}</div>
                                <div className="text-teal-100 font-medium text-lg">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Conoce al Equipo</h2>
                        <p className="mt-4 text-xl text-gray-600">Las mentes creativas detrás de la magia.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { name: "Ana García", role: "CEO & Fundadora", emoji: "👩‍💼" },
                            { name: "Carlos Ruiz", role: "Director de Tecnología", emoji: "👨‍💻" },
                            { name: "Laura M.", role: "Jefa de Diseño", emoji: "👩‍🎨" },
                            { name: "David K.", role: "Atención al Cliente", emoji: "🎧" }
                        ].map((member, idx) => (
                            <div key={idx} className="group text-center">
                                <div className="relative mx-auto w-40 h-40 mb-6 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center text-6xl shadow-inner group-hover:scale-110 transition-transform duration-300 ring-4 ring-transparent group-hover:ring-teal-200">
                                    {member.emoji}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                                <p className="text-teal-600 font-medium">{member.role}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 bg-gray-900 text-center">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-3xl font-bold text-white mb-6">¿Listo para ser parte de nuestra comunidad?</h2>
                    <p className="text-gray-400 mb-8 text-lg">Únete a miles de personas que ya disfrutan de la mejor experiencia de compra online.</p>
                    <a href="/" className="inline-block bg-teal-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition-colors shadow-lg hover:shadow-teal-500/30">
                        Explorar Catálogo
                    </a>
                </div>
            </section>

        </div>
    );
}
