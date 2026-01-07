'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  // Admin routes - no public header/footer
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Public routes - with header/footer
  return (
    <>
      <Header />
      <main className="pt-16 lg:pt-20 min-h-screen">
        {children}
      </main>
      <Footer />
    </>
  );
}
