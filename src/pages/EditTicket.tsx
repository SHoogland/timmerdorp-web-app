import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import LoadingIcon from '../components/LoadingIcon';
import { useNavigate } from 'react-router-dom';

interface Ticket {
	[key: string]: any;
}


interface TicketProperty {
	label: string;
}

interface TicketPropertiesMap {
	[key: string]: TicketProperty;
}

// Same wijk theming as the view page, so editing feels like the same flow.
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
	const [loading, setLoading] = useState(false);
	const [ticket, setTicket] = useState<Ticket>({});
	const [ticketPropertiesMap, setTicketPropertiesMap] = useState<TicketPropertiesMap>({});
	const navigate = useNavigate();

	const tableCategories = [
		{
			name: 'Gegevens Kind',
			props: ['birthdate', 'wristband', 'hutNr', 'opmerkingen']
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
			setLoading(true);
			apiCall('findChildById', { id: ticketId }).then((result) => {
				setLoading(false);

				if (!result || result.response !== 'success' || !result.ticket) {
					alert('Ticket niet gevonden');
					navigate('/zoek');
					return;
				}

				setTicket(result.ticket);
				setTicketPropertiesMap(result.ticketPropertiesMap);
			});
		}
	}, []);

	const save = async () => {
		const reason = prompt('Waarom wordt dit ticket aangepast? (wees gerust bondig)');
		setLoading(true);
		const result = await apiCall('saveTicketEdit', { ticket, reason })
		if (!result || result.message != 'success') alert('hmmmm (geen response)')
		setLoading(false);
		navigate('/bekijk-ticket?ticket-id=' + ticket.id, { replace: true });
	};

	const cancel = () => navigate('/bekijk-ticket?ticket-id=' + ticket.id, { replace: true });

	const displayName = [ticket.firstName, ticket.lastName].filter(Boolean).join(' ');

	return (
		<Layout noHeader={true} noPadding={true}>
			<LoadingIcon shown={loading} />
			{!loading &&
				<div className={'ticketCard ticket-edit ' + getWijkThemeClass(ticket.hutNr)}>
					<div className="ticket-topbar">
						<button className="ticket-close" onClick={cancel} title="Annuleren" aria-label="Annuleren">
							✕
						</button>
					</div>

					<h1 className="ticket-name">{displayName || 'Ticket bewerken'}</h1>

					<div className="ticket-group">
						<h3>Naam</h3>
						<div className="ticket-fields">
							<div className="ticket-field">
								<label htmlFor="firstName">Voornaam</label>
								<input
									id="firstName"
									type="text"
									title="Voornaam"
									onChange={(e) => setTicket({ ...ticket, firstName: e.target.value })}
									value={ticket.firstName || ''}
									placeholder="Voornaam"
								/>
							</div>
							<div className="ticket-field">
								<label htmlFor="lastName">Achternaam</label>
								<input
									id="lastName"
									type="text"
									title="Achternaam"
									onChange={(e) => setTicket({ ...ticket, lastName: e.target.value })}
									value={ticket.lastName || ''}
									placeholder="Achternaam"
								/>
							</div>
						</div>
					</div>

					{tableCategories.map((cat) => (
						<div className="ticket-group" key={cat.name}>
							<h3>{cat.name}</h3>
							<div className="ticket-fields">
								{cat.props.map((prop) =>
									<div className="ticket-field" key={prop}>
										<label htmlFor={'field-' + prop}>
											{(ticketPropertiesMap[prop] || {}).label}
										</label>
										<input
											id={'field-' + prop}
											type="text"
											title={(ticketPropertiesMap[prop] || {}).label}
											onChange={(e) => setTicket({ ...ticket, [prop]: e.target.value })}
											value={ticket[prop]}
											placeholder={(ticketPropertiesMap[prop] || {}).label}
										/>
									</div>
								)}
							</div>
						</div>
					))}

					<div className="ticket-form-bar">
						<button className="btn-neutral" onClick={cancel}>Annuleren</button>
						<button onClick={save}>Opslaan</button>
					</div>
				</div>}
		</Layout >
	);
}

export default ViewTicket;
