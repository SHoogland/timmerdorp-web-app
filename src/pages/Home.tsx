import Parse from 'parse';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiCall from '../utils/apiCall';
import logOut from '../utils/logOut';
import '../scss/Home.scss';

function Home() {
	const [isStanOfStephan, setIsStanOfStephan] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const email = Parse.User.current()?.get('username');
		if (email === 'stanvanbaarsen@hotmail.com' || email === 'stephan@shoogland.com') {
			setIsStanOfStephan(true);
		}


		let wantsAdmin = false;
		if(!localStorage.getItem('isAdmin')) {
			// we have not registered that this user is an admin yet
			wantsAdmin = true;
		}
		apiCall('checkIfLoggedIn', { wantsToBecomeAdmin: wantsAdmin }).then((response) => {
			if (!response.result) {
				logOut().then(() => {
					navigate('/login');
				});
			}
			if(!response.admin) {
				localStorage.setItem('isAdmin', 'false');
				navigate('/is-geen-beheerder');
			}
		}).catch((error) => {
			if (error.message == 'Invalid session token') {
				logOut().then(() => {
					navigate('/login');
				});
			}
		})
	}, []);

	const logOutFunction = async () => {
		await logOut().catch(
			error => {
				alert('Probleem tijdens uitloggen: ' + error);
			}
		);

		navigate('/login');
	}

	return (
		<div className='home'>
			<h1>Timmerdorp app</h1>
			<ul>
				<li>
					<a onClick={() => navigate('zoek')}>Zoek kinderen</a>
				</li>
				<li>
					<a onClick={() => navigate('aanwezigheid')}>Aanwezigheid</a>
				</li>
				<li>
					<a onClick={() => navigate('scan')}>Scan ticket</a>
				</li>
				<li>
					<a onClick={() => navigate('hutjes')}>Beheer hutjes</a>
				</li>
				<li>
					<a onClick={() => navigate('statistieken')}>Statistieken</a>
				</li>
				<li>
					<a onClick={() => navigate('verjaardagen')}>Verjaardagen</a>
				</li>
				<li>
					<a onClick={() => navigate('kaart')}>Kaart... (doen we dat nog dit jaar?)</a>
				</li>
				<li>
					<a onClick={() => navigate('fotos')}>Foto's en bijlagen</a>
				</li>
				<li>
					<a onClick={() => navigate('instellingen')}>{isStanOfStephan ? "App beheer" : "Instellingen"}</a>
				</li>
				<li>
					<a href="#" onClick={logOutFunction}>Uitloggen</a>
				</li>
			</ul>
		</div>
	)
}

export default Home
