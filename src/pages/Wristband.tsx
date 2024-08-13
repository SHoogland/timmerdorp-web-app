import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import { useNavigate } from 'react-router-dom';
import apiCall from '../utils/apiCall';
import LoadingIcon from '../components/LoadingIcon';

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


	useEffect(() => {
		if (window.location.href.includes('ticket-id=')) {
			setLoading(true);
			const ticketId = window.location.href.split('ticket-id=')[1].split('&')[0];
			apiCall('findChildById', { id: ticketId }).then((result) => {
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
				if (result.ticket.wristbandNumber) {
					if (!confirm('Dit kind heeft al een polsbandje. Wil je een nieuw polsbandje toewijzen?')) {
						navigate('/');
					}
				}
				// add kid to search history, as long as user didn't come from search page
				if (!window.location.href.includes('&origin=search')) {
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
			});
		} else {
			navigate('/');
		}
	}, []);


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

	const saveWristband = (wristbandNumberParam?: string) => {
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
		});
	}

	const collectSole = () => {		
		setLoadingSole(true);
		apiCall('collectSole', { id:  ticket.id }).then((result) => {
			setLoadingSole(false);
			if (result.response !== 'success') {
				alert(result.error || result.response);
				return;
			}
			setTicket({ ...ticket, collectedSole: true });
		});
	}

	return (
		<Layout title="Polsbandje toewijzen">
			<center>
				<LoadingIcon shown={loading}/>

				{errorTitle && <p><b>{errorTitle}</b><br />{errorHelp}</p>}
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
							<tr>
								<td><b>Zooltjes opgehaald:</b></td>
								<td>
									<input
										type="checkbox"
										checked={ticket.collectedSole}
										onClick={() => !ticket.collectedSole ? collectSole() : ''}
										disabled={ticket.collectedSole}
									/>
									<LoadingIcon shown={loadingSole}/>
									{!loadingSole && (ticket.collectedSole ? "Ja" : "Nee")}
								</td>
							</tr>
						</tbody>
					</table>
				)}

				<br />
				{wristbandSuggestions[0] != '' && <p><b>Wil je soms <a onClick={() => saveWristband(wristbandSuggestions[0])}>bandje {wristbandSuggestions[0]}</a> of <a onClick={() => saveWristband(wristbandSuggestions[1])}>bandje {wristbandSuggestions[1]}</a> toewijzen?</b></p>}
				<input
					type="number"
					maxLength={3}
					title="Polsbandnummer"
					id="wristbandInput"
					onChange={(e) => setWristbandNumber(e.target.value)}
					onKeyUp={(e) => e.key == 'Enter' ? saveWristband() : null}
					placeholder="000"
					style={{ "display": "inline-block", "right": "24px" }}
					className="wristband-number"
				/>
				<button
					onClick={() => saveWristband()}
					style={{ "display": "inline-block" }}
					className="big"
				>
					Opslaan
				</button>

				{isSaving && <p>Opslaan...</p>}
			</center>
		</Layout>
	);
}

export default Wristband;
