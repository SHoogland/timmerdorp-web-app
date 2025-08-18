import { useEffect, useRef } from 'react';

/**
 * Custom hook that provides a mounted state check
 * This prevents state updates after a component has unmounted
 * which can cause React warnings and DOM manipulation errors
 */
export function useIsMounted() {
	const isMountedRef = useRef(true);

	useEffect(() => {
		// Set mounted flag
		isMountedRef.current = true;
		
		// Cleanup function
		return () => {
			isMountedRef.current = false;
		};
	}, []);

	return isMountedRef;
}
