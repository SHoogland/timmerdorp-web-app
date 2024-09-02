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
		navigate('/bekijk-ticket?ticket-id=' + ticket.id);
	};


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
									{cat.props.map((prop) =>
										<tr key={prop}>
											<td>
												{(ticketPropertiesMap[prop] || {}).label}
											</td>
											<td>
												<input
													type="text"
													title={(ticketPropertiesMap[prop] || {}).label}
													onChange={(e) => setTicket({ ...ticket, [prop]: e.target.value })}
													value={ticket[prop]}
													placeholder={(ticketPropertiesMap[prop] || {}).label}
												/>
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					))}
					<br />
					<br />
					<button onClick={save}>Opslaan</button>
					<button onClick={() => navigate('/bekijk-ticket?ticket-id=' + ticket.id)}>Annuleren</button>
				</div>}
		</Layout >
	);
}

export default ViewTicket;
