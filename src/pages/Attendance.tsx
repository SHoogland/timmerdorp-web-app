import { useEffect, useState } from 'react';
import { MdCheckCircle, MdErrorOutline, MdRemoveCircleOutline } from 'react-icons/md';
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
	const [outsideEventDays, setOutsideEventDays] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const weekdays = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
		const today = new Date().getDay();
		let weekday = weekdays[today];
		// Outside Tuesday-Friday there is no day to register against. Rather
		// than an alert that boots you back to the homepage, the page opens in
		// a clearly disabled state and says why.
		if (today < 2 || today > 5) {
			setOutsideEventDays(true);
			weekday = 'Dinsdag';
		}
		setWeekdayDisplayname(weekday);
		const dayCode = weekday.substring(0, 2).toLowerCase();
		setWeekday(dayCode);

		// Check for wristband parameter in URL and auto-search
		const urlParams = new URLSearchParams(window.location.search);
		const bandjeParam = urlParams.get('bandje');
		if (bandjeParam && bandjeParam.length === 3) {
			setWristbandNumber(bandjeParam);
			// Use setTimeout to ensure the component is fully mounted
			setTimeout(() => {
				// Pass the raw string, not parseInt(bandjeParam) — that stripped
				// leading zeros (e.g. "007" -> 7 -> "7"), which then failed to
				// match the zero-padded wristband stored on the ticket.
				// Also pass dayCode explicitly: setWeekday() above hasn't been
				// applied yet when this closure was created, so search() would
				// otherwise read the stale initial weekday state ('') and never
				// detect the child as already present — the button then always
				// said "Aanwezig melden" instead of "Afwezig melden".
				search(bandjeParam, dayCode);
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
				// Cancelling the prompt aborts the whole action, so say that
				// plainly rather than scolding the user for a missing reason.
				alert('Let op: afwezig melden geannuleerd! Je moet een reden opgeven als je iemand afwezig meldt.');
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

	const search = (wristband: number | string, dayOverride?: string) => {
		// Wristbands are zero-padded 3-digit strings ("007", "042", ...) and
		// the backend matches on the exact string, so this must never round
		// through a number — parseInt/String would drop the leading zeros
		// and silently fail to find the ticket.
		const wristbandStr = String(wristband);
		// dayOverride lets callers (the mount-time auto-search) pass the day
		// code straight through instead of reading the weekday state, which
		// may not have applied yet in their closure. Manual searches from the
		// input always run after that state has settled, so the fallback is
		// safe there.
		const day = dayOverride || weekday;
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
			if ((day === 'wo' || day === 'do' || day === 'vr') && !result.ticket.hutNr) {
				alert('Let op: Dit kind heeft nog geen hutnummer!!!');
			}

			setFoundChild(result.ticket);
			setHasFoundChild(true);
			setFoundChildIsAlreadyPresent(result.ticket['aanwezig_' + day]);
		});
	}

	// --- purely derived display values, no state or behaviour involved
	const hutNr = foundChild.hutNr;
	const hutWijk = getWijkColor(hutNr);
	const isPresentToday = !!foundChild['aanwezig_' + weekday];
	// btnColor wins so the "Opgeslagen!" flash stays green; otherwise the
	// button wears the colour of the state it will move the child *into*.
	const actionTone = btnColor || (foundChildIsAlreadyPresent ? 'red' : 'green');

	return (
		<Layout title="Aanwezigheid">
			<div className="attendance-page">
				<h2 className="attendance-day">Aanwezigheid registreren voor {weekdayDisplayname}</h2>

				{outsideEventDays && (
					<div className="attendance-closed">
						<p>Timmerdorp loopt van dinsdag tot en met vrijdag. Vandaag kun je geen aanwezigheid registreren.</p>
					</div>
				)}

				<div className="attendance-entry">
					<label htmlFor="searchInput">Polsbandnummer</label>
					<input
						type="tel"
						inputMode="numeric"
						maxLength={3}
						title="Polsbandnummer"
						id="searchInput"
						value={wristbandNumber}
						onChange={(e) => wristbandInputChange(e)}
						onKeyUp={(e) => e.key == 'Enter' ? togglePresence() : null}
						placeholder="000"
						className="attendance-input"
					disabled={outsideEventDays}
					/>
				</div>

				<div className="attendance-slot">
					{searchIsLoading && (
						<div className="attendance-loading">
							<LoadingIcon shown={true} />
							<p>Zoeken naar kind...</p>
						</div>
					)}

					{hasSearched && hasFoundChild && (
						<div className="attendance-result">
							<h3 className="attendance-name display">{foundChild.firstName} {foundChild.lastName}</h3>

							<div className="attendance-facts">
								<div className="attendance-fact">
									<span className="fact-label">Polsbandnummer</span>
									<span className="fact-value">{wristbandNumber}</span>
								</div>

								{/* Tinted in the hut's own wijk colour: at a glance you see
								    which wijk the child belongs to, not just a small dot. */}
								<div className={`attendance-fact${hutNr ? ` is-wijk hut-${hutWijk}` : ''}`}>
									<span className="fact-label">Hutnummer</span>
									{hutNr ? (
										<span className="fact-value">{hutNr}</span>
									) : (
										<span className="fact-value is-empty">Niet toegewezen</span>
									)}
								</div>
							</div>

							<div className={`attendance-presence ${isPresentToday ? 'is-present' : 'is-absent'}`}>
								{isPresentToday ? <MdCheckCircle aria-hidden="true" /> : <MdRemoveCircleOutline aria-hidden="true" />}
								<span className="presence-copy">
									<span className="presence-label">Aanwezig vandaag</span>
									<span className="presence-value">{isPresentToday ? 'Ja' : 'Nee'}</span>
								</span>
							</div>
						</div>
					)}

					{hasSearched && !hasFoundChild && (
						<div className="card bg-red attendance-error">
							<MdErrorOutline className="icon" aria-hidden="true" />
							<div className="text-content">
								<p className="card-header">Geen kind gevonden met dit polsbandnummer!</p>
							</div>
						</div>
					)}
				</div>

				<div className="attendance-actionbar">
					<button
						onClick={togglePresence}
						className={`attendance-action big ${actionTone} ${togglePresenceIsLoading ? "with-loading-icon" : ""}`}
						disabled={outsideEventDays || !hasFoundChild || togglePresenceIsLoading}
					>
						<LoadingIcon color="white" shown={togglePresenceIsLoading} />
						{!togglePresenceIsLoading && (
							btnColor == 'green' ? 'Opgeslagen!' :
							(foundChildIsAlreadyPresent ? "Afwezig melden" : "Aanwezig melden")
						)}
					</button>
				</div>
			</div>
		</Layout>
	);
}

export default Attendance;
