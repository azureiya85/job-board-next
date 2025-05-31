import { RefObject, useCallback, useEffect, useState } from 'react';

export interface ScrollState {
  canScrollLeft: boolean;
  canScrollRight: boolean;
}

export function useHorizontalScroll(
  scrollContainerRef: RefObject<HTMLDivElement | null>,
  itemsLength: number,
  scrollAmount: number = 300
) {
  const [scrollState, setScrollState] = useState<ScrollState>({
    canScrollLeft: false,
    canScrollRight: false,
  });

  // Check scroll position and update button states
  const updateScrollButtons = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setScrollState({
        canScrollLeft: scrollLeft > 0,
        canScrollRight: Math.ceil(scrollLeft) < scrollWidth - clientWidth - 1,
      });
    }
  }, [scrollContainerRef]);

  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  }, [scrollContainerRef, scrollAmount]);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, [scrollContainerRef, scrollAmount]);

  // Effect for scroll listeners and button updates
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && itemsLength > 0) {
      updateScrollButtons(); // Initial check
      
      const handleScrollOrResize = () => updateScrollButtons();
      container.addEventListener('scroll', handleScrollOrResize);
      window.addEventListener('resize', handleScrollOrResize);
      
      const timeoutId = setTimeout(updateScrollButtons, 150);
      
      return () => {
        if (container) {
          container.removeEventListener('scroll', handleScrollOrResize);
        }
        window.removeEventListener('resize', handleScrollOrResize);
        clearTimeout(timeoutId);
      };
    } else {
      setScrollState({
        canScrollLeft: false,
        canScrollRight: false,
      });
    }
  }, [itemsLength, updateScrollButtons, scrollContainerRef]);

  return {
    scrollState,
    scrollLeft,
    scrollRight,
    updateScrollButtons,
  };
}

export function createScrollIndicators(itemsLength: number, maxIndicators: number = 5) {
  return Array.from({ length: Math.min(itemsLength, maxIndicators) }).map((_, index) => index);
}