import React, { useEffect } from 'react';
import '../scss/Layout.scss';
import Header from '../components/Header.tsx';
import { useStatusbarColor } from '../utils/useStatusbarColor';

interface LayoutProps {
	title?: string;
	disableBackButton?: boolean;
	disableLogo?: boolean;
	children: React.ReactNode;
	noPadding?: boolean;
	backgroundColor?: string;
	noHeader?: boolean;
	onBack?: () => void;
	// Overrides the admin's own wijk colour for pages whose subject belongs to
	// a different wijk — a hut you looked up, or a child's ticket. Themes the
	// whole page including the app bar, so the colour context is unmistakable.
	theme?: string;
}

const Layout: React.FC<LayoutProps> = ({ title, children, disableBackButton, noPadding, backgroundColor, disableLogo, noHeader, onBack, theme }) => {
	const wijkName = theme || localStorage.getItem('wijkName') || 'blue';

	// Update statusbar color based on current wijk
	useStatusbarColor();

	// The wijk theme lives on <body> so that fixed-position chrome (tab bar,
	// modals, sticky footers) inherits the same --wijk-* tokens as the page.
	useEffect(() => {
		const themeClass = `theme-${wijkName}`;
		document.body.classList.add(themeClass);
		return () => document.body.classList.remove(themeClass);
	}, [wijkName]);

	useEffect(() => {
		if (backgroundColor) {
			document.body.classList.add(`page-with-${backgroundColor}-background`);

			return () => {
				document.body.classList.remove(`page-with-${backgroundColor}-background`);
			};
		}
	}, []);

	const footer = React.Children.toArray(children).filter((child) => {
		return React.isValidElement(child) && child.type === 'footer';
	});

	const header = noHeader ? null : <Header title={title || ''} disableBackButton={disableBackButton} disableLogo={disableLogo} color={wijkName} onBack={onBack} />

	if (footer.length > 0) { // page has footer
		children = React.Children.toArray(children).filter((child) => {
			return React.isValidElement(child) && child.type !== 'footer';
		});

		return (
			<>
				{header}
				<div className={"main-content has-footer " + wijkName + (noPadding ? " no-padding" : "")}>
					<div className="content-excluding-footer">
						{children}
					</div>
					{footer}
				</div>
			</>
		);
	} else {
		// page has no footer
		return (
			<>
				{header}
				<div className={"main-content " + wijkName + (noPadding ? " no-padding" : "")}>
					{children}
				</div>
			</>
		);
	}
};

export default Layout;
