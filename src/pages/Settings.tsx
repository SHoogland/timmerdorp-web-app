
import Parse from 'parse';
import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import { useEffect, useState } from 'react';
import generateGebeurtenisDescription from '../utils/generateGebeurtenisDescription';
import '../scss/Settings.scss'

interface Admin {
	email: string;
	name: string;
}

interface EventCategory {
	name: string;
	selected: boolean;
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
	const [eventCategories, setEventCategories] = useState<EventCategory[]>([]);
	const categoryNameMap: { [key: string]: string } = {
		'set-hutnr': 'Hutnummers',
		'marked-present': 'Presenties',
		'marked-absent': 'Absenties',
		'save-hut-location': 'Hut-locaties',
		'collected-sole': 'Zooltjes',
		'gave-wristband': 'Polsbandjes',
	}
	const navigate = useNavigate();

	useEffect(() => {
		const email = Parse.User.current()?.get('username');
		if (email === 'stanvanbaarsen@hotmail.com' || email === 'stephan@shoogland.com') {
			setIsStanOfStephan(true);

			setLoading(true);
			apiCall('getAdmins').then(function (result) {
				if (result.denied) {
					return;
				}
				setAdmins(result.admins);
				setPotentialAdmins(result.potentialAdmins);
				let history = result.history;
				history = history.map((h: Parse.Object) => {
					h.set('desc', generateGebeurtenisDescription(h, true));
					h.set('shown', true);
					return h;
				});

				let eventCategories = history.map((h: Parse.Object) => h.get('eventType'));
				eventCategories = [...new Set(eventCategories)]; // remove duplicates
				eventCategories = eventCategories.map((name: string) => ({ name, selected: true }));
				setEventCategories(eventCategories);
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

		setIsInitialized(true);
	}, []);


	const deleteAccount = () => {
		if (confirm("Wil je echt je account verwijderen?")) {
			apiCall('deleteAccount').then(function (result) {
				if (result.result === 'success') {
					Parse.User.logOut();
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
				if(forceRemove) {
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

	const acceptAdmin = (email: string) => {
		apiCall('addAdmin', { email }).then(function (result) {
			if (result.success) {
				const admittedAdmin = potentialAdmins.find((a) => a.email === email);
				setPotentialAdmins(potentialAdmins.filter((a) => a.email !== email));
				setAdmins([...admins, { email: admittedAdmin?.email || '', name: admittedAdmin?.name || '' }]);
				alert('Gelukt! Admin toegevoegd.');
			} else {
				alert("Admin toevoegen mislukt: " + JSON.stringify(result));
			}
		})
	}

	const handleCategoryClick = (category: EventCategory) => {
		const newEventCategories = eventCategories.map((c) => {
			if (c.name === category.name) {
				return { ...c, selected: !c.selected };
			}
			return c;
		});
		setEventCategories(newEventCategories);
	}

	useEffect(() => {
		const selectedCategories = eventCategories.filter((c) => c.selected).map((c) => c.name);
		const newHistory = eventHistory.map((h) => {
			console.log(selectedCategories, h.get('eventType'));
			h.set('shown', selectedCategories.includes(h.get('eventType')));
			return h;
		});
		console.log(newHistory)
		setEventHistory(newHistory);
	}, [eventCategories]);


	return (
		<Layout title={isStanOfStephan ? "Instellingen" : "Account info"}>
			{isInitialized && (
				<>
					<table>
						<tbody>
							<tr>
								<td>Email</td>
								<td>{Parse.User.current()?.get('username')}</td>
							</tr>
							<tr>
								<td>Naam</td>
								<td>{Parse.User.current()?.get('firstName') + " " + Parse.User.current()?.get('lastName')}</td>
							</tr>
							<tr>
								<td>Wijk</td>
								<td>{wijkName} <a onClick={() => navigate('/wijzig-wijk')}>(aanpassen)</a></td>
							</tr>
						</tbody>
					</table>
					{!isStanOfStephan && <button className="big red" onClick={deleteAccount}>Verwijder account</button>}

					{loading && "Laden..."}

					{isStanOfStephan && !loading && (
						<>
							<h2>Admins</h2>
							{admins.length > 0 && (
								<table>
									<tbody>
										{admins.map((admin) => (
											<tr key={admin.email}>
												<td>{admin.name}</td>
												<td>{admin.email}</td>
												<td><button onClick={() => removeAdmin(admin.email)}>Verwijderen</button></td>
											</tr>
										))}
									</tbody>
								</table>
							)}

							<h2>Admin-verzoeken</h2>
							{potentialAdmins.length > 0 && (
								<table>
									<tbody>
										{potentialAdmins.map((admin) => (
											<tr key={admin.email}>
												<td>{admin.name}</td>
												<td>{admin.email}</td>
												<td><button onClick={() => acceptAdmin(admin.email)}>Accepteren</button></td>
												<td><button onClick={() => removeAdmin(admin.email)}>Weigeren</button></td>
											</tr>
										))}
									</tbody>
								</table>
							)}

							{potentialAdmins.length === 0 && <p>Geen admin-verzoeken</p>}

							<h2>Event history (0-{eventHistory.filter(h => h.get('shown')).length} van {historyLength})</h2>
							{eventCategories.map((category) => (
								<button key={category.name} className={'categoryButton ' + (category.selected ? 'selected' : '')} onClick={() => handleCategoryClick(category)}>{categoryNameMap[category.name]}</button>
							))}
							{eventHistory.length > 0 && (
								<ul id="eventHistory">
									{eventHistory.filter(h => h.get('shown')).map((event, index) => (
										<li key={index} dangerouslySetInnerHTML={{ __html: event.get('desc') }}>
										</li>
									))}
								</ul>
							)}
						</>
					)
					}
				</>
			)}
		</Layout>
	);
}

export default Settings;
