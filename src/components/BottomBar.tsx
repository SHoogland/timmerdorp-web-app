import React from 'react';
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
				       <i className="material-icons">{btn.icon}</i>
			       </button>
		       ))}
	       </nav>
       );
};

export default BottomBar;
