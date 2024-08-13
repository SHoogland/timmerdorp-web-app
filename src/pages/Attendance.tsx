import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import { useNavigate } from 'react-router-dom';
import LoadingIcon from '../components/LoadingIcon';

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
	const navigate = useNavigate();

	useEffect(() => {
		const weekdays = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
		const today = new Date().getDay();
		let weekday = weekdays[today];
		if(today < 2 || today > 5) {
			alert('Nog even wachten tot Timmerdorp!');
			navigate('/');
			weekday = 'Dinsdag';
		}
		setWeekdayDisplayname(weekday);
		setWeekday(weekday.substring(0, 2).toLowerCase());
	}, [])		


	const togglePresence = () => {
		if (wristbandNumber.length < 3) return;
		if (!foundChild || !foundChild.id) {
			alert('Geen kind gevonden!');
			return;
		}

		let absenceReason;
		if (foundChildIsAlreadyPresent) {
			absenceReason = prompt('Reden van afwezigheid:');
			if(absenceReason == null) {
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
				searchInput.focus();
				searchInput.value = '';
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
		if(wb.length == 3) {
			search(wb);
		} else {
			setFoundChild({});
			setHasFoundChild(false);
			setHasSearched(false);
			setSearchIsLoading(false);
		}
	}

	const search = (wristband: number) => {
		setSearchIsLoading(true);
		setHasSearched(false);
		apiCall('findChildByWristband', { wristband }).then((result) => {
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

			setFoundChild(result.ticket);
			setHasFoundChild(true);
			setFoundChildIsAlreadyPresent(result.ticket['aanwezig_' + weekday]);
		});
	}

	


	return (
		<Layout title="Aanwezigheid">
			<center>
				<h2>Aanwezigheid registreren voor {weekdayDisplayname}</h2>
				<input
					type="number"
					maxLength={3}
					title="Polsbandnummer"
					id="searchInput"
					onChange={(e) => wristbandInputChange(e)}
					onKeyUp={(e) => e.key == 'Enter' ? togglePresence() : null}
					placeholder="000"
					style={{ "display": "inline-block", "right": "24px" }}
					className="wristband-number"
				/>
				<button
					onClick={togglePresence}
					style={{ "display": "inline-block" }}
					className={btnColor + " big"}
				>
					<LoadingIcon color="white" shown={togglePresenceIsLoading} />
					{ !togglePresenceIsLoading && (btnColor == 'green' ? 'Opgeslagen!' : (foundChildIsAlreadyPresent ? "Afwezig melden" : "Aanwezig melden"))}
				</button>
				<br />

				<LoadingIcon color="white" shown={searchIsLoading} />
				<br />
				<br />
			</center>
			{
				hasSearched && hasFoundChild && (
					<div className="card">
						<h2>Kind #{wristbandNumber}</h2>
						<table>
							<tbody>
								<tr>
									<td>Naam:</td>
									<td>{foundChild.firstName} {foundChild.lastName}</td>
								</tr>
								
								<tr>
									<td>Hutnummer:</td>
									<td>{foundChild.hutNr}</td>
								</tr>

								<tr>
									<td>Aanwezig vandaag:</td>
									<td>{foundChild['aanwezig_' + weekday] ? 'Ja' : 'Nee'}</td>
								</tr>
							</tbody>
							
						</table>
					</div>
				)
			}
			{
				hasSearched && !hasFoundChild && (
					<div className="card error">
						Geen kind gevonden!
					</div>
				)
			}
		</Layout >
	);
}

export default Attendance;
