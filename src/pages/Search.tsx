import Layout from '../layouts/layout.tsx';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
		const [searchParams, setSearchParams] = useSearchParams();
	
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

		// Update URL query parameters without adding to history (use replace)
		if (newSearchTerm.length >= 3) {
			setSearchParams({ q: newSearchTerm }, { replace: true });
		} else {
			setSearchParams({}, { replace: true });
		}
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
		const queryParam = searchParams.get('q');
		if (queryParam) {
			setSearchTerm(queryParam);
			if (!hasSearched && !loading) {
				search();
			}
		}
	}, []);


	return (
		<>
			<Layout title="Zoek kinderen">
				<div className="search-container">
					<h2>Zoek kinderen op naam, polsband of hutje</h2>
					<div className="search-input-wrapper">
						<i className="material-icons search-icon">search</i>
						<input
							type="text"
							title="Zoekterm"
							onChange={changeSearchTerm}
							value={searchTerm}
							placeholder="Zoekterm"
						/>
					</div>
					<LoadingIcon shown={loading} />
				</div>

				{searchResults.length > 0 && (
					<div id="results">
						<h3>Zoekresultaten ({searchResults.length})</h3>
						<ul className="peopleList">
							{searchResults.map((child) => (
								<div
									key={child.id}
									onClick={() => navigate('/bekijk-ticket?ticket-id=' + child.id + '&q=' + searchTerm)}
									className={`search-result-card wijk-${getWijkColor(child.hutNr)}`}
								>
									<div className="result-content">
										<div className="result-info">
											<h3>Bandje <span className={`wijk-accent-${getWijkColor(child.hutNr)}`}>{child.wristband}</span></h3>
											<h3>Hutje <span className={`wijk-accent-${getWijkColor(child.hutNr)}`}>{child.hutNr}</span></h3>
										</div>
										<div className="result-name">
											<h2>
												{child.firstName}
												<br />
												{child.lastName}
											</h2>
										</div>
										<div className="info-button-cell">
											<i className="material-icons info-icon">info</i>
										</div>
									</div>
								</div>
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