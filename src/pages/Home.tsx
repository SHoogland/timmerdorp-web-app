import Parse from 'parse';

import { useNavigate } from 'react-router-dom';
import checkIfStillLoggedIn from '../utils/checkIfStillLoggedIn.ts';


function Home() {
	const navigate = useNavigate();

	checkIfStillLoggedIn().then((result) => {
		if (!result.result) {
			navigate('/login');
		}
	})


	const logOut = async () => {
		await Parse.User.logOut().catch(
			error => {
				alert('Probleem tijdens uitloggen: ' + error);
			}
		).then(function (user) {
			console.log('User logged out', user);
		})

		navigate('/login');
	}


	return (
		<>
			<h1>Timmerdorp app</h1>
			<ul>
				<li>
					<a href="/zoek">Zoek kinderen</a>
				</li>
				<li>
					<a href="/aanwezigheid">Aanwezigheid</a>
				</li>
				<li>
					<a href="/scan">Scan ticket</a>
				</li>
				<li>
					<a href="/hutjes">Beheer hutjes</a>
				</li>
				<li>
					<a href="/statistieken">Statistieken</a>
				</li>
				<li>
					<a href="/verjaardagen">Verjaardagen</a>
				</li>
				<li>
					<a href="/kaart">Kaart... (doen we dat nog dit jaar?)</a>
				</li>
				<li>
					<a href="/fotos">Foto's en bijlagen</a>
				</li>
				<li>
					<a href="/instellingen">Instellingen</a>
				</li>
				<li>
					<a href="#" onClick={logOut}>Uitloggen</a>
				</li>
			</ul>
		</>
	)

export default Home
