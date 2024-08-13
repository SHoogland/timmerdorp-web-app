import React from 'react';
import '../scss/LoadingIcon.scss';
import hamerWit from '../assets/hamer-wit.gif';
import hamerZwart from '../assets/hamer-zwart.gif';

interface LoadingIconProps {
	color?: string;
	shown?: boolean;
}

const LoadingIcon: React.FC<LoadingIconProps> = ({ color, shown }) => {
	return (
		<div className={`loading-icon ${shown ? 'shown' : ''}`}>
			<img src={color === "white" ? hamerWit : hamerZwart} alt="loading icon" />
		</div>
	);
};

export default LoadingIcon;