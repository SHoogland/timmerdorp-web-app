import React from 'react';
import Icon from './Icon';
import '../scss/BottomBar.scss';

interface BottomBarButton {
	icon: string;
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
				       className={`bottom-bar-btn ${wijk || ''}${btn.active ? ' active' : ''}`}
				       onClick={btn.onClick}
			       >
				       <Icon name={btn.icon} />
			       </button>
		       ))}
	       </nav>
       );
};

export default BottomBar;
