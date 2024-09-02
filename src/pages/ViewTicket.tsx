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
}

interface TicketPropertiesMap {
	[key: string]: TicketProperty;
}

function ViewTicket() {
	const [loading, setLoading] = useState(false);
	const [ticket, setTicket] = useState<Ticket>({});
	const [ticketPropertiesMap, setTicketPropertiesMap] = useState<TicketPropertiesMap>({});
	const [canEditTickets, setCanEditTickets] = useState(false);
	const [searchQuery, setSearchQuery] = useState('');
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
		setSearchQuery(urlParams.get('q') || '');

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
		if (!ticket[prop]) {
			valueTd = <td>–</td>
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
				<td>{(ticketPropertiesMap[prop] || {}).label}</td>
				{valueTd}
			</tr>
		)
	}

	const goBack = () => {
		if (searchQuery) {
			navigate('/zoek?q=' + searchQuery);
		} else {
			navigate('/zoek');
		}
	}

	return (
		<Layout noHeader={true} noPadding={true}>
			<LoadingIcon shown={loading} />
			{!loading &&
				<div className="ticketCard">
					{ticket.firstName} {ticket.lastName}
					<br />
					{tableCategories.map((cat) => (
						<div key={cat.name}>
							<h3>{cat.name}</h3>
							<table>
								<tbody>
									{cat.props.map((prop) => getPropTr(prop))}
								</tbody>
							</table>
						</div>
					))}
					<br />
					<h3>Gebeurtenissen</h3>
					<ul>
						{ticket.history && ticket.history.map((h: Parse.Object, index: number) => (
							<li key={index}>
								{h.get('desc')}
							</li>
						))}
					</ul>
					<br />
					<br />
					<button onClick={goBack}>Sluiten</button>
					{canEditTickets && <button onClick={() => navigate('/bewerk-ticket?ticket-id=' + ticket.id)}>Bewerken</button>}
					<button onClick={() => navigate('/polsbandje?ticket-id=' + ticket.id + '&origin=search')}>Polsbandje wijzigen</button>
					<button onClick={() => navigate('/hutje?ticket-id=' + ticket.id)}>Naar hutje</button>
					<button onClick={() => navigate('/aanwezigheid?ticket-id=' + ticket.id)}>Naar aanwezigheid</button>
					<button onClick={() => navigate('/')}>Terug naar homepagina</button>
				</div>}
		</Layout >
	);
}

export default ViewTicket;
