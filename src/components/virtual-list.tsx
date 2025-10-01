"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface VirtualListItem {
  id: string;
  height?: number;
  data: any;
}

export interface VirtualListProps<T = any> {
  items: VirtualListItem[];
  itemHeight: number | ((index: number, item: VirtualListItem) => number);
  containerHeight: number;
  renderItem: (item: VirtualListItem, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  onItemsRendered?: (startIndex: number, endIndex: number) => void;
  scrollToIndex?: number;
  scrollToAlignment?: 'start' | 'center' | 'end' | 'auto';
}

export function VirtualList<T = any>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className,
  onScroll,
  onItemsRendered,
  scrollToIndex,
  scrollToAlignment = 'auto',
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate item heights
  const getItemHeight = useCallback((index: number): number => {
    if (typeof itemHeight === 'function') {
      return itemHeight(index, items[index]);
    }
    return itemHeight;
  }, [itemHeight, items]);

  // Calculate total height
  const totalHeight = useMemo(() => {
    return items.reduce((total, _, index) => total + getItemHeight(index), 0);
  }, [items, getItemHeight]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    let startIndex = 0;
    let endIndex = 0;
    let currentOffset = 0;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      if (currentOffset + height > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      currentOffset += height;
    }

    // Find end index
    currentOffset = 0;
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      if (i >= startIndex) {
        if (currentOffset > containerHeight + overscan * getItemHeight(i)) {
          endIndex = Math.min(items.length - 1, i + overscan);
          break;
        }
      }
      if (i >= startIndex) {
        currentOffset += height;
      }
    }

    if (endIndex === 0) {
      endIndex = Math.min(items.length - 1, startIndex + Math.ceil(containerHeight / getItemHeight(0)) + overscan);
    }

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, items.length, getItemHeight, overscan]);

  // Calculate offset for visible items
  const offsetY = useMemo(() => {
    let offset = 0;
    for (let i = 0; i < visibleRange.startIndex; i++) {
      offset += getItemHeight(i);
    }
    return offset;
  }, [visibleRange.startIndex, getItemHeight]);

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Notify about rendered items
  useEffect(() => {
    onItemsRendered?.(visibleRange.startIndex, visibleRange.endIndex);
  }, [visibleRange.startIndex, visibleRange.endIndex, onItemsRendered]);

  // Scroll to specific index
  useEffect(() => {
    if (scrollToIndex !== undefined && containerRef.current) {
      let targetOffset = 0;
      
      for (let i = 0; i < scrollToIndex; i++) {
        targetOffset += getItemHeight(i);
      }

      // Adjust based on alignment
      if (scrollToAlignment === 'center') {
        targetOffset -= containerHeight / 2 - getItemHeight(scrollToIndex) / 2;
      } else if (scrollToAlignment === 'end') {
        targetOffset -= containerHeight - getItemHeight(scrollToIndex);
      }

      containerRef.current.scrollTop = Math.max(0, targetOffset);
    }
  }, [scrollToIndex, scrollToAlignment, containerHeight, getItemHeight]);

  // Render visible items
  const visibleItems = useMemo(() => {
    const items_to_render = [];
    
    for (let i = visibleRange.startIndex; i <= visibleRange.endIndex; i++) {
      if (items[i]) {
        items_to_render.push({
          index: i,
          item: items[i],
          style: {
            position: 'absolute' as const,
            top: offsetY + items_to_render.reduce((sum, _, idx) => 
              sum + (idx < items_to_render.length - 1 ? getItemHeight(visibleRange.startIndex + idx) : 0), 0
            ),
            left: 0,
            right: 0,
            height: getItemHeight(i),
          },
        });
      }
    }
    
    return items_to_render;
  }, [visibleRange, items, offsetY, getItemHeight]);

  return (
    <div
      ref={containerRef}
      className={cn('overflow-auto', className)}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div
        ref={scrollElementRef}
        style={{ height: totalHeight, position: 'relative' }}
      >
        {visibleItems.map(({ index, item, style }) => (
          <div key={item.id} style={style}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Hook for virtual list with dynamic heights
export function useVirtualList<T = any>({
  items,
  estimatedItemHeight = 50,
  containerHeight,
  overscan = 5,
}: {
  items: T[];
  estimatedItemHeight?: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [itemHeights, setItemHeights] = useState<Map<number, number>>(new Map());
  const [scrollTop, setScrollTop] = useState(0);

  const getItemHeight = useCallback((index: number): number => {
    return itemHeights.get(index) || estimatedItemHeight;
  }, [itemHeights, estimatedItemHeight]);

  const setItemHeight = useCallback((index: number, height: number) => {
    setItemHeights(prev => new Map(prev.set(index, height)));
  }, []);

  const totalHeight = useMemo(() => {
    return items.reduce((total, _, index) => total + getItemHeight(index), 0);
  }, [items, getItemHeight]);

  const visibleRange = useMemo(() => {
    let startIndex = 0;
    let endIndex = 0;
    let currentOffset = 0;

    // Find start index
    for (let i = 0; i < items.length; i++) {
      const height = getItemHeight(i);
      if (currentOffset + height > scrollTop) {
        startIndex = Math.max(0, i - overscan);
        break;
      }
      currentOffset += height;
    }

    // Find end index
    currentOffset = 0;
    for (let i = startIndex; i < items.length; i++) {
      const height = getItemHeight(i);
      currentOffset += height;
      if (currentOffset > containerHeight + overscan * estimatedItemHeight) {
        endIndex = Math.min(items.length - 1, i + overscan);
        break;
      }
    }

    if (endIndex === 0) {
      endIndex = Math.min(items.length - 1, startIndex + Math.ceil(containerHeight / estimatedItemHeight) + overscan);
    }

    return { startIndex, endIndex };
  }, [scrollTop, containerHeight, items.length, getItemHeight, overscan, estimatedItemHeight]);

  const offsetY = useMemo(() => {
    let offset = 0;
    for (let i = 0; i < visibleRange.startIndex; i++) {
      offset += getItemHeight(i);
    }
    return offset;
  }, [visibleRange.startIndex, getItemHeight]);

  return {
    visibleRange,
    totalHeight,
    offsetY,
    scrollTop,
    setScrollTop,
    getItemHeight,
    setItemHeight,
  };
}