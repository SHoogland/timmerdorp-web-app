import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import LoadingIcon from '../components/LoadingIcon';
import { useNavigate } from 'react-router-dom';
import generateGebeurtenisDescription from '../utils/generateGebeurtenisDescription';

interface Ticket {
	[key: string]: any;
}


interface TicketProperty {
	label: string;
	appLabel?: string;
}

interface TicketPropertiesMap {
	[key: string]: TicketProperty;
}

// The detail page wears the wijk of the child's own hut. Theming is done by
// re-pointing the --wijk-* tokens with the shared theme class, never by
// hardcoding colours here.
const getWijkThemeClass = (hutNr: string) => {
	switch (('' + (hutNr || '')).charAt(0)) {
		case '0':
			return 'theme-yellow';
		case '1':
			return 'theme-red';
		case '2':
			return 'theme-blue';
		case '3':
			return 'theme-green';
		default:
			return '';
	}
};

function ViewTicket() {
	// Starts true: the effect always either fetches or navigates away, and
	// false here paints an empty card for a frame first.
	const [loading, setLoading] = useState(true);
	const [ticket, setTicket] = useState<Ticket>({});
	const [ticketPropertiesMap, setTicketPropertiesMap] = useState<TicketPropertiesMap>({});
	const [canEditTickets, setCanEditTickets] = useState(false);
	const navigate = useNavigate();

	const tableCategories = [
		{
			name: 'Gegevens Kind',
			props: ['birthdate', 'opmerkingen', 'hasSole']
		},
		{
			name: 'Gegevens huisarts',
			props: ['naam_huisarts', 'tel_huisarts']
		},
		{
			name: 'Contactgegevens ouders/verzorgers',
			props: ['tel1', 'tel2', 'parent_email']
		},
	];

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const ticketId = urlParams.get('ticket-id');

		if (!ticketId) {
			navigate('/zoek');
		} else {
			apiCall('findChildById', { id: ticketId }).then((result) => {
				setLoading(false);

				if (!result || result.response !== 'success' || !result.ticket) {
					alert('Ticket niet gevonden');
					navigate('/zoek');
					return;
				}

				result.ticket.history = result.history.map((h: Parse.Object) => {
					h.set('desc', generateGebeurtenisDescription(h, false, result.ticketPropertiesMap));
					return h;
				});

				setTicket(result.ticket);
				setTicketPropertiesMap(result.ticketPropertiesMap);
				setCanEditTickets(result.canEditTickets);
			});
		}
	}, []);

	const getPropTr = (prop: string) => {
		let valueTd = <td>{ticket[prop]}</td>
		// if it's a boolean, show ja or nee
		if (typeof ticket[prop] === 'boolean') {
			valueTd = <td>{ticket[prop] ? 'Ja' : 'Nee'}</td>
		} else if (!ticket[prop]) {
			valueTd = <td className="is-empty">–</td>
		} else {
			if (prop.startsWith('tel')) {
				valueTd = <td><a href={'tel:' + ticket[prop]}>{ticket[prop]}</a></td>
			}
			if (prop.endsWith('email')) {
				valueTd = <td><a href={'mailto:' + ticket[prop]}>{ticket[prop]}</a></td>
			}
		}


		return (
			<tr key={prop}>
				<td>{(ticketPropertiesMap[prop] || {}).appLabel || (ticketPropertiesMap[prop] || {}).label}</td>
				{valueTd}
			</tr>
		)
	}

	const goBack = () => {
		// navigate back
		window.history.back();
	}

	const history = ticket.history || [];

	return (
		<Layout title="" noPadding={true} onBack={goBack} theme={getWijkThemeClass(ticket.hutNr).replace('theme-', '')}>
			<LoadingIcon shown={loading} />
			{!loading &&
				<div className={'ticketCard ' + getWijkThemeClass(ticket.hutNr)}>
					<h1 className="ticket-name">
						{ticket.firstName} {ticket.lastName}
					</h1>

					<div className="ticket-subline">
						{ticket.wristband
							? <span className="ticket-chip">Bandje {ticket.wristband}</span>
							: <span className="ticket-chip neutral">Nog geen bandje</span>}
						{ticket.hutNr
							? <span className="ticket-chip">Hutje {ticket.hutNr}</span>
							: <span className="ticket-chip neutral">Nog geen hutje</span>}
					</div>

					{tableCategories.map((cat) => (
						<div className="ticket-group" key={cat.name}>
							<h3>{cat.name}</h3>
							<table className="ticket-table">
								<tbody>
									{cat.props.map((prop) => getPropTr(prop))}
								</tbody>
							</table>
						</div>
					))}

					<div className="ticket-group">
						<h3>Gebeurtenissen</h3>
						{history.length > 0
							? (
								<ul className="ticket-events">
									{history.map((h: Parse.Object, index: number) => (
										<li key={index}>{h.get('desc')}</li>
									))}
								</ul>
							)
							: (
								<div className="panel">
									<div className="empty-state">
										<p>nog geen gebeurtenissen over dit kind gevonden</p>
									</div>
								</div>
							)}
					</div>

					<div className="ticket-actions">
						{canEditTickets && (
							<button
								className="span-2"
								onClick={() => navigate('/bewerk-ticket?ticket-id=' + ticket.id)}
							>
								Bewerken
							</button>
						)}
						<button
							className="btn-secondary"
							onClick={() => navigate('/polsbandje?ticket-id=' + ticket.id + '&origin=ticket')}
						>
							Polsbandje wijzigen
						</button>
						<button
							className="btn-secondary"
							disabled={!ticket.hutNr}
							onClick={() => navigate('/hutjes?hutNr=' + ticket.hutNr)}
						>
							Naar hutje
						</button>
						<button
							className="btn-secondary"
							onClick={() => navigate('/aanwezigheid?bandje=' + ticket.wristband)}
						>
							Naar aanwezigheid
						</button>
						<button
							className="btn-neutral"
							onClick={() => navigate('/')}
						>
							Terug naar homepagina
						</button>
					</div>
				</div>}
		</Layout >
	);
}

export default ViewTicket;
