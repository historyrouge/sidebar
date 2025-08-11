
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import { useEffect } from 'react';

export function NextNProgressClient() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.start();
    const handleComplete = () => NProgress.done();
    
    handleComplete(); // Finish progress on initial load or route change

    return () => {
        // This might not be strictly necessary with the logic above,
        // but it's good practice for cleanup.
        NProgress.done();
    };

  }, [pathname, searchParams]);

  return null;
}
