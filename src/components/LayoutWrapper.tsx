'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PromoBanner from "@/components/PromoBanner";

export default function LayoutWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const [hasPromoBanner, setHasPromoBanner] = useState(false);

  // Check if there's an active cart discount
  useEffect(() => {
    if (!isAdminRoute) {
      fetch('/api/discounts/cart')
        .then(res => res.json())
        .then(data => setHasPromoBanner(!!data))
        .catch(() => setHasPromoBanner(false));
    }
  }, [isAdminRoute]);

  // Admin routes - no public header/footer
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Public routes - with header/footer
  // Add extra padding when promo banner is visible
  const mainPadding = hasPromoBanner ? 'pt-24 lg:pt-28' : 'pt-16 lg:pt-20';

  return (
    <>
      <Header />
      <PromoBanner />
      <main className={`${mainPadding} min-h-screen`}>
        {children}
      </main>
      <Footer />
    </>
  );
}
