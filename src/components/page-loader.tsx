
"use client";

import React, { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

function NProgressLogic() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}


export function PageLoader({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    const handleAnchorClick = (event: MouseEvent) => {
        const targetUrl = (event.currentTarget as HTMLAnchorElement).href;
        const currentUrl = window.location.href;
        if (targetUrl !== currentUrl) {
            NProgress.start();
        }
    };

    const handleMutation: MutationCallback = () => {
        const anchorElements = document.querySelectorAll('a');
        anchorElements.forEach(anchor => anchor.addEventListener('click', handleAnchorClick));
    };

    const mutationObserver = new MutationObserver(handleMutation);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    window.onload = () => {
        NProgress.done();
    };
    
    return () => {
        mutationObserver.disconnect();
        const anchorElements = document.querySelectorAll('a');
        anchorElements.forEach(anchor => anchor.removeEventListener('click', handleAnchorClick));
    }
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <NProgressLogic />
      </Suspense>
      {children}
    </>
  );
}
