import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../scss/Header.scss';
import { FaArrowLeft } from 'react-icons/fa';


interface HeaderProps {
	title: string;
	disableBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, disableBackButton }) => {
	const navigate = useNavigate();

	return (
		<header>
			{ disableBackButton ? null : <FaArrowLeft id="back-btn" onClick={() => navigate('/')} /> }
			<h1>{title}</h1>
			<img src={logo} alt="tdorp logo" />
		</header>
	);
};

export default Header;