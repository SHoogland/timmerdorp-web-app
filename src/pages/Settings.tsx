
import Parse from 'parse';
import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import { useEffect, useState } from 'react';

function Settings() {
	const [isStanOfStephan, setIsStanOfStephan] = useState(false);
	const [wijkName, setWijkName] = useState('');
	const [isInitialized, setIsInitialized] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const email = Parse.User.current()?.get('username');
		if (email === 'stanvanbaarsen@hotmail.com' || email === 'stephan@shoogland.com') {
			setIsStanOfStephan(true);
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
				</>
			)
			}
		</Layout>
	);
}

export default Settings;
