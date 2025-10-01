"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface DragItem {
  id: string;
  type: string;
  data: any;
}

export interface DropZone {
  id: string;
  accepts: string[];
  onDrop: (item: DragItem, monitor: DropMonitor) => void;
  canDrop?: (item: DragItem, monitor: DropMonitor) => boolean;
}

export interface DropMonitor {
  isOver: boolean;
  canDrop: boolean;
  item: DragItem | null;
  dropEffect: 'none' | 'copy' | 'move' | 'link';
}

export interface DragDropContextValue {
  dragItem: DragItem | null;
  dragOffset: { x: number; y: number } | null;
  isDragging: boolean;
  startDrag: (item: DragItem, element: HTMLElement) => void;
  endDrag: () => void;
  registerDropZone: (zone: DropZone) => void;
  unregisterDropZone: (zoneId: string) => void;
}

const DragDropContext = React.createContext<DragDropContextValue | null>(null);

export function DragDropProvider({ children }: { children: React.ReactNode }) {
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dropZones = useRef<Map<string, DropZone>>(new Map());
  const dragPreview = useRef<HTMLElement | null>(null);

  const startDrag = useCallback((item: DragItem, element: HTMLElement) => {
    setDragItem(item);
    setIsDragging(true);
    
    // Create drag preview
    const preview = element.cloneNode(true) as HTMLElement;
    preview.style.position = 'fixed';
    preview.style.pointerEvents = 'none';
    preview.style.zIndex = '9999';
    preview.style.opacity = '0.8';
    preview.style.transform = 'rotate(5deg)';
    preview.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.3)';
    
    document.body.appendChild(preview);
    dragPreview.current = preview;

    // Add global mouse move listener
    const handleMouseMove = (e: MouseEvent) => {
      setDragOffset({ x: e.clientX, y: e.clientY });
      
      if (dragPreview.current) {
        dragPreview.current.style.left = `${e.clientX - 50}px`;
        dragPreview.current.style.top = `${e.clientY - 25}px`;
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      // Find drop zone under cursor
      const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
      const dropZoneElement = elementUnderCursor?.closest('[data-drop-zone]');
      
      if (dropZoneElement) {
        const zoneId = dropZoneElement.getAttribute('data-drop-zone');
        const zone = dropZones.current.get(zoneId!);
        
        if (zone && zone.accepts.includes(item.type)) {
          const monitor: DropMonitor = {
            isOver: true,
            canDrop: zone.canDrop ? zone.canDrop(item, {} as DropMonitor) : true,
            item,
            dropEffect: 'move',
          };
          
          if (monitor.canDrop) {
            zone.onDrop(item, monitor);
          }
        }
      }

      endDrag();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  const endDrag = useCallback(() => {
    setDragItem(null);
    setDragOffset(null);
    setIsDragging(false);
    
    if (dragPreview.current) {
      document.body.removeChild(dragPreview.current);
      dragPreview.current = null;
    }
  }, []);

  const registerDropZone = useCallback((zone: DropZone) => {
    dropZones.current.set(zone.id, zone);
  }, []);

  const unregisterDropZone = useCallback((zoneId: string) => {
    dropZones.current.delete(zoneId);
  }, []);

  const contextValue: DragDropContextValue = {
    dragItem,
    dragOffset,
    isDragging,
    startDrag,
    endDrag,
    registerDropZone,
    unregisterDropZone,
  };

  return (
    <DragDropContext.Provider value={contextValue}>
      {children}
    </DragDropContext.Provider>
  );
}

export function useDragDrop() {
  const context = React.useContext(DragDropContext);
  if (!context) {
    throw new Error('useDragDrop must be used within a DragDropProvider');
  }
  return context;
}

// Draggable component
export interface DraggableProps {
  item: DragItem;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onDragStart?: (item: DragItem) => void;
  onDragEnd?: (item: DragItem) => void;
}

export function Draggable({
  item,
  children,
  className,
  disabled = false,
  onDragStart,
  onDragEnd,
}: DraggableProps) {
  const { startDrag, isDragging, dragItem } = useDragDrop();
  const elementRef = useRef<HTMLDivElement>(null);
  const isCurrentlyDragging = isDragging && dragItem?.id === item.id;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled || e.button !== 0) return;

    e.preventDefault();
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const distance = Math.sqrt(
        Math.pow(moveEvent.clientX - e.clientX, 2) + 
        Math.pow(moveEvent.clientY - e.clientY, 2)
      );
      
      if (distance > 5 && elementRef.current) {
        onDragStart?.(item);
        startDrag(item, elementRef.current);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [disabled, item, startDrag, onDragStart]);

  useEffect(() => {
    if (!isDragging && isCurrentlyDragging) {
      onDragEnd?.(item);
    }
  }, [isDragging, isCurrentlyDragging, item, onDragEnd]);

  return (
    <div
      ref={elementRef}
      className={cn(
        'cursor-grab active:cursor-grabbing',
        isCurrentlyDragging && 'opacity-50',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
      onMouseDown={handleMouseDown}
      draggable={false}
    >
      {children}
    </div>
  );
}

// Droppable component
export interface DroppableProps {
  zone: DropZone;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  canDropClassName?: string;
}

export function Droppable({
  zone,
  children,
  className,
  activeClassName = 'bg-primary/10 border-primary',
  canDropClassName = 'border-dashed border-2',
}: DroppableProps) {
  const { dragItem, isDragging, registerDropZone, unregisterDropZone } = useDragDrop();
  const [isOver, setIsOver] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const canDrop = dragItem && zone.accepts.includes(dragItem.type) && 
                  (!zone.canDrop || zone.canDrop(dragItem, { isOver, canDrop: true, item: dragItem, dropEffect: 'move' }));

  useEffect(() => {
    registerDropZone(zone);
    return () => unregisterDropZone(zone.id);
  }, [zone, registerDropZone, unregisterDropZone]);

  const handleMouseEnter = useCallback(() => {
    if (isDragging && canDrop) {
      setIsOver(true);
    }
  }, [isDragging, canDrop]);

  const handleMouseLeave = useCallback(() => {
    setIsOver(false);
  }, []);

  return (
    <div
      ref={elementRef}
      data-drop-zone={zone.id}
      className={cn(
        className,
        isDragging && canDrop && canDropClassName,
        isOver && activeClassName
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

// Sortable list component
export interface SortableListProps<T> {
  items: T[];
  onReorder: (newOrder: T[]) => void;
  renderItem: (item: T, index: number, isDragging: boolean) => React.ReactNode;
  getItemId: (item: T) => string;
  className?: string;
  itemClassName?: string;
  disabled?: boolean;
}

export function SortableList<T>({
  items,
  onReorder,
  renderItem,
  getItemId,
  className,
  itemClassName,
  disabled = false,
}: SortableListProps<T>) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const handleDrop = useCallback((droppedItem: DragItem, targetIndex: number) => {
    const sourceIndex = items.findIndex(item => getItemId(item) === droppedItem.id);
    if (sourceIndex === -1 || sourceIndex === targetIndex) return;

    const newItems = [...items];
    const [movedItem] = newItems.splice(sourceIndex, 1);
    newItems.splice(targetIndex, 0, movedItem);
    
    onReorder(newItems);
    setDraggedIndex(null);
    setHoverIndex(null);
  }, [items, getItemId, onReorder]);

  return (
    <div className={cn('space-y-2', className)}>
      {items.map((item, index) => {
        const itemId = getItemId(item);
        const isDragging = draggedIndex === index;
        const isHovered = hoverIndex === index;

        return (
          <div key={itemId} className="relative">
            <Draggable
              item={{
                id: itemId,
                type: 'sortable-item',
                data: { item, index },
              }}
              disabled={disabled}
              onDragStart={() => setDraggedIndex(index)}
              onDragEnd={() => setDraggedIndex(null)}
              className={cn(
                'transition-all duration-200',
                isDragging && 'scale-105 rotate-2 z-10',
                itemClassName
              )}
            >
              <Droppable
                zone={{
                  id: `sortable-${itemId}`,
                  accepts: ['sortable-item'],
                  onDrop: (droppedItem) => handleDrop(droppedItem, index),
                }}
                className={cn(
                  'transition-all duration-200',
                  isHovered && 'transform translate-y-1'
                )}
                activeClassName="border-primary/50 bg-primary/5"
              >
                <div
                  onMouseEnter={() => setHoverIndex(index)}
                  onMouseLeave={() => setHoverIndex(null)}
                >
                  {renderItem(item, index, isDragging)}
                </div>
              </Droppable>
            </Draggable>
          </div>
        );
      })}
    </div>
  );
}

// File drop zone component
export interface FileDropZoneProps {
  onFilesDropped: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number; // in bytes
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  disabled?: boolean;
}

export function FileDropZone({
  onFilesDropped,
  acceptedTypes = ['*'],
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  children,
  className,
  activeClassName = 'border-primary bg-primary/5',
  disabled = false,
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const validateFiles = useCallback((files: FileList): File[] => {
    const validFiles: File[] = [];

    for (let i = 0; i < Math.min(files.length, maxFiles); i++) {
      const file = files[i];
      
      // Check file type
      if (acceptedTypes.includes('*') || acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      })) {
        // Check file size
        if (file.size <= maxSize) {
          validFiles.push(file);
        }
      }
    }

    return validFiles;
  }, [acceptedTypes, maxFiles, maxSize]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(prev => prev + 1);
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(prev => prev - 1);
    
    if (dragCounter <= 1) {
      setIsDragOver(false);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragOver(false);
    setDragCounter(0);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const validFiles = validateFiles(files);
      if (validFiles.length > 0) {
        onFilesDropped(validFiles);
      }
    }
  }, [disabled, validateFiles, onFilesDropped]);

  // Reset drag state when dragging ends outside the component
  useEffect(() => {
    const handleGlobalDragEnd = () => {
      setIsDragOver(false);
      setDragCounter(0);
    };

    document.addEventListener('dragend', handleGlobalDragEnd);
    return () => document.removeEventListener('dragend', handleGlobalDragEnd);
  }, []);

  return (
    <div
      ref={dropZoneRef}
      className={cn(
        'transition-all duration-200',
        isDragOver && !disabled && activeClassName,
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
    </div>
  );
}

// Advanced animation components
export interface AnimatedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getItemKey: (item: T) => string;
  className?: string;
  itemClassName?: string;
  animationDuration?: number;
  staggerDelay?: number;
}

export function AnimatedList<T>({
  items,
  renderItem,
  getItemKey,
  className,
  itemClassName,
  animationDuration = 300,
  staggerDelay = 50,
}: AnimatedListProps<T>) {
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const [mountedItems, setMountedItems] = useState<T[]>([]);

  useEffect(() => {
    // Add new items with staggered animation
    const newItems = items.filter(item => !visibleItems.has(getItemKey(item)));
    
    if (newItems.length > 0) {
      setMountedItems(prev => [...prev, ...newItems]);
      
      newItems.forEach((item, index) => {
        setTimeout(() => {
          setVisibleItems(prev => new Set(prev).add(getItemKey(item)));
        }, index * staggerDelay);
      });
    }

    // Remove items that are no longer in the list
    const currentKeys = new Set(items.map(getItemKey));
    setMountedItems(prev => prev.filter(item => currentKeys.has(getItemKey(item))));
    setVisibleItems(prev => {
      const newVisible = new Set<string>();
      prev.forEach(key => {
        if (currentKeys.has(key)) {
          newVisible.add(key);
        }
      });
      return newVisible;
    });
  }, [items, getItemKey, staggerDelay, visibleItems]);

  return (
    <div className={className}>
      {mountedItems.map((item, index) => {
        const key = getItemKey(item);
        const isVisible = visibleItems.has(key);
        
        return (
          <div
            key={key}
            className={cn(
              'transition-all duration-300 ease-out',
              isVisible 
                ? 'opacity-100 transform translate-y-0 scale-100' 
                : 'opacity-0 transform translate-y-4 scale-95',
              itemClassName
            )}
            style={{
              transitionDuration: `${animationDuration}ms`,
              transitionDelay: `${index * staggerDelay}ms`,
            }}
          >
            {renderItem(item, index)}
          </div>
        );
      })}
    </div>
  );
}

// Gesture recognition for touch devices
export interface GestureHandlers {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onPinch?: (scale: number) => void;
  onTap?: () => void;
  onDoubleTap?: () => void;
  onLongPress?: () => void;
}

export function useGestures(handlers: GestureHandlers, threshold: number = 50) {
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const touchEnd = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    // Start long press timer
    longPressTimer.current = setTimeout(() => {
      handlers.onLongPress?.();
    }, 500);
  }, [handlers]);

  const handleTouchMove = useCallback(() => {
    // Cancel long press on move
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Cancel long press
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (!touchStart.current) return;

    const touch = e.changedTouches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.time - touchStart.current.time;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Detect swipes
    if (distance > threshold && deltaTime < 300) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          handlers.onSwipeRight?.();
        } else {
          handlers.onSwipeLeft?.();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          handlers.onSwipeDown?.();
        } else {
          handlers.onSwipeUp?.();
        }
      }
    } else if (distance < 10 && deltaTime < 300) {
      // Tap detected
      const now = Date.now();
      const timeSinceLastTap = now - lastTap.current;
      
      if (timeSinceLastTap < 300) {
        // Double tap
        handlers.onDoubleTap?.();
      } else {
        // Single tap
        handlers.onTap?.();
      }
      
      lastTap.current = now;
    }

    touchStart.current = null;
    touchEnd.current = null;
  }, [handlers, threshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

// Advanced scroll effects
export function useScrollEffects(containerRef: React.RefObject<HTMLElement>) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const lastScrollTop = useRef(0);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      // Calculate scroll progress
      const progress = scrollHeight > clientHeight 
        ? scrollTop / (scrollHeight - clientHeight)
        : 0;
      setScrollProgress(progress);

      // Determine scroll direction
      if (scrollTop > lastScrollTop.current) {
        setScrollDirection('down');
      } else if (scrollTop < lastScrollTop.current) {
        setScrollDirection('up');
      }
      lastScrollTop.current = scrollTop;

      // Set scrolling state
      setIsScrolling(true);
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
      scrollTimer.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
      }
    };
  }, [containerRef]);

  return {
    scrollProgress,
    scrollDirection,
    isScrolling,
  };
}