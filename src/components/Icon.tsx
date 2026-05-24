import React from 'react';
import {
	MdSearch,
	MdInfo,
	MdInsertChart,
	MdHowToReg,
	MdQrCodeScanner,
	MdPersonAddAlt,
	MdCake,
	MdSettings,
	MdLogout,
	MdWbSunny,
	MdWaterDrop,
	MdWbCloudy,
} from 'react-icons/md';
import type { IconType } from 'react-icons';

const iconMap: Record<string, IconType> = {
	search: MdSearch,
	info: MdInfo,
	insert_chart: MdInsertChart,
	how_to_reg: MdHowToReg,
	qr_code_scanner: MdQrCodeScanner,
	person_add_alt: MdPersonAddAlt,
	cake: MdCake,
	settings: MdSettings,
	logout: MdLogout,
	wb_sunny: MdWbSunny,
	water_drop: MdWaterDrop,
	'partly-sunny': MdWbCloudy,
};

interface IconProps {
	name: string;
	className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className }) => {
	const Component = iconMap[name];
	const combined = className ? `material-icons ${className}` : 'material-icons';
	if (!Component) {
		return <i className={combined} aria-hidden="true" />;
	}
	return (
		<i className={combined} aria-hidden="true">
			<Component size="1em" />
		</i>
	);
};

export default Icon;
