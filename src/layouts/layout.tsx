import React, { useEffect } from 'react';
import '../scss/Layout.scss';
import Header from '../components/Header';

interface LayoutProps {
	title?: string;
	disableBackButton?: boolean;
	disableLogo?: boolean;
	children: React.ReactNode;
	noPadding?: boolean;
	backgroundColor?: string;
	noHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ title, children, disableBackButton, noPadding, backgroundColor, disableLogo, noHeader }) => {
	const wijkName = localStorage.getItem('wijkName') || 'blue';

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

	const header = noHeader ? null : <Header title={title || ''} disableBackButton={disableBackButton} disableLogo={disableLogo} color={wijkName} />

	if (footer.length > 0) { // page has footer
		children = React.Children.toArray(children).filter((child) => {
			return React.isValidElement(child) && child.type !== 'footer';
		});

		return (
			<>
				<div className={"main-content has-footer " + wijkName + (noPadding ? " no-padding" : "")}>
					<div className="content-excluding-footer">
						{header}
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