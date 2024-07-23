import Parse from 'parse';
import Layout from '../layouts/layout.tsx';
import { useNavigate } from 'react-router-dom';
import checkIfStillLoggedIn from '../utils/checkIfStillLoggedIn.ts';
import { useState, useEffect, useCallback } from 'react';
import apiCall from '../utils/apiCall.ts';
import '../scss/SearchPage.scss';

function SearchPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [isSearchingById, setIsSearchingById] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [searchResults, setSearchResults] = useState([]);
	const [lastSearchedTerm, setLastSearchedTerm] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [errorHelpText, setErrorHelpText] = useState('');
	const [modalShown, setModalShown] = useState(false);
	const [selectedChild, setSelectedChild] = useState({});
	const [canEditTickets, setCanEditTickets] = useState(false);
	const [ticketPropertiesMap, setTicketPropertiesMap] = useState({});
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


	useEffect(() => {
		checkIfStillLoggedIn().then((result) => {
			if (!result.result) {
				navigate('/login');
			}
		});
	}, [navigate]);

	const search = async (ticketId?: string) => {
		setSearchResults([]);
		setError('');
		setErrorHelpText('');
		if (!isSearchingById && searchTerm.length < 3) {
			return;
		}
		if (isSearchingById && !ticketId) {
			return;
		}
		setLoading(true);

		try {
			const result = await apiCall('search', { searchTerm: isSearchingById ? ticketId : searchTerm });
			setLoading(false);

			if (!result || result.response !== 'success') {
				setError(result.error || result.response);
				setErrorHelpText(result.errorMessage || result.response);
				return;
			}

			setHasSearched(true);
			setLastSearchedTerm(searchTerm);

			const rankResult = (item) => {
				if (item.wristband === searchTerm) return -1;
				if (item.firstName.toLowerCase().startsWith(searchTerm.toLowerCase())) return 1;
				if (item.lastName.toLowerCase().startsWith(searchTerm.toLowerCase())) return 2;
				if (item.firstName.toLowerCase().includes(searchTerm.toLowerCase())) return 3;
				if (item.lastName.toLowerCase().includes(searchTerm.toLowerCase())) return 4;
				return 5;
			};

			setSearchResults(result.tickets.sort((a, b) => rankResult(a) - rankResult(b)));
			setCanEditTickets(result.canEditTickets);
			setTicketPropertiesMap(result.ticketPropertiesMap);

			if (isSearchingById) {
				setModalShown(result.tickets[0]);
				setSearchTerm(result.tickets[0].firstName + ' ' + result.tickets[0].lastName);
				setIsSearchingById(false);
			}
		} catch (e) {
			setLoading(false);
			setError(String(e));
		}
	}

	useEffect(() => {
		if (isSearchingById && !hasSearched && !loading) {
			search(window.location.href.split('ticket-id=')[1].split('&')[0]);
		}
	}, [isSearchingById])
	

	const changeSearchTerm = (e) => {
		const newSearchTerm = e.target.value;
		setSearchTerm(newSearchTerm);
		setHasSearched(false);
		setLastSearchedTerm('');
	};

	useEffect(() => {
		if(isSearchingById) return;
		if(hasSearched && searchTerm === lastSearchedTerm) return;

		if (searchTerm.length < 3) {
			setSearchResults([]);
			return;
		}

		const timer = setTimeout(() => {
			search();
		}, 500);

		return () => clearTimeout(timer);
	}, [searchTerm, search]);

	const showModal = (child) => {
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
			setIsSearchingById(true);
		} else if (window.location.href.includes('q=')) {
			setSearchTerm(window.location.href.split('q=')[1].split('&')[0]);
		}
	}, []);

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
							<br/>
							todo: dit enigszins stylen, en bijzondere props toevoegen: aanwezigheid, telefoonnummers en e-mailadressen formatten. Verder: bewerken kan nog niet
							<br/>
							<br/>
							<button onClick={() => {hideModal()}}>Sluiten</button>
							{canEditTickets && !isEditingTickets && <button onClick={() => setIsEditingTickets(true)}>Bewerken</button>}
							{isEditingTickets && <button onClick={() => saveTicketEdit()}>Opslaan</button>}
							<button onClick={() => navigate('/polsbandje?ticket-id=' + selectedChild.id)}>Polsbandje wijzigen</button>
							<button onClick={() => navigate('/hutje?ticket-id=' + selectedChild.id)}>Naar hutje</button>
							<button onClick={() => navigate('/aanwezigheid?ticket-id=' + selectedChild.id)}>Naar aanwezigheid</button>
							<button onClick={() => navigate('/home')}>Terug naar homepagina</button>
						</div>
					}

					todo: zoekgeschiedenis (her)implementeren
				</center>
			</Layout>
		</>
	);
}

export default SearchPage;