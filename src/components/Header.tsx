import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import '../scss/Header.scss';
import { FaChevronLeft } from 'react-icons/fa';

interface HeaderProps {
	title: string;
	disableBackButton?: boolean;
	disableLogo?: boolean;
	color?: string;
	// Defaults to going home. Detail pages pass navigate(-1) so back returns
	// to the list you came from with its search term still in place.
	onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, disableBackButton, color, disableLogo, onBack }) => {
	const navigate = useNavigate();

	// A title may carry a subtitle as `Main <<sub>>`, rendered underneath.
	let headerElement = <>{title}</>;
	if (title.includes('<<') && title.includes('>>')) {
		const parts = title.split('<<');
		headerElement = (
			<>
				{parts[0].trim()}
				<span className="small">{parts[1].split('>>')[0]}</span>
				{parts[1].split('>>')[1]}
			</>
		);
	}

	return (
		<header className={`appbar ${color || 'blue'}`}>
			{disableBackButton ? (
				<span className="appbar-spacer" />
			) : (
				<button type="button" className="appbar-btn" aria-label="Terug" onClick={onBack || (() => navigate('/'))}>
					<FaChevronLeft />
				</button>
			)}
			<h1>{headerElement}</h1>
			{disableLogo ? <span className="appbar-spacer" /> : <img className="appbar-logo" src={logo} alt="" />}
		</header>
	);
};

export default Header;
