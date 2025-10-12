
declare module 'lucide-react' {
    import { SVGProps, ComponentType } from 'react';
    
    // Define a generic LucideIcon type
    type LucideIcon = ComponentType<SVGProps<SVGSVGElement>>;

    // Add specific icons that might be missing from default types
    export const StopCircle: LucideIcon;
    export const X: LucideIcon;
    export const Newspaper: LucideIcon;
    export const MessageSquare: LucideIcon;
    export const Star: LucideIcon;
  
    // Re-export all other members from the original module
    export * from 'lucide-react/dist/lucide-react';
  }
