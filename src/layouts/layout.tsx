import React from 'react';
import '../scss/Layout.scss';
import Header from '../components/Header';

interface LayoutProps {
	title: string;
	disableBackButton?: boolean;
	children: React.ReactNode;
	noPadding?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ title, children, disableBackButton, noPadding }) => {
	const wijkName = localStorage.getItem('wijkName') || 'blue';

	return (
		<>
			<Header title={title} disableBackButton={disableBackButton} color={wijkName} />
			<div className={"main-content " + wijkName + (noPadding ? " no-padding" : "")}>
				{children}
			</div>
		</>
	);
};

export default Layout;