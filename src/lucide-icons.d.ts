// lucide-icons.d.ts
declare module 'lucide-react' {
    import { SVGProps } from 'react';
  
    // Add StopCircle and X to the list of known icons
    export const StopCircle: (props: SVGProps<SVGSVGElement>) => JSX.Element;
    export const X: (props: SVGProps<SVGSVGElement>) => JSX.Element;
    export const Newspaper: (props: SVGProps<SVGSVGElement>) => JSX.Element;
    export const MessageSquare: (props: SVGProps<SVGSVGElement>) => JSX.Element;
  
    // Re-export other icons to avoid losing them
    export * from 'lucide-react/dist/lucide-react';
  }
  
