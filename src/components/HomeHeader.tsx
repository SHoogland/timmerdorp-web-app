import React from 'react';

const currentYear = new Date().getFullYear();

const HomeHeader: React.FC = () => {
	return (
		<header className="home-header">
			<div id="overlay">
				<div id="titleContainer">
					<h1 id="ptitle" className="home-header">
						Timmerdorp <br />{currentYear}
					</h1>
				</div>
			</div>
		</header>
	);
};

export default HomeHeader;
