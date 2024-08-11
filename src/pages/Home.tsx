import Parse from 'parse';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
	const [isStanOfStephan, setIsStanOfStephan] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const email = Parse.User.current()?.get('username');
		if(email === 'stanvanbaarsen@hotmail.com' || email === 'stephan@shoogland.com') {
			setIsStanOfStephan(true);
		}
	}, []);

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
					<a href="/instellingen">{ isStanOfStephan ? "App beheer" : "Instellingen" }</a>
				</li>
				<li>
					<a href="#" onClick={logOut}>Uitloggen</a>
				</li>
			</ul>
		</>
	)
}

export default Home
