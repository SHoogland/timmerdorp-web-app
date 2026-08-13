
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import LoadingIcon from '../components/LoadingIcon';
import generateGebeurtenisDescription from '../utils/generateGebeurtenisDescription';

interface Ticket {
	[key: string]: any;
}

interface SearchResult {
	ticket: Ticket;
	highlightedText: string;
	priority: number;
	sortKey: string;
}

function HutjesManagement() {
	const [searchParams] = useSearchParams();
	// Deep link from a ticket detail page: /hutjes?hutNr=212 pre-fills the
	// field, which the existing debounce effect then searches for.
	const [hutNummer, setHutNummer] = useState(searchParams.get('hutNr') || '');
	const [kidsInHut, setKidsInHut] = useState<Ticket[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasSearchedForHut, setHasSearchedForHut] = useState(false);
	const [errorTitle, setErrorTitle] = useState('');
	const [errorHelpText, setErrorHelpText] = useState('');
	const [lastSearchedHut, setLastSearchedHut] = useState('');
	const [showAddChildModal, setShowAddChildModal] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [searchLoading, setSearchLoading] = useState(false);
	const [addChildToHutIsLoading, setAddChildToHutIsLoading] = useState(false);
	const [hutHistory, setHutHistory] = useState<Parse.Object[]>([]);

	// Hut numbers encode their wijk in the first digit.
	const hutTheme = (hutNr: string): string | undefined => {
		if (!hutNr || hutNr.length < 1) return undefined;
		return ({ '0': 'yellow', '1': 'red', '2': 'blue', '3': 'green' } as Record<string, string>)[hutNr[0]];
	};

	// hutNrOverride lets callers (vorige/volgende) search a specific hut
	// immediately, without waiting on the debounced effect below and
	// without reading the hutNummer state — which, right after a
	// setHutNummer() call in the same handler, wouldn't have updated yet.
	const search = async (hutNrOverride?: string) => {
		const targetHut = hutNrOverride || hutNummer;
		setKidsInHut([]);
		setErrorTitle('');
		setErrorHelpText('');
		if (targetHut.length < 3) {
			return;
		}
		setLoading(true);

		try {
			const result = await apiCall('searchHut', { hutNr: targetHut });
			setLoading(false);

			if (!result || result.response !== 'success') {
				setErrorTitle(result.errorTitle || result.response);
				setErrorHelpText(result.errorTitleMessage || result.response);
				return;
			}

			setHasSearchedForHut(true);
			setLastSearchedHut(targetHut);
			setHutHistory(result.history);
			setKidsInHut(result.tickets.sort((a: Ticket, b: Ticket) => a.firstName.localeCompare(b.firstName)));
		} catch (e) {
			setLoading(false);
			setErrorTitle(String(e));
		}
	}

	useEffect(() => {
		if (hasSearchedForHut && hutNummer === lastSearchedHut) return;

		if (hutNummer.length < 3) {
			setKidsInHut([]);
			return;
		}
		setLoading(true);

		const timer = setTimeout(() => {
			search();
		}, 500);

		return () => clearTimeout(timer);
	}, [hutNummer]);

	const changeHutNummer = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newhutNummer = e.target.value;
		setHutNummer(newhutNummer);
		setHasSearchedForHut(false);
		setLastSearchedHut('');
	};

	// Vorige/volgende: step the 3-digit hut number by 1, clamped to a valid
	// 3-digit code (000-999). Hut numbers aren't validated against a fixed
	// list anywhere else in the app either, so this just walks the numeric
	// sequence rather than trying to skip to the next *occupied* hut.
	const goToAdjacentHut = (delta: number) => {
		if (hutNummer.length !== 3 || loading) return;
		const current = parseInt(hutNummer, 10);
		if (isNaN(current)) return;

		const nextHutNr = String(Math.min(999, Math.max(0, current + delta))).padStart(3, '0');
		// Mark the target hut as already "searched" before hutNummer updates,
		// so the debounced effect below (which also watches hutNummer) sees
		// its own guard satisfied and doesn't schedule a second, redundant
		// fetch 500ms after the one triggered directly below.
		setHasSearchedForHut(true);
		setLastSearchedHut(nextHutNr);
		setHutNummer(nextHutNr);
		search(nextHutNr);
	};

	const removeKidFromHut = (kid: Ticket) => {
		if (confirm(`Weet je zeker dat je ${kid.firstName} ${kid.lastName} uit hut ${hutNummer} wilt verwijderen?`)) {
			setLoading(true);
			apiCall('setHutNr', { id: kid.id, hutNr: null, removeFromHut: true }).then((result) => {
				setLoading(false);
				if (!result || result.response !== 'success') {
					alert('daar ging iets goed mis... het kind is waarschijnlijk niet uit het hutje verwijderd')
				} else {
					setKidsInHut(kidsInHut.filter((k) => k.id !== kid.id));
				}
			});
		}
	};

	const performSearch = async () => {
		if (searchTerm.length < 2) {
			setSearchResults([]);
			return;
		}

		try {
			const result = await apiCall('search', { searchTerm: searchTerm });

			if (result.response === 'success' && result.tickets) {
				const results = result.tickets.map((ticket: Ticket) => {
					const fullName = `${ticket.firstName} ${ticket.lastName}`;
					const fullNameLower = fullName.toLowerCase();
					const searchLower = searchTerm.toLowerCase();
					let highlightedText = fullName;

					// Highlight matching text while preserving original capitalization
					if (fullNameLower.includes(searchLower)) {
						const index = fullNameLower.indexOf(searchLower);
						highlightedText = `${fullName.substring(0, index)}<mark>${fullName.substring(index, index + searchLower.length)}</mark>${fullName.substring(index + searchLower.length)}`;
					}

					return {
						ticket,
						highlightedText,
						// Priority: exact wristband match gets highest priority
						priority: ticket.wristband === searchTerm ? 0 : 1,
						// Sort key for alphabetical sorting
						sortKey: fullNameLower
					};
				});

				// Sort: wristband matches first, then alphabetically
				const sortedResults = results.sort((a: SearchResult, b: SearchResult) => {
					if (a.priority !== b.priority) {
						return a.priority - b.priority;
					}
					return a.sortKey.localeCompare(b.sortKey);
				});

				setSearchLoading(false);

				setSearchResults(sortedResults);
			} else {
				setSearchResults([]);
			}
		} catch (error) {
			setSearchResults([]);
		}
	};

	useEffect(() => {
		if (searchTerm.length < 2) {
			setSearchResults([]);
			setSearchLoading(false);
			return;
		}

		setSearchLoading(true);
		const timer = setTimeout(() => {
			performSearch();
		}, 300);

		return () => clearTimeout(timer);
	}, [searchTerm]);

	const addChildToHut = async (ticket: Ticket) => {
		setAddChildToHutIsLoading(true);
		try {
			const result = await apiCall('setHutNr', { id: ticket.id, hutNr: hutNummer });
			setAddChildToHutIsLoading(false);

			if (!result || result.response !== 'success') {
				alert('daar ging iets goed mis... het hutje is waarschijnlijk niet opgeslagen')
			} else {
				// Add to kids in hut without closing modal
				setKidsInHut([...kidsInHut, ticket]);
				// Clear search
				setSearchTerm('');
				setSearchResults([]);
				// Show success message
				alert(`${ticket.firstName} ${ticket.lastName} is toegevoegd aan hut ${hutNummer}`);
			}
		} catch (error) {
			setAddChildToHutIsLoading(false);
			alert('Er is een fout opgetreden bij het toevoegen van het kind');
		}
	};

	const closeModal = () => {
		setShowAddChildModal(false);
		setSearchTerm('');
		setSearchResults([]);
	};

	const hutIsOpen = hasSearchedForHut && !errorTitle;
	const currentHutAsNumber = hutNummer.length === 3 ? parseInt(hutNummer, 10) : NaN;
	const canGoToPreviousHut = !loading && !isNaN(currentHutAsNumber) && currentHutAsNumber > 0;
	const canGoToNextHut = !loading && !isNaN(currentHutAsNumber) && currentHutAsNumber < 999;

	return (
		<Layout title='Hutjes beheren' theme={hutTheme(hutNummer)}>
			<div className="hutjes-page">
				<div className="hut-search">
					<label htmlFor="hutNummerInput">Hutnummer zoeken</label>
					<div className="hut-input-wrap">
						<input
							type="tel"
							id="hutNummerInput"
							className="hut-input"
							title="Hutnummer"
							maxLength={3}
							onChange={changeHutNummer}
							value={hutNummer}
							placeholder="000"
						/>
						<LoadingIcon shown={loading} />
					</div>

					<div className="hut-nav">
						<button
							type="button"
							className="btn-secondary hut-nav-btn"
							onClick={() => goToAdjacentHut(-1)}
							disabled={!canGoToPreviousHut}
						>
							<FaChevronLeft aria-hidden="true" />
							Vorige
						</button>
						<button
							type="button"
							className="btn-secondary hut-nav-btn"
							onClick={() => goToAdjacentHut(1)}
							disabled={!canGoToNextHut}
						>
							Volgende
							<FaChevronRight aria-hidden="true" />
						</button>
					</div>
				</div>

				{errorTitle && (
					<div className="hut-error">
						<h4>{errorTitle}</h4>
						<p>{errorHelpText}</p>
					</div>
				)}

				{hutIsOpen && (
					<div className="section">
						<div className="hut-summary">
							<span className="hut-badge">{kidsInHut.length}</span>
							<div className="hut-summary-text">
								<h2>Kinderen in hut {hutNummer}</h2>
								<p>Tik op een kind om het uit dit hutje te halen.</p>
							</div>
						</div>

						{kidsInHut.length > 0 ? (
							<div className="kid-list">
								{kidsInHut.map((kid) => (
									<div
										key={kid.id}
										className="kid-item"
										onClick={() => removeKidFromHut(kid)}
									>
										<span className="kid-name">{kid.firstName} {kid.lastName}</span>
										{kid.wristband && (
											<span className="kid-meta">#{kid.wristband}</span>
										)}
										<button
											type="button"
											className="kid-remove"
											aria-label={`${kid.firstName} ${kid.lastName} uit hutje halen`}
											onClick={(e) => {
												e.stopPropagation();
												removeKidFromHut(kid);
											}}
										>
											&times;
										</button>
									</div>
								))}
							</div>
						) : (
							<div className="empty-state">
								<p>Nog geen kinderen in hutje.</p>
							</div>
						)}

						<button
							onClick={() => setShowAddChildModal(true)}
							type="button"
							className="big add-child-btn"
						>
							<span className="add-child-plus">+</span>
							Kind toevoegen aan hutje
						</button>
					</div>
				)}

				{hutIsOpen && (
					<div className="hut-history">
						<h2 className="section-title">Hut-geschiedenis</h2>
						{hutHistory.length === 0 ? (
							<div className="empty-state">
								<p>Er zijn nog geen kinderen toegevoegd/verwijderd uit deze hut.</p>
							</div>
						) : (
							<div className="history-list">
								{hutHistory.map((historyItem, index) => (
									<div key={index} className="history-item">
										{generateGebeurtenisDescription(historyItem, true)}
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Add Child Modal */}
				{showAddChildModal && (
					<div className="modal-overlay" onClick={closeModal}>
						<div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
							<div className="modal-header">
								<h2>Kind toevoegen aan hutje {hutNummer}</h2>
								<button
									type="button"
									className="modal-close"
									aria-label="Sluiten"
									onClick={closeModal}
								>
									&times;
								</button>
							</div>

							<div className="modal-body">
								<label htmlFor="hutjeChildSearch">Zoek op naam of polsbandnummer:</label>
								<input
									type="text"
									id="hutjeChildSearch"
									className={`child-search-input${searchTerm.length >= 2 ? ' is-active' : ''}`}
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									placeholder="Voer naam of nummer in..."
								/>
								<LoadingIcon shown={searchLoading} />

								{/* Search Results */}
								{searchResults.length > 0 && (
									<div className="result-section">
										<h3>Zoekresultaten:</h3>
										<div className="result-list">
											{searchResults.map((result, index) => (
												<div key={index} className="result-item">
													<div className="result-info">
														<span
															className="result-name"
															dangerouslySetInnerHTML={{ __html: result.highlightedText }}
														/>
														<span className="result-meta">
															#{result.ticket.wristband}
															{result.ticket.hutNr && ` (hut ${result.ticket.hutNr})`}
														</span>
													</div>
													<button
														type="button"
														className="btn-sm result-add"
														onClick={() => addChildToHut(result.ticket)}
														disabled={addChildToHutIsLoading}
													>
														{addChildToHutIsLoading ? (
															<LoadingIcon color="white" shown={true} />
														) : (
															'Toevoegen'
														)}
													</button>
												</div>
											))}
										</div>
									</div>
								)}

								{/* No Results */}
								{searchTerm.length >= 2 && !searchLoading && searchResults.length === 0 && (
									<div className="empty-state">
										<p>Geen resultaten gevonden voor "{searchTerm}"</p>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>
		</Layout>
	);
}

export default HutjesManagement;
