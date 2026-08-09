import React from 'react';
import Icon from './Icon';
import '../scss/BottomBar.scss';

interface BottomBarButton {
	icon: string;
	label?: string;
	onClick: () => void;
	active?: boolean;
}

interface BottomBarProps {
	buttons: BottomBarButton[];
	wijk?: string;
}

const BottomBar: React.FC<BottomBarProps> = ({ buttons, wijk }) => {
	return (
		<nav className={`bottom-bar ${wijk || ''}`}>
			{buttons.map((btn, idx) => (
				<button
					key={idx}
					type="button"
					className={`bottom-bar-btn${btn.active ? ' active' : ''}`}
					onClick={btn.onClick}
					aria-label={btn.label}
				>
					<Icon name={btn.icon} />
					{btn.label && <span className="bottom-bar-label">{btn.label}</span>}
				</button>
			))}
		</nav>
	);
};

export default BottomBar;
