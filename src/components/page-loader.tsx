
"use client";

import React, { useEffect, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

// Custom NProgress styles
const customNProgressStyles = `
  #nprogress .bar {
    background: hsl(var(--primary)) !important;
    height: 3px !important;
  }
  
  #nprogress .peg {
    box-shadow: 0 0 10px hsl(var(--primary)), 0 0 5px hsl(var(--primary)) !important;
  }
  
  #nprogress .spinner {
    display: none !important;
  }
`;

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
    // Inject custom styles
    const styleElement = document.createElement('style');
    styleElement.textContent = customNProgressStyles;
    document.head.appendChild(styleElement);

    NProgress.configure({ 
      showSpinner: false,
      speed: 500,
      minimum: 0.1,
      trickleSpeed: 200,
    });

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

    // Fallback for initial load
    NProgress.done();
    
    return () => {
        mutationObserver.disconnect();
        const anchorElements = document.querySelectorAll('a');
        anchorElements.forEach(anchor => anchor.removeEventListener('click', handleAnchorClick));
        document.head.removeChild(styleElement);
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
