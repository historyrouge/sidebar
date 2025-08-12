
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import { useEffect, Suspense } from 'react';

function NProgressComponent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
  
    useEffect(() => {
      NProgress.done();
    }, [pathname, searchParams]);
  
    return null;
}


export function NextNProgressClient() {

  useEffect(() => {
    // This is to handle the initial page load
    NProgress.done();

    //This is a workaround for a bug in Next.js where the progress bar
    //doesn't always stop on route change.
    const mutationObserver = new MutationObserver((mutations) => {
        const url = document.location.href;
        const oldUrl = mutations[0]?.target?.baseURI;
        if (url !== oldUrl) {
            NProgress.done();
        }
    });

    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
    });


  }, []);

  return <Suspense fallback={null}><NProgressComponent /></Suspense>;
}
