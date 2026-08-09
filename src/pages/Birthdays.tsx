import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiCall from '../utils/apiCall';
import { FaShareAlt, FaSearch, FaBirthdayCake } from 'react-icons/fa';
import Layout from '../layouts/layout';
import LoadingIcon from '../components/LoadingIcon';
import '../scss/Birthdays.scss';

const Birthdays: React.FC = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<boolean>(false);
	const [data, setData] = useState<any>(null);
	const [days] = useState<string[]>(['di', 'wo', 'do', 'vr']);
	const [dates] = useState<string[]>(['Dinsdag 11 augustus', 'Woensdag 12 augustus', 'Donderdag 13 augustus', 'Vrijdag 14 augustus']);
	const [currentWijk, setCurrentWijk] = useState<string>('blue');
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				// Get current wijk for theming
				const wijkName = localStorage.getItem('wijkName') || 'blue';
				setCurrentWijk(wijkName);

				const result = await apiCall('wijkStats');
				if (result && result.response === 'success') {
					setData(result.birthdays);
				} else {
					if (result.response === 'unauthorized') {
						// one of two reasons: either the user is not logged in, or the user is not an admin
						// at /is-geen-beheerder both cases are handled
						navigate('/is-geen-beheerder');
						return;
					}
					setError(true);
				}
			} catch (err) {
				setError(true);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	// Function to get wijk color based on hut number
	const getWijkColor = (hutNr: string): string => {
		if (!hutNr) return 'onbekend';
		const firstDigit = hutNr[0];
		switch (firstDigit) {
			case '0': return 'yellow';
			case '1': return 'red';
			case '2': return 'blue';
			case '3': return 'green';
			default: return 'onbekend';
		}
	};

	// Function to get CSS class for wijk color
	const getWijkClass = (hutNr: string): string => {
		return getWijkColor(hutNr);
	};

	const shareDate = (d: string) => {
		const bdays = data[d].kids;
		const getWijk = (hutNr: string) => ['geel', 'rood', 'blauw', 'groen', 'onbekend'][parseInt(hutNr[0] || '4')];
		const getBdayMsg = (bday: any) => `${bday.name} ${bday.hutNr ? 'uit hutje ' + bday.hutNr + ' (wijk ' + getWijk(bday.hutNr) + ')' : '(onbekend hutje/wijk)'} wordt ${bday.newAge}!`;
		const msg = `Vandaag ${bdays.length > 1 ? 'zijn' : 'is'} er op Timmerdorp ${bdays.length} verjaardag${bdays.length > 1 ? 'en!\n -' : '!'} ${bdays.map(getBdayMsg).join('\n - ')}`;

		if (navigator.share) {
			navigator.share({
				title: 'Verjaardagen op Timmerdorp',
				text: msg,
				url: window.location.href
			});
		} else {
			alert(msg);
		}
	};

	const zoekKind = (kind: any) => {
		navigate(`/zoek?q=${kind.name}`);
	};

	if (loading) {
		return <LoadingIcon color="white" />;
	}

	if (error) {
		return <div>Er is iets fout gegaan...</div>;
	}

	return (
		<>
			<Layout title="Verjaardagen">
				<div className={`birthdays-page wijk-${currentWijk}`}>
					{days.map((d, i) => (
						<section key={d} id={d} className="section birthday-day">
							<div className="day-header">
								<h2 className="section-title">{dates[i]}</h2>
								<span className="day-count nums">{data[d].count}</span>
								{data[d].kids.length > 0 && (
									<button
										type="button"
										className="fab day-share"
										title="Deel verjaardagen"
										aria-label={`Deel de verjaardagen van ${dates[i]}`}
										onClick={() => shareDate(d)}
									>
										<FaShareAlt />
									</button>
								)}
							</div>

							{data[d].kids.length === 0 ? (
								<div className="empty-state">
									<p>Geen kinderen jarig</p>
								</div>
							) : (
								<div className="birthday-list">
									{data[d].kids.map((bday: any, idx: number) => (
										<button
											type="button"
											key={idx}
											className={`birthday-card wijk-${getWijkClass(bday.hutNr)}`}
											onClick={() => zoekKind(bday)}
										>
											<span className="cake-chip" aria-hidden="true">
												<FaBirthdayCake />
											</span>
											<span className="birthday-main">
												<span className="birthday-name">{bday.name}</span>
												<span className="birthday-sub">Wordt {bday.newAge}!</span>
												<span className="birthday-sub">Hutje: {bday.hutNr}</span>
											</span>
											<span className="birthday-search" aria-hidden="true">
												<FaSearch />
											</span>
										</button>
									))}
								</div>
							)}
						</section>
					))}
				</div>
			</Layout>
		</>
	);
};

export default Birthdays;
