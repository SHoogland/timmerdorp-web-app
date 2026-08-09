import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import { useNavigate } from 'react-router-dom';
import apiCall from '../utils/apiCall';
import LoadingIcon from '../components/LoadingIcon';
import { useIsMounted } from '../utils/useIsMounted';

interface Ticket {
	[key: string]: any;
}

function Wristband() {
	const [loading, setLoading] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [loadingSole, setLoadingSole] = useState(false);
	const [wristbandSuggestions, setWristbandSuggestions] = useState(['', '']);
	const [wristbandNumber, setWristbandNumber] = useState('');
	const [errorTitle, setErrorTitle] = useState('');
	const [errorHelp, setErrorHelp] = useState('');
	const [ticket, setTicket] = useState<Ticket>({});
	const navigate = useNavigate();
	const isMountedRef = useIsMounted();

	const formatWristbandNr = (num: number | string) => {
		num = '' + num;
		if (num.length == 3) {
			return num
		} else if (num.length == 2) {
			return '0' + num;
		} else {
			return '00' + num;
		}
	}

	useEffect(() => {
		if (window.location.href.includes('ticket-id=')) {
			setLoading(true);
			const ticketId = window.location.href.split('ticket-id=')[1].split('&')[0];
			apiCall('findChildById', { id: ticketId }).then((result) => {
				// Check if component is still mounted before updating state
				if (!isMountedRef.current) return;
				
				setLoading(false);
				if (result.response !== 'success') {
					if (result.response === 'unauthorized') {
						// one of two reasons: either the user is not logged in, or the user is not an admin
						// at /is-geen-beheerder both cases are handled
						navigate('/is-geen-beheerder');
						return;
					}
					setErrorTitle(result.error || result.response);
					setErrorHelp(result.errorMessage || result.response);
					return;
				}

				setTicket(result.ticket);
				// Only worth confirming when you landed here by scanning a ticket.
				// Arriving via "Polsbandje wijzigen" IS the confirmation, so
				// asking again is just an extra tap.
				const cameFromExplicitAction = new URLSearchParams(window.location.search).has('origin');
				if (result.ticket.wristband) {
					if (!cameFromExplicitAction && !confirm('Dit kind heeft al een polsbandje. Wil je een nieuw polsbandje toewijzen?')) {
						navigate('/');
					}
					// Prefill de textbox met het bestaande polsbandnummer
					setWristbandNumber(result.ticket.wristband);
				}
				// add kid to search history, as long as user didn't come from search page
				if (!cameFromExplicitAction) {
					// todo: add kid to search history
				}


				const lastWristbandAssignmentDate = localStorage.getItem('lastWristbandAssignmentDate'); // saved as unix timestamp
				if (lastWristbandAssignmentDate) {
					if (+new Date() - +lastWristbandAssignmentDate < 30 * 60 * 1000) {
						// last wristband was assigned within the past 30 minutes:
						// suggest the lastAssignedWristband + 1 and - 1
						const lastAssignedWristband: number = +(localStorage.getItem('lastAssignedWristband') || '-1');
						if (lastAssignedWristband > -1) {
							setWristbandSuggestions([formatWristbandNr(lastAssignedWristband - 1), formatWristbandNr(lastAssignedWristband + 1)]);
						}
					}
				}
			}).catch((error) => {
				// Handle any errors that might occur
				console.error('Error finding child by ID:', error);
			}).finally(() => {
				// Always reset loading state, but only if component is still mounted
				if (isMountedRef.current) {
					setLoading(false);
				}
			});
		} else {
			navigate('/');
		}
	}, []);

	const saveWristband = (wristbandNumberParam?: string) => {
		// Prevent multiple simultaneous calls
		if (isSaving) return;
		
		// implement save logic
		const newWristbandNumber = wristbandNumberParam || wristbandNumber;
		if (!newWristbandNumber || newWristbandNumber.length != 3) {
			alert('Ongeldig polsbandnummer');
			return;
		}
		setWristbandNumber(newWristbandNumber);
		const wristbandInput = document.getElementById('wristbandInput') as HTMLInputElement;
		wristbandInput.value = newWristbandNumber;

		setIsSaving(true);
		apiCall('assignWristband', { id: ticket.id, wristband: newWristbandNumber }).then((result) => {
			// Check if component is still mounted before updating state
			if (!isMountedRef.current) return;
			
			setIsSaving(false);
			if (result.response == 'duplicate') {
				setErrorTitle('Fout!');
				setErrorHelp('Dit polsbandje is al toegewezen aan een ander kind.');
				return;
			}
			if (result.response !== 'success') {
				setErrorTitle(result.error || result.response);
				setErrorHelp(result.errorMessage || result.response);
				return;
			}
			localStorage.setItem('lastWristbandAssignmentDate', '' + +new Date()); // save unix timestamp as string
			localStorage.setItem('lastAssignedWristband', newWristbandNumber);
			navigate('/');
		}).catch((error) => {
			// Handle any errors that might occur
			console.error('Error saving wristband:', error);
		}).finally(() => {
			// Always reset saving state, but only if component is still mounted
			if (isMountedRef.current) {
				setIsSaving(false);
			}
		});
	}

	const collectSole = () => {
		// Prevent multiple simultaneous calls
		if (loadingSole) return;
		
		setLoadingSole(true);
		apiCall('collectSole', { id: ticket.id }).then((result) => {
			// Check if component is still mounted before updating state
			if (!isMountedRef.current) return;
			
			if (result.response !== 'success') {
				alert(result.error || result.response);
				return;
			}
			// Only update state if the component is still mounted
			setTicket(prevTicket => ({ ...prevTicket, collectedSole: true }));
		}).catch((error) => {
			// Handle any errors that might occur
			console.error('Error collecting sole:', error);
		}).finally(() => {
			// Always reset loading state, but only if component is still mounted
			if (isMountedRef.current) {
				setLoadingSole(false);
			}
		});
	}

	return (
		<Layout title="Polsbandje toewijzen">
			<div className="wristband-page">
				<LoadingIcon shown={loading} />

				{errorTitle && <p className="wristband-error"><b>{errorTitle}</b><br />{errorHelp}</p>}
				{!loading && ticket.id && (
					<table className="ticketTable">
						<tbody>
							<tr>
								<td><b>Naam:</b></td>
								<td>{ticket.firstName + ' ' + ticket.lastName}</td>
							</tr>
							<tr>
								<td><b>Ticketnummer:</b></td>
								<td>{ticket.id}</td>
							</tr>
							<tr>
								<td><b>Geboortedatum:</b></td>
								<td>{ticket.birthdate}</td>
							</tr>
							{ticket.hutNr && (
								<tr>
									<td><b>Hutnummer:</b></td>
									<td>{ticket.hutNr}</td>
								</tr>
							)}
							<tr>
								<td><b>Zooltjes besteld:</b></td>
								<td>{ticket.hasSole ? 'Ja' : 'Nee'}</td>
							</tr>
							{ticket.hasSole && (
								<tr>
									<td><b>Zooltjes opgehaald:</b></td>
									<td className="sole-cell">
										<label className="sole-toggle" htmlFor="collectedSole">
											<input
												id="collectedSole"
												type="checkbox"
												checked={ticket.collectedSole}
												onClick={() => !ticket.collectedSole ? collectSole() : ''}
												disabled={ticket.collectedSole}
											/>
											<LoadingIcon shown={loadingSole} />
											{!loadingSole && (ticket.collectedSole ? "Ja" : "Nee")}
										</label>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				)}

				{wristbandSuggestions[0] != '' && <p className="wristband-suggestions"><b>Wil je soms <a onClick={() => saveWristband(wristbandSuggestions[0])}>bandje {wristbandSuggestions[0]}</a> of <a onClick={() => saveWristband(wristbandSuggestions[1])}>bandje {wristbandSuggestions[1]}</a> toewijzen?</b></p>}
				<div className="wristband-entry">
					<input
						type="number"
						maxLength={3}
						title="Polsbandnummer"
						id="wristbandInput"
						value={wristbandNumber}
						onChange={(e) => setWristbandNumber(e.target.value)}
						onKeyUp={(e) => e.key == 'Enter' ? saveWristband() : null}
						placeholder="000"
						className="wristband-number"
					/>
					<button
						onClick={() => saveWristband()}
						className="big"
					>
						Opslaan
					</button>
				</div>

				{isSaving && <p className="wristband-saving">Opslaan...</p>}
			</div>
		</Layout>
	);
}

export default Wristband;
