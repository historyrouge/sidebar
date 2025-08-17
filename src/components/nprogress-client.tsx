
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import { useEffect, Suspense } from 'react';
import { useAuth } from '@/hooks/use-auth';

function NProgressComponent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { loading: authLoading } = useAuth();
  
    useEffect(() => {
        if (authLoading) {
            NProgress.start();
        } else {
            NProgress.done();
        }
    }, [authLoading]);

    useEffect(() => {
      NProgress.done();
    }, [pathname, searchParams]);
  
    return null;
}


export function NextNProgressClient() {
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) {
        NProgress.start();
    } else {
        NProgress.done();
    }
  }, [authLoading]);


  return <Suspense fallback={null}><NProgressComponent /></Suspense>;
}
