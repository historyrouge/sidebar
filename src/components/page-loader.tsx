
"use client";

import React, { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

function NProgressLogic() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    const handleStop = () => NProgress.done();

    handleStop(); // Stop progress on initial load

    return () => {
        handleStop(); // Stop progress on component unmount
    };
  }, []);

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);


  // This is a bit of a hack to get the start event.
  // We can't use the router events, so we'll just start
  // the progress bar on every link click.
  useEffect(() => {
    const handleLinkClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const link = target.closest('a');
        if(link) {
            const href = link.getAttribute('href');
            // Don't start progress for external links or links to the same page
            if (href && href.startsWith('/') && href !== window.location.pathname) {
                NProgress.start();
            }
        }
    };
    
    document.addEventListener('click', handleLinkClick);

    return () => {
        document.removeEventListener('click', handleLinkClick);
    }
  }, []);

  return null;
}


export function PageLoader({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <NProgressLogic />
      </Suspense>
      {children}
    </>
  );
}
