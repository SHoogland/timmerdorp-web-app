
import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import LoadingIcon from '../components/LoadingIcon';
import generateGebeurtenisDescription from '../utils/generateGebeurtenisDescription';
import getWijkHexColor from '../utils/getWijkHexColor';

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
	const [hutNummer, setHutNummer] = useState('');
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
	const [currentWijk, setCurrentWijk] = useState('blue');

	useEffect(() => {
		// Get current wijk from localStorage
		const wijk = localStorage.getItem('wijkName') || 'blue';
		setCurrentWijk(wijk);
	}, []);

	const search = async () => {
		setKidsInHut([]);
		setErrorTitle('');
		setErrorHelpText('');
		if (hutNummer.length < 3) {
			return;
		}
		setLoading(true);

		try {
			const result = await apiCall('searchHut', { hutNr: hutNummer });
			setLoading(false);

			if (!result || result.response !== 'success') {
				setErrorTitle(result.errorTitle || result.response);
				setErrorHelpText(result.errorTitleMessage || result.response);
				return;
			}

			setHasSearchedForHut(true);
			setLastSearchedHut(hutNummer);
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

	const wijkColor = getWijkHexColor(currentWijk);

	const styles = {
		hutjesManagement: {
			padding: '20px',
			maxWidth: '800px',
			margin: '0 auto'
		},
		hutjesHeader: {
			textAlign: 'center' as const,
			marginBottom: '0',
			padding: '20px 8px',
			background: wijkColor,
			borderRadius: '12px 12px 0 0',
			color: currentWijk === 'yellow' ? '#101010' : 'white'
		},
		hutjesHeaderH2: {
			margin: '0 0 0 0',
			padding: '0',
			fontSize: '1.4em',
			fontWeight: '600',
			color: currentWijk === 'yellow' ? '#101010' : 'white'
		},
		searchContainer: {
			position: 'relative' as const,
			display: 'inline-block',
		},
		searchInputCard: {
			padding: '25px',
			background: 'white',
			borderRadius: '0 0 12px 12px',
			boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
			textAlign: 'center' as const
		},
		hutNumberInput: {
			fontSize: '2em',
			textAlign: 'center' as const,
			width: '120px',
			height: '60px',
			borderRadius: '12px',
			border: '2px solid rgba(255,255,255,0.3)',
			background: 'white',
			color: '#101010',
			transition: 'all 0.2s ease',
			outline: '1px solid #333',
		},
		resultsSection: {
			marginBottom: '30px',
			padding: '20px',
			background: 'white',
			borderRadius: '12px',
			boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
		},
		resultsSectionH3: {
			margin: '0 0 20px 0',
			color: '#101010',
			fontSize: '1.4em',
			fontWeight: '600',
			borderBottom: `2px solid ${wijkColor}`,
			paddingBottom: '10px'
		},
		kidsList: {
			display: 'flex',
			flexDirection: 'column' as const,
			gap: '10px'
		},
		kidItem: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			padding: '15px 20px',
			background: '#f8f9fa',
			borderRadius: '8px',
			border: '2px solid transparent',
			transition: 'all 0.2s ease',
			cursor: 'pointer'
		},
		kidName: {
			fontWeight: '500',
			color: '#101010'
		},
		removeIcon: {
			color: '#ee0202',
			fontSize: '1.5em',
			fontWeight: 'bold',
			opacity: 0.7,
			transition: 'opacity 0.2s ease'
		},
		emptyState: {
			textAlign: 'center' as const,
			padding: '40px 20px',
			color: '#666',
			fontStyle: 'italic'
		},
		actionsSection: {
			marginBottom: '30px',
			textAlign: 'center' as const
		},
		addChildBtn: {
			display: 'flex',
			alignItems: 'center',
			gap: '10px',
			padding: '18px 30px',
			fontSize: '1.1em',
			background: wijkColor,
			borderRadius: '8px',
			boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
			transition: 'all 0.2s ease',
			border: 'none',
			color: currentWijk === 'yellow' ? '#101010' : 'white',
			cursor: 'pointer',
			fontWeight: 'bold'
		},
		addChildBtnSpan: {
			fontSize: '1.3em',
			fontWeight: 'bold'
		},
		historySection: {
			padding: '20px',
			background: 'white',
			borderRadius: '12px',
			boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
		},
		historySectionH3: {
			margin: '0 0 20px 0',
			color: '#101010',
			fontSize: '1.4em',
			fontWeight: '600',
			borderBottom: `2px solid ${wijkColor}`,
			paddingBottom: '10px'
		},
		noHistory: {
			textAlign: 'center' as const,
			color: '#666',
			fontStyle: 'italic',
			padding: '20px'
		},
		historyList: {
			display: 'flex',
			flexDirection: 'column' as const,
			gap: '8px'
		},
		historyItem: {
			padding: '12px 16px',
			background: '#f8f9fa',
			borderRadius: '8px',
			borderLeft: `4px solid ${wijkColor}`,
			fontSize: '0.9em',
			color: '#555'
		},
		errorSection: {
			marginTop: '20px',
			padding: '20px',
			background: '#ffebee',
			borderRadius: '10px',
			borderLeft: '4px solid #f44336'
		},
		errorSectionH4: {
			margin: '0 0 10px 0',
			color: '#c62828'
		},
		errorSectionP: {
			margin: '0',
			color: '#d32f2f'
		},
		modalOverlay: {
			position: 'fixed' as const,
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			background: 'rgba(0,0,0,0.5)',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			zIndex: 1000
		},
		modalContent: {
			background: 'white',
			borderRadius: '12px',
			width: '90%',
			maxWidth: '600px',
			maxHeight: '80vh',
			overflowY: 'auto' as const,
			boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
		},
		modalHeader: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			padding: '20px 25px',
			borderBottom: '1px solid #e0e0e0',
			background: wijkColor,
			color: currentWijk === 'yellow' ? '#101010' : 'white',
			borderRadius: '12px 12px 0 0'
		},
		modalHeaderH2: {
			margin: '0',
			fontSize: '1.3em',
			fontWeight: '600',
			color: currentWijk === 'yellow' ? '#101010' : 'white'
		},
		closeBtn: {
			background: 'none',
			border: 'none',
			color: currentWijk === 'yellow' ? '#101010' : 'white',
			fontSize: '1.8em',
			cursor: 'pointer',
			padding: '0',
			width: '32px',
			height: '32px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: '50%',
			transition: 'background 0.2s ease'
		},
		modalBody: {
			padding: '25px'
		},
		searchSection: {
			marginBottom: '25px'
		},
		searchSectionLabel: {
			display: 'block',
			marginBottom: '10px',
			fontWeight: '600',
			color: '#101010'
		},
		searchInput: {
			width: '100%',
			padding: '12px 16px',
			fontSize: '1em',
			border: '2px solid #e0e0e0',
			borderRadius: '8px',
			transition: 'all 0.2s ease',
			boxSizing: 'border-box' as const,
			background: 'white'
		},
		searchResults: {
			marginTop: '20px'
		},
		searchResultsH4: {
			margin: '0 0 15px 0',
			color: '#101010',
			fontSize: '1.1em',
			fontWeight: '600'
		},
		resultsList: {
			display: 'flex',
			flexDirection: 'column' as const,
			gap: '10px'
		},
		resultItem: {
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
			padding: '14px 18px',
			background: '#f8f9fa',
			borderRadius: '8px',
			border: '2px solid transparent',
			transition: 'all 0.2s ease'
		},
		resultInfo: {
			display: 'flex',
			flexDirection: 'column' as const,
			gap: '4px'
		},
		resultName: {
			fontWeight: '600',
			color: '#101010',
			fontSize: '1em'
		},
		wristbandNumber: {
			fontSize: '0.85em',
			color: '#666',
			fontFamily: 'monospace'
		},
		addBtn: {
			padding: '8px 16px',
			background: wijkColor,
			borderRadius: '6px',
			fontWeight: '600',
			transition: 'all 0.2s ease',
			minWidth: '90px',
			border: 'none',
			color: currentWijk === 'yellow' ? '#101010' : 'white',
			cursor: 'pointer',
			fontSize: '0.9em'
		},
		noResults: {
			textAlign: 'center' as const,
			padding: '25px 20px',
			color: '#666',
			fontStyle: 'italic'
		}
	};

	return (
		<Layout title='Hutjes beheren'>
			<div style={styles.hutjesManagement}>
				{/* Header Section */}
				<div style={styles.hutjesHeader}>
					<h2 style={styles.hutjesHeaderH2}>Hutnummer zoeken</h2>
				</div>
				
				{/* Search Input Card */}
				<div style={styles.searchInputCard}>
					<div style={styles.searchContainer}>
						<input
							type="tel"
							title="Hutnummer"
							maxLength={3}
							onChange={changeHutNummer}
							value={hutNummer}
							placeholder="000"
							style={styles.hutNumberInput}
						/>
						<LoadingIcon shown={loading} />
					</div>
				</div>

				{/* Results Section */}
				{kidsInHut.length > 0 && (
					<div style={styles.resultsSection}>
						<h3 style={styles.resultsSectionH3}>Kinderen in hut {hutNummer}</h3>
						<div style={styles.kidsList}>
							{kidsInHut.map((kid) => (
								<div
									key={kid.id}
									style={styles.kidItem}
									onClick={() => removeKidFromHut(kid)}
								>
									<span style={styles.kidName}>{kid.firstName} {kid.lastName}</span>
									<span style={styles.removeIcon}>×</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Empty State */}
				{kidsInHut.length === 0 && hasSearchedForHut && !errorTitle && (
					<div style={styles.emptyState}>
						<p>Nog geen kinderen in hutje.</p>
					</div>
				)}

				{/* Actions Section */}
				{hasSearchedForHut && (
					<div style={styles.actionsSection}>
						<button
							onClick={() => setShowAddChildModal(true)}
							type="button"
							style={styles.addChildBtn}
						>
							<span style={styles.addChildBtnSpan}>+</span>
							Kind toevoegen aan hutje
						</button>
					</div>
				)}

				{/* History Section */}
				{hasSearchedForHut && (
					<div style={styles.historySection}>
						<h3 style={styles.historySectionH3}>Hut-geschiedenis</h3>
						{hutHistory.length === 0 ? (
							<p style={styles.noHistory}>Er zijn nog geen kinderen toegevoegd/verwijderd uit deze hut.</p>
						) : (
							<div style={styles.historyList}>
								{hutHistory.map((historyItem, index) => (
									<div key={index} style={styles.historyItem}>
										{generateGebeurtenisDescription(historyItem, true)}
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{/* Error Display */}
				{errorTitle && (
					<div style={styles.errorSection}>
						<h4 style={styles.errorSectionH4}>{errorTitle}</h4>
						<p style={styles.errorSectionP}>{errorHelpText}</p>
					</div>
				)}
			</div>

			{/* Add Child Modal */}
			{showAddChildModal && (
				<div style={styles.modalOverlay} onClick={closeModal}>
					<div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
						<div style={styles.modalHeader}>
							<h2 style={styles.modalHeaderH2}>Kind toevoegen aan hutje {hutNummer}</h2>
							<button style={styles.closeBtn} onClick={closeModal}>×</button>
						</div>
						
						<div style={styles.modalBody}>
							<div style={styles.searchSection}>
								<label htmlFor="searchInput" style={styles.searchSectionLabel}>Zoek op naam of polsbandnummer:</label>
								<input
									type="text"
									id="searchInput"
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									placeholder="Voer naam of nummer in..."
									style={{
										...styles.searchInput,
										outline: 'none',
										borderColor: searchTerm.length >= 2 ? wijkColor : '#e0e0e0'
									}}
								/>
								<LoadingIcon shown={searchLoading} />
							</div>

							{/* Search Results */}
							{searchResults.length > 0 && (
								<div style={styles.searchResults}>
									<h4 style={styles.searchResultsH4}>Zoekresultaten:</h4>
									<div style={styles.resultsList}>
										{searchResults.map((result, index) => (
											<div key={index} style={styles.resultItem}>
												<div style={styles.resultInfo}>
													<span 
														style={styles.resultName}
														dangerouslySetInnerHTML={{ __html: result.highlightedText }}
													/>
													<span style={styles.wristbandNumber}>
														#{result.ticket.wristband}
														{result.ticket.hutNr && ` (hut ${result.ticket.hutNr})`}
													</span>
												</div>
												<button
													onClick={() => addChildToHut(result.ticket)}
													disabled={addChildToHutIsLoading}
													style={styles.addBtn}
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
								<div style={styles.noResults}>
									<p>Geen resultaten gevonden voor "{searchTerm}"</p>
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</Layout>
	);
}

export default HutjesManagement;
