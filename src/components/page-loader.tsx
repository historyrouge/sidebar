
"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

export function PageLoader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    // We can't use next/router events since we are in app router, 
    // so we'll just listen to pathname and searchParams changes.
    // This might not be perfect, but it's a good approximation.
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

  return <>{children}</>;
}
