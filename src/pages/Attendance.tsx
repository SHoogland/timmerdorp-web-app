import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import { useNavigate } from 'react-router-dom';
import LoadingIcon from '../components/LoadingIcon';
import { FaInfoCircle } from 'react-icons/fa';

interface Ticket {
	[key: string]: any;
}

function Attendance() {
	const [wristbandNumber, setWristbandNumber] = useState('');
	const [togglePresenceIsLoading, setTogglePresenceIsLoading] = useState(false);
	const [btnColor, setBtnColor] = useState('');
	const [searchIsLoading, setSearchIsLoading] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [hasFoundChild, setHasFoundChild] = useState(false);
	const [foundChild, setFoundChild] = useState<Ticket>({});
	const [foundChildIsAlreadyPresent, setFoundChildIsAlreadyPresent] = useState(false);
	const [weekday, setWeekday] = useState('');
	const [weekdayDisplayname, setWeekdayDisplayname] = useState('');
	const [currentWijk, setCurrentWijk] = useState<string>('blue');
	const navigate = useNavigate();

	useEffect(() => {
		// Get current wijk for theming
		const wijkName = localStorage.getItem('wijkName') || 'blue';
		setCurrentWijk(wijkName);
		
		const weekdays = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
		const today = new Date().getDay();
		let weekday = weekdays[today];
		if (today < 2 || today > 5) {
			alert('Nog even wachten tot Timmerdorp!');
			navigate('/');
			weekday = 'Dinsdag';
		}
		setWeekdayDisplayname(weekday);
		setWeekday(weekday.substring(0, 2).toLowerCase());

		// Check for wristband parameter in URL and auto-search
		const urlParams = new URLSearchParams(window.location.search);
		const bandjeParam = urlParams.get('bandje');
		if (bandjeParam && bandjeParam.length === 3) {
			setWristbandNumber(bandjeParam);
			// Use setTimeout to ensure the component is fully mounted
			setTimeout(() => {
				search(parseInt(bandjeParam));
			}, 100);
		}
	}, [navigate])		

	const togglePresence = () => {
		if (wristbandNumber.length < 3) return;
		if (!foundChild || !foundChild.id) {
			alert('Geen kind gevonden!');
			return;
		}

		let absenceReason;
		if (foundChildIsAlreadyPresent) {
			absenceReason = prompt('Reden van afwezigheid:');
			if (absenceReason == null) {
				alert('Geef wel een reden op!');
				return;
			}
		}
		setTogglePresenceIsLoading(true);
		apiCall('togglePresence', { ticket: foundChild, day: weekday, reason: absenceReason }).then((result) => {
			setTogglePresenceIsLoading(false);
			if (!result || (result || {}).response != "success") {
				alert((foundChildIsAlreadyPresent ? 'Afwezig' : 'Aanwezig') + ' melden niet gelukt! Vraag na bij Stan of Stephan wat er mis ging...');
			} else {
				foundChild['aanwezig_' + weekday] = result.newPresence;
				setHasSearched(false);
				setHasFoundChild(false);
				setFoundChild({});
				setWristbandNumber('');
				setFoundChildIsAlreadyPresent(false);
				const searchInput = document.getElementById('searchInput') as HTMLInputElement;
				if (searchInput) {
					searchInput.focus();
					searchInput.value = '';
				}
				setBtnColor('green');
				setTimeout(() => {
					setBtnColor('');
				}, 1200);
			}
		});
	};

	const wristbandInputChange = (e: any) => {
		const wb = e.target.value;
		setWristbandNumber(wb);
		if (wb.length == 3) {
			search(wb);
		} else {
			setFoundChild({});
			setHasFoundChild(false);
			setHasSearched(false);
			setSearchIsLoading(false);
			setFoundChildIsAlreadyPresent(false);
		}
	}

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

	const search = (wristband: number) => {
		const wristbandStr = String(wristband);
		setSearchIsLoading(true);
		setHasSearched(false);
		apiCall('findChildByWristband', { wristband: wristbandStr }).then((result) => {
			setSearchIsLoading(false);
			setHasSearched(true);
			if (!result || (result || {}).response != "success") {
				if (result.response === 'unauthorized') {
					// one of two reasons: either the user is not logged in, or the user is not an admin
					// at /is-geen-beheerder both cases are handled
					navigate('/is-geen-beheerder');
					return;
				}
				setHasFoundChild(false);
				return;
			}


			// Check if it's Wednesday, Thursday, or Friday and if the ticket has no hutNr
			if ((weekday === 'wo' || weekday === 'do' || weekday === 'vr') && !result.ticket.hutNr) {
				alert('Let op: Dit kind heeft nog geen hutnummer!!!');
			}

			setFoundChild(result.ticket);
			setHasFoundChild(true);
			setFoundChildIsAlreadyPresent(result.ticket['aanwezig_' + weekday]);
		});
	}

	return (
		<Layout title="Aanwezigheid">
			<div className="attendance-container">
				<div className="attendance-header">
					<h2>Aanwezigheid registreren voor {weekdayDisplayname}</h2>
				</div>
				
				<div className="attendance-input-section">
					<div className="input-group">
						<label htmlFor="searchInput" className="input-label">Polsbandnummer</label>
						<input
							type="tel"
							maxLength={3}
							title="Polsbandnummer"
							id="searchInput"
							value={wristbandNumber}
							onChange={(e) => wristbandInputChange(e)}
							onKeyUp={(e) => e.key == 'Enter' ? togglePresence() : null}
							placeholder="000"
							className="wristband-number"
						/>
					</div>
					
					<div className="button-group">
						<button
							onClick={togglePresence}
							className={`attendance-button ${btnColor} big ${togglePresenceIsLoading ? "with-loading-icon" : ""}`}
							disabled={!hasFoundChild || togglePresenceIsLoading}
						>
							<LoadingIcon color="white" shown={togglePresenceIsLoading} />
							{!togglePresenceIsLoading && (
								btnColor == 'green' ? 'Opgeslagen!' : 
								(foundChildIsAlreadyPresent ? "Afwezig melden" : "Aanwezig melden")
							)}
						</button>
					</div>
				</div>

				{searchIsLoading && (
					<div className="loading-section">
						<LoadingIcon shown={true} />
						<p>Zoeken naar kind...</p>
					</div>
				)}

				{hasSearched && hasFoundChild && (
					<div className="card attendance-card">
						<div className={`card-header wijk-${getWijkColor(foundChild.hutNr)}`}>
							<h3>Kind #{wristbandNumber}</h3>
						</div>
						<div className="card-content">
							<div className="info-row">
								<span className="info-label">Naam:</span>
								<span className="info-value">{foundChild.firstName} {foundChild.lastName}</span>
							</div>
							
							<div className="info-row">
								<span className="info-label">Hutnummer:</span>
								<span className={`info-value wijk-accent-${getWijkColor(foundChild.hutNr)}`}>
									{foundChild.hutNr || 'Niet toegewezen'}
								</span>
							</div>

							<div className="info-row">
								<span className="info-label">Aanwezig vandaag:</span>
								<span className={`info-value status-${foundChild['aanwezig_' + weekday] ? 'present' : 'absent'}`}>
									{foundChild['aanwezig_' + weekday] ? 'Ja' : 'Nee'}
								</span>
							</div>
							
							<div className="info-row">
								<span className="info-label">Polsbandnummer:</span>
								<span className={`info-value wijk-accent-${getWijkColor(foundChild.hutNr)}`}>
									{wristbandNumber}
								</span>
								<FaInfoCircle className={`info-icon wijk-accent-${getWijkColor(foundChild.hutNr)}`} />
							</div>
						</div>
					</div>
				)}
				
				{hasSearched && !hasFoundChild && (
					<div className="card error-card">
						<div className="error-content">
							<span className="error-icon">⚠️</span>
							<p>Geen kind gevonden met dit polsbandnummer!</p>
						</div>
					</div>
				)}
			</div>
		</Layout>
	);
}

export default Attendance;
