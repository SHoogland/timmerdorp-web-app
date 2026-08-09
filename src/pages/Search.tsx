import Layout from '../layouts/layout.tsx';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiCall from '../utils/apiCall.ts';
import '../scss/Search.scss';
import LoadingIcon from '../components/LoadingIcon.tsx';
import Icon from '../components/Icon.tsx';
import { FaChevronRight } from 'react-icons/fa';

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
				<div className="search-page">
					<div className="search-bar">
						<div className="search-field">
							<Icon name="search" className="search-field-icon" />
							<input
								type="search"
								inputMode="search"
								enterKeyHint="search"
								autoFocus
								autoComplete="off"
								autoCorrect="off"
								spellCheck={false}
								title="Zoekterm"
								aria-label="Zoek kinderen op naam, polsband of hutje"
								onChange={changeSearchTerm}
								value={searchTerm}
								placeholder="Naam, polsband of hutje"
							/>
						</div>
					</div>

					<LoadingIcon shown={loading} />

					{searchResults.length > 0 && (
						<div id="results" className="section">
							<h2 className="section-title">Zoekresultaten ({searchResults.length})</h2>
							<div className="result-list">
								{searchResults.map((child) => (
									<button
										type="button"
										key={child.id}
										onClick={() => navigate('/bekijk-ticket?ticket-id=' + child.id + '&q=' + searchTerm)}
										className={`result-card wijk-${getWijkColor(child.hutNr)}`}
									>
										<span className="result-main">
											<span className="result-name">
												{child.firstName} {child.lastName}
											</span>
											<span className="result-meta">
												{/* A chip with no number is noise; say so once instead of rendering
												    two empty labels. */}
												{!child.wristband && !child.hutNr ? (
													<span className="chip chip-empty">Nog geen bandje of hutje</span>
												) : (
													<>
														{child.wristband && (
															<span className="chip">
																<span className="chip-label">Bandje</span>
																<span className="chip-value nums">{child.wristband}</span>
															</span>
														)}
														{child.hutNr && (
															<span className="chip">
																<span className="chip-label">Hutje</span>
																<span className="chip-value nums">{child.hutNr}</span>
															</span>
														)}
													</>
												)}
											</span>
										</span>
										<FaChevronRight className="result-icon" />
									</button>
								))}
							</div>
						</div>
					)}

					{searchResults.length === 0 && !loading && !errorTitle && !hasSearched && (
						<div className="empty-state">
							<p>Zoek kinderen op naam, polsband of hutje.</p>
						</div>
					)}

					{searchResults.length === 0 && hasSearched && !errorTitle && (
						<div className="empty-state">
							<p>Geen zoekresultaten! Je kunt zoeken op polsbandje-nummer, hutnummer of op voor- of achternaam.</p>
						</div>
					)}

					{errorTitle && (
						<div className="search-error" role="alert">
							<b>{errorTitle}</b>
							<br />
							{errorHelpText}
						</div>
					)}
				</div>
			</Layout>
		</>
	);
}

export default SearchPage;
