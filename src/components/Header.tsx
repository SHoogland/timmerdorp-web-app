import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../scss/Header.scss';
import { FaArrowLeft } from 'react-icons/fa';


interface HeaderProps {
	title: string;
	disableBackButton?: boolean;
	disableLogo?: boolean;
	color?: string;
}

const Header: React.FC<HeaderProps> = ({ title, disableBackButton, color, disableLogo }) => {
	const navigate = useNavigate();

	// if header title contains <<text>>, wrap text in <span> with class 'small'
	let headerElement = <>{title}</>;
	if (title.includes('<<') && title.includes('>>')) {
		const parts = title.split('<<');
		headerElement = (
			<>
				{parts[0]}
				<span className="small">{parts[1].split('>>')[0]}</span>
				{parts[1].split('>>')[1]}
			</>
		);
	}

	return (
		<header className={color || "blue"}>
			{ disableBackButton ? null : <FaArrowLeft id="back-btn" onClick={() => navigate('/')} /> }
			<h1 className={(disableBackButton ? 'no-back-button ' : '') + (disableLogo ? 'no-logo' : '')}>{ headerElement }</h1>
			{ disableLogo ? null : <img src={logo} alt="tdorp logo" /> }
		</header>
	);
};

export default Header;