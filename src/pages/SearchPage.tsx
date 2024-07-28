import Layout from '../layouts/layout.tsx';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiCall from '../utils/apiCall.ts';
import '../scss/SearchPage.scss';

interface Ticket {
	[key: string]: any;
}


interface TicketProperty {
	label: string;
}

interface TicketPropertiesMap {
	[key: string]: TicketProperty;
}

function SearchPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [hasSearched, setHasSearched] = useState(false);
	const [searchResults, setSearchResults] = useState<Ticket[]>([]);
	const [lastSearchedTerm, setLastSearchedTerm] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [errorHelpText, setErrorHelpText] = useState('');
	const [modalShown, setModalShown] = useState(false);
	const [selectedChild, setSelectedChild] = useState<Ticket>({});
	const [canEditTickets, setCanEditTickets] = useState(false);
	const [ticketPropertiesMap, setTicketPropertiesMap] = useState<TicketPropertiesMap>({});
	const [isEditingTickets, setIsEditingTickets] = useState(false);

	const tableCategories = [
		{
			name: 'Gegevens Kind',
			props: ['birthdate', 'wristband', 'opmerkingen']
		},
		{
			name: 'Gegevens huisarts',
			props: ['naam_huisarts', 'tel_huisarts']
		},
		{
			name: 'Contactgegevens ouders',
			props: ['tel1', 'tel2', 'parent_email']
		},
	];

	const navigate = useNavigate();

	const search = async (ticketId?: string) => {
		console.log('hallo?')
		setSearchResults([]);
		setError('');
		setErrorHelpText('');
		if (!ticketId && searchTerm.length < 3) {
			return;
		}
		setLoading(true);

		try {
			const result = await apiCall('search', { searchTerm: ticketId || searchTerm });
			setLoading(false);

			if (!result || result.response !== 'success') {
				setError(result.error || result.response);
				setErrorHelpText(result.errorMessage || result.response);
				return;
			}

			setHasSearched(true);
			setLastSearchedTerm(searchTerm);

			const rankResult = (item: Ticket) => {
				if (item.wristband === searchTerm) return -1;
				if (item.firstName.toLowerCase().startsWith(searchTerm.toLowerCase())) return 1;
				if (item.lastName.toLowerCase().startsWith(searchTerm.toLowerCase())) return 2;
				if (item.firstName.toLowerCase().includes(searchTerm.toLowerCase())) return 3;
				if (item.lastName.toLowerCase().includes(searchTerm.toLowerCase())) return 4;
				return 5;
			};

			setSearchResults(result.tickets.sort((a: Ticket, b: Ticket) => rankResult(a) - rankResult(b)));
			setCanEditTickets(result.canEditTickets);
			setTicketPropertiesMap(result.ticketPropertiesMap);

			if (ticketId) {
				setModalShown(result.tickets[0]);
				setSearchTerm(result.tickets[0].firstName + ' ' + result.tickets[0].lastName);
			}
		} catch (e) {
			setLoading(false);
			setError(String(e));
		}
	}

	const changeSearchTerm = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newSearchTerm = e.target.value;
		setSearchTerm(newSearchTerm);
		setHasSearched(false);
		setLastSearchedTerm('');
	};

	useEffect(() => {
		if (hasSearched && searchTerm === lastSearchedTerm) return;

		if (searchTerm.length < 3) {
			setSearchResults([]);
			return;
		}

		const timer = setTimeout(() => {
			search();
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm, search]);

	const showModal = (child: Ticket) => {
		window.history.pushState({}, '', '/zoek?q=' + searchTerm + '&ticket-id=' + child.id);
		setModalShown(true);
		setSelectedChild(child);
	};

	const hideModal = () => {
		window.history.pushState({}, '', '/zoek');
		setModalShown(false);
	}

	useEffect(() => {
		if (window.location.href.includes('ticket-id=')) {
			if (!hasSearched && !loading) {
				search(window.location.href.split('ticket-id=')[1].split('&')[0]);
			}
		} else if (window.location.href.includes('q=')) {
			setSearchTerm(window.location.href.split('q=')[1].split('&')[0]);
			if(!hasSearched && !loading) {
				search();
			}
		}
	}, []);

	const saveTicketEdit = async () => {
		alert('Opslaan is nog niet geïmplementeerd');
	};


	return (
		<>
			<Layout title="Zoek kinderen">
				<center>
					<input
						type="text"
						title="Zoekterm"
						onChange={changeSearchTerm}
						value={searchTerm}
						placeholder="Zoekterm"
					/>
					<br />
					{loading && "Laden..."}
				</center>

				{searchResults.length > 0 && (
					<div id="results">
						<h3>Zoekresultaten ({searchResults.length})</h3>
						<ul className="peopleList">
							{searchResults.map((child) => (
								<table
									key={child.id}
									onClick={() => showModal(child)}
									style={{ borderBottom: '1px solid #ccc', width: '100%', textAlign: 'left' }}
								>
									<tbody className='ticketListItem'>
										<tr>
											<td>
												<h3>Bandje <span>{child.wristband}</span></h3>
												<h3>Hutje <span>{child.hutNr}</span></h3>
											</td>
											<td>
												<h2>
													{child.firstName}
													<br />
													{child.lastName}
												</h2>
											</td>
											<td>
												<button>i</button>
											</td>
										</tr>
									</tbody>
								</table>
							))}
						</ul>
					</div>
				)}

				{searchResults.length === 0 && hasSearched && !error && (
					<div>
						<b>Geen zoekresultaten! Je kunt zoeken op polsbandje-nummer, hutnummer of op voor- of achternaam.</b>
					</div>
				)}

				{error && (
					<div>
						<b>{error}</b>
						<br />
						{errorHelpText}
					</div>
				)}

				<br />

				{modalShown &&
					<div id="modal">
						{selectedChild.firstName} {selectedChild.lastName}
						<br />
						{tableCategories.map((cat) => (
							<div key={cat.name}>
								<h3>{cat.name}</h3>
								<table>
									<tbody>
										{cat.props.map((prop) => (
											<tr key={prop}>
												<td>{(ticketPropertiesMap[prop] || {}).label}</td>
												<td>{selectedChild[prop]}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						))}
						<br />
						<br />
						<button onClick={() => { hideModal() }}>Sluiten</button>
						{canEditTickets && !isEditingTickets && <button onClick={() => setIsEditingTickets(true)}>Bewerken</button>}
						{isEditingTickets && <button onClick={() => saveTicketEdit()}>Opslaan</button>}
						<button onClick={() => navigate('/polsbandje?ticket-id=' + selectedChild.id)}>Polsbandje wijzigen</button>
						<button onClick={() => navigate('/hutje?ticket-id=' + selectedChild.id)}>Naar hutje</button>
						<button onClick={() => navigate('/aanwezigheid?ticket-id=' + selectedChild.id)}>Naar aanwezigheid</button>
						<button onClick={() => navigate('/home')}>Terug naar homepagina</button>
					</div>
				}
			</Layout>
		</>
	);
}

export default SearchPage;