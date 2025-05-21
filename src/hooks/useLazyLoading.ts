import { useEffect, useRef, useState, type RefObject } from '../utils/react-imports';

interface UseLazyLoadingOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

/**
 * Custom hook for lazy loading elements when they enter the viewport
 * @param options Intersection observer options
 * @returns Object containing ref to attach to element and boolean indicating if element is visible
 */
export const useLazyLoading = <T extends HTMLElement>(
  options: UseLazyLoadingOptions = {}
): {
  ref: RefObject<T>;
  isVisible: boolean;
} => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<T>(null);
  const { rootMargin = '200px', threshold = 0, triggerOnce = true } = options;

  useEffect(() => {
    // Skip if element ref is not set or if already visible and triggerOnce is true
    if (!ref.current || (isVisible && triggerOnce)) return;

    const element = ref.current;

    // Create an observer instance
    const observer = new IntersectionObserver(
      (entries) => {
        // We're only observing one element, so we can just use the first entry
        const [entry] = entries;

        // Update state when element becomes visible
        if (entry.isIntersecting) {
          setIsVisible(true);

          // Stop observing if triggerOnce is true
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          // If triggerOnce is false, update state when element leaves viewport
          setIsVisible(false);
        }
      },
      { rootMargin, threshold }
    );

    // Start observing the element
    observer.observe(element);

    // Clean up observer on unmount
    return () => {
      observer.unobserve(element);
      observer.disconnect();
    };
  }, [rootMargin, threshold, triggerOnce, isVisible]);

  return { ref, isVisible };
};

export default useLazyLoading;
