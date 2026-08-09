
import Parse from 'parse';
import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import { useEffect, useState } from 'react';
import generateGebeurtenisDescription from '../utils/generateGebeurtenisDescription.tsx';
import logOut from '../utils/logOut';
import '../scss/Settings.scss'
import LoadingIcon from '../components/LoadingIcon';

interface Admin {
	email: string;
	name: string;
}

function Settings() {
	const [isStanOfStephan, setIsStanOfStephan] = useState(false);
	const [wijkName, setWijkName] = useState('');
	const [isInitialized, setIsInitialized] = useState(false);
	const [loading, setLoading] = useState(false);
	const [admins, setAdmins] = useState<Admin[]>([]);
	const [potentialAdmins, setPotentialAdmins] = useState<Admin[]>([]);
	const [eventHistory, setEventHistory] = useState<Parse.Object[]>([]);
	const [historyLength, setHistoryLength] = useState(0);
	// Every eventType the API ever writes to the History class, from the six
	// logEventHistory call sites in timmerdorp-parse/cloud/lib/app/. Keep this
	// in sync with those, or the events silently never show up in the list.
	const eventCategories = ['set-hutnr', 'marked-present', 'marked-absent', 'save-hut-location', 'collected-sole', 'gave-wristband', 'ticket-edit']
	const [selectedEventCategories, setSelectedEventCategories] = useState(eventCategories);
	const categoryNameMap: { [key: string]: string } = {
		'set-hutnr': 'Hutnummers',
		'marked-present': 'Presenties',
		'marked-absent': 'Absenties',
		'save-hut-location': 'Hut-locaties',
		'collected-sole': 'Zooltjes',
		'gave-wristband': 'Polsbandjes',
		'ticket-edit': 'Gegevenswijzigingen',
	}
	const navigate = useNavigate();


	const deleteAccount = () => {
		if (confirm("Wil je echt je account verwijderen?")) {
			apiCall('deleteAccount').then(function (result) {
				if (result.result === 'success') {
					logOut();
					navigate('/login');
				}
			})
		}
	}

	const removeAdmin = (email: string) => {
		// force remove when removing a non-accepted admin
		const forceRemove = !admins.find((a) => a.email === email);
		apiCall('removeAdmin', { email, force: forceRemove }).then(function (result) {
			if (result.success) {
				const removedAdmin = admins.find((a) => a.email === email);
				setAdmins(admins.filter((a) => a.email !== email));
				if (forceRemove) {
					setPotentialAdmins(potentialAdmins.filter((a) => a.email !== email));
				} else {
					setPotentialAdmins([...potentialAdmins, { email: removedAdmin?.email || '', name: removedAdmin?.name || '' }]);
				}
				alert('Gelukt! Admin verwijderd.');
			} else {
				alert("Admin verwijderen mislukt: " + JSON.stringify(result));
			}
		})
	}

	const acceptAdmin = (email: string, force?: boolean) => {
		if(!email) return;
		apiCall('addAdmin', { email, force }).then(function (result) {
			if (result.success) {
				const admittedAdmin = potentialAdmins.find((a) => a.email === email);
				setPotentialAdmins(potentialAdmins.filter((a) => a.email !== email));
				// A manually added admin is not in potentialAdmins, so the lookup
				// misses and the old code appended a row with an empty email and
				// name: it rendered blank and could never be removed again,
				// because removeAdmin matched on that empty string.
				setAdmins([...admins, { email, name: admittedAdmin?.name || email }]);
				alert('Gelukt! Admin toegevoegd.');
			} else {
				alert("Admin toevoegen mislukt: " + JSON.stringify(result));
			}
		})
	}

	const handleCategoryClick = (category: string) => {
		let newEventCategories = [...selectedEventCategories];
		if (selectedEventCategories.includes(category)) {
			newEventCategories = newEventCategories.filter((c) => c !== category);
		} else {
			newEventCategories.push(category);
		}
		setSelectedEventCategories(newEventCategories);
	}

	const filterEvents = (oldHistory: Parse.Object[]) => {
		const newHistory = oldHistory.map((h) => {
			h.set('shown', selectedEventCategories.includes(h.get('eventType')));
			return h;
		});
		return newHistory
	}


	const getMoreEvents = () => {
		apiCall('getAdmins', { justMoreHistory: true, skip: eventHistory.length }).then(function (result) {
			if (result.denied) {
				return;
			}
			let newHistory = result.result.map((h: Parse.Object) => {
				h.set('desc', generateGebeurtenisDescription(h, true));
				h.set('shown', true);
				return h;
			});
			newHistory = filterEvents([...eventHistory, ...newHistory]);
			setEventHistory(newHistory);
		});
	}


	useEffect(() => {
		const email = Parse.User.current()?.get('username');
		if (email === 'stanvanbaarsen@hotmail.com' || email === 'stephan@shoogland.com') {
			setIsStanOfStephan(true);

			setLoading(true);
			apiCall('getAdmins').then(function (result) {
				if (result.denied) {
					return;
				}
				setAdmins(result.admins.sort((a: Admin, b: Admin) => a.name.localeCompare(b.name)));
				setPotentialAdmins(result.potentialAdmins.sort((a: Admin, b: Admin) => a.name.localeCompare(b.name)));
				let history = result.history;
				history = history.map((h: Parse.Object) => {
					h.set('desc', generateGebeurtenisDescription(h, true));
					h.set('shown', true);
					return h;
				});

				setEventHistory(history);
				setHistoryLength(result.historyLength);
				setLoading(false);
			})
		}

		const englishWijkName = localStorage.getItem('wijkName') || '';
		const wijkNaam = {
			blue: 'Blauw',
			green: 'Groen',
			red: 'Rood',
			yellow: 'Geel',
			white: 'Wit/EHBO',
		}[englishWijkName];
		setWijkName(wijkNaam || 'Onbekend');

		const wijkCookie = {
			blue: 'blauw',
			green: 'groen',
			red: 'rood',
			yellow: 'geel',
			white: 'wit',
		}[englishWijkName];

		document.cookie = `wijk=${wijkCookie}; path=/; max-age=31536000`;

		setIsInitialized(true);

		if(window.location.href.includes('confirm-admin-email')) {
			const URLEmail = window.location.href.split('confirm-admin-email=')[1].split('&')[0];
			// stan is trying to add someone as an admin
			if(confirm(`Wil je ${URLEmail} toevoegen als admin?`)) {
				acceptAdmin(URLEmail);
			}
		}
	}, []);

	useEffect(() => {
		setEventHistory(filterEvents(eventHistory));
	}, [selectedEventCategories]);

	const shownEvents = eventHistory.filter(h => h.get('shown'));

	return (
		<Layout title={isStanOfStephan ? "Instellingen" : "Account info"}>
			{isInitialized && (
				<div className="settings-page">
					<section className="section">
						<h2 className="section-title">Account</h2>
						<div className="panel def-list">
							<div className="def-row">
								<span className="def-label">Email</span>
								<span className="def-value selectable">{Parse.User.current()?.get('username')}</span>
							</div>
							<div className="def-row">
								<span className="def-label">Naam</span>
								<span className="def-value">{Parse.User.current()?.get('firstName') + " " + Parse.User.current()?.get('lastName')}</span>
							</div>
							<div className="def-row">
								<span className="def-label">Wijk</span>
								<span className="def-value">
									{wijkName} <a onClick={() => navigate('/wijzig-wijk')}>(aanpassen)</a>
								</span>
							</div>
						</div>
					</section>

					<LoadingIcon shown={loading}/>

					{isStanOfStephan && !loading && (
						<>
							<section className="section">
								<h2 className="section-title">Admins</h2>
								{admins.length > 0 && (
									<ul className="panel people-list">
										{admins.map((admin) => (
											<li key={admin.email}>
												<span className="person">
													<span className="person-name">{admin.name}</span>
													<span className="person-email selectable">{admin.email}</span>
												</span>
												<span className="person-actions">
													<button className="btn-quiet btn-sm" onClick={() => removeAdmin(admin.email)}>Verwijderen</button>
												</span>
											</li>
										))}
									</ul>
								)}
								<button className="btn-ghost btn-sm add-admin" onClick={() => acceptAdmin(prompt('E-mailadres van nieuwe admin:') || '', true)}>
									Handmatig een beheerder toevoegen
								</button>
							</section>

							<section className="section">
								<h2 className="section-title">Admin-verzoeken</h2>
								{potentialAdmins.length > 0 ? (
									<ul className="panel people-list">
										{potentialAdmins.map((admin) => (
											<li key={admin.email}>
												<span className="person">
													<span className="person-name">{admin.name}</span>
													<span className="person-email selectable">{admin.email}</span>
												</span>
												<span className="person-actions">
													<button className="btn-sm" onClick={() => acceptAdmin(admin.email)}>Accepteren</button>
													<button className="btn-quiet btn-sm" onClick={() => removeAdmin(admin.email)}>Weigeren</button>
												</span>
											</li>
										))}
									</ul>
								) : (
									<div className="panel empty-state">
										<p>Geen admin-verzoeken</p>
									</div>
								)}
							</section>

							<section className="section">
								<h2 className="section-title">Event history (0-{shownEvents.length} van {historyLength})</h2>

								<div className="chip-row">
									{eventCategories.map((category) => (
										<button
											key={category}
											type="button"
											aria-pressed={selectedEventCategories.includes(category)}
											className={'chip' + (selectedEventCategories.includes(category) ? ' is-selected' : '')}
											onClick={() => handleCategoryClick(category)}
										>{categoryNameMap[category]}</button>
									))}
								</div>

								{eventHistory.length > 0 && (
									<ul id="eventHistory" className="panel event-timeline">
										{shownEvents.map((event, index) => (
											<li key={index}>
												{ event.get('desc') }
											</li>
										))}
									</ul>
								)}

								{historyLength > eventHistory.length && (
									<button className="btn-quiet block load-more" onClick={() => getMoreEvents()}>
										Nog 100 resultaten ophalen (van de overgebleven { historyLength - eventHistory.length })
									</button>
								)}
							</section>
						</>
					)}

					{!isStanOfStephan && (
						<section className="section danger-zone">
							<button className="btn-danger block" onClick={deleteAccount}>Verwijder account</button>
						</section>
					)}
				</div>
			)}
		</Layout>
	);
}

export default Settings;
