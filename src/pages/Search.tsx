import Layout from '../layouts/layout.tsx';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiCall from '../utils/apiCall.ts';
import '../scss/Search.scss';
import LoadingIcon from '../components/LoadingIcon.tsx';

interface Ticket {
	[key: string]: any;
}

function SearchPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [hasSearched, setHasSearched] = useState(false);
	const [searchResults, setSearchResults] = useState<Ticket[]>([]);
	const [lastSearchedTerm, setLastSearchedTerm] = useState('');
	const [loading, setLoading] = useState(false);
	const [errorTitle, setErrorTitle] = useState('');
	const [errorHelpText, setErrorHelpText] = useState('');

	const navigate = useNavigate();

	const search = async () => {
		setSearchResults([]);
		setErrorTitle('');
		setErrorHelpText('');
		if (searchTerm.length < 3) {
			return;
		}
		setLoading(true);

		try {
			const result = await apiCall('search', { searchTerm });
			setLoading(false);

			if (!result || result.response !== 'success') {
				if (result.response === 'unauthorized') {
					// one of two reasons: either the user is not logged in, or the user is not an admin
					// at /is-geen-beheerder both cases are handled
					navigate('/is-geen-beheerder');
					return;
				}
				setErrorTitle(result.errorTitle || result.response);
				setErrorHelpText(result.errorTitleMessage || result.response);
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
		} catch (e) {
			setLoading(false);
			setErrorTitle(String(e));
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
	}, [searchTerm]);

	useEffect(() => {
		if (window.location.href.includes('q=')) {
			let searchQuery = window.location.href.split('q=')[1].split('&')[0];
			searchQuery = decodeURIComponent(searchQuery);
			setSearchTerm(searchQuery);
			if(!hasSearched && !loading) {
				search();
			}
		}
	}, []);


	return (
		<>
			<Layout title="Zoek kinderen">
				<center>
					<h2>Zoek kinderen op naam, polsband of hutje: </h2>
					<input
						type="text"
						title="Zoekterm"
						onChange={changeSearchTerm}
						value={searchTerm}
						placeholder="Zoekterm"
						className='big'
					/>
					<br />
					<LoadingIcon shown={loading}/>
				</center>

				{searchResults.length > 0 && (
					<div id="results">
						<h3>Zoekresultaten ({searchResults.length})</h3>
						<ul className="peopleList">
							{searchResults.map((child) => (
								<table
									key={child.id}
									onClick={() => navigate('/bekijk-ticket?ticket-id=' + child.id + '&q=' + searchTerm)}
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

				{searchResults.length === 0 && hasSearched && !errorTitle && (
					<div>
						<b>Geen zoekresultaten! Je kunt zoeken op polsbandje-nummer, hutnummer of op voor- of achternaam.</b>
					</div>
				)}

				{errorTitle && (
					<div>
						<b>{errorTitle}</b>
						<br />
						{errorHelpText}
					</div>
				)}

				<br />
			</Layout>
		</>
	);
}

export default SearchPage;