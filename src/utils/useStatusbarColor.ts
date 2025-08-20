import { useEffect } from 'react';
import getCurrentWijk from './getCurrentWijk';
import getWijkHexColor from './getWijkHexColor';

export const useStatusbarColor = () => {
	useEffect(() => {
		const updateStatusbarColor = () => {
			const currentWijk = getCurrentWijk();
			const hexColor = getWijkHexColor(currentWijk);
			
			// Update theme-color meta tag
			let themeColorMeta = document.querySelector('meta[name="theme-color"]');
			if (!themeColorMeta) {
				themeColorMeta = document.createElement('meta');
				themeColorMeta.setAttribute('name', 'theme-color');
				document.head.appendChild(themeColorMeta);
			}
			themeColorMeta.setAttribute('content', hexColor);
			
			// Update msapplication-TileColor meta tag
			let tileColorMeta = document.querySelector('meta[name="msapplication-TileColor"]');
			if (!tileColorMeta) {
				tileColorMeta = document.createElement('meta');
				tileColorMeta.setAttribute('name', 'msapplication-TileColor');
				document.head.appendChild(tileColorMeta);
			}
			tileColorMeta.setAttribute('content', hexColor);
			
			// Update apple-mobile-web-app-status-bar-style for iOS
			let appleStatusBarMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
			if (!appleStatusBarMeta) {
				appleStatusBarMeta = document.createElement('meta');
				appleStatusBarMeta.setAttribute('name', 'apple-mobile-web-app-status-bar-style');
				document.head.appendChild(appleStatusBarMeta);
			}
			appleStatusBarMeta.setAttribute('content', 'black-translucent');
		};

		// Update immediately
		updateStatusbarColor();

		// Listen for storage changes (when wijk changes)
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'wijkName') {
				updateStatusbarColor();
			}
		};

		// Listen for custom wijk change events
		const handleWijkChange = () => {
			updateStatusbarColor();
		};

		window.addEventListener('storage', handleStorageChange);
		window.addEventListener('wijkChanged', handleWijkChange);

		return () => {
			window.removeEventListener('storage', handleStorageChange);
			window.removeEventListener('wijkChanged', handleWijkChange);
		};
	}, []);
};
