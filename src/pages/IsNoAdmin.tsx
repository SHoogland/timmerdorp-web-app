import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import { useNavigate } from 'react-router-dom';
import logOut from '../utils/logOut';
import Parse from 'parse';

function IsNoAdmin() {
	const [email, setEmail] = useState('')
	const [refreshInterval, setRefreshInterval] = useState(0);
	const navigate = useNavigate();

	const refresh = async () => {
		const response = await apiCall('checkIfLoggedIn', { wantsToBecomeAdmin: true });
		if (!response.result) {
			navigate('/login');
		}
		if (!response.emailConfirmed) {
			navigate('/email-niet-bevestigd');
		}
		if (response.admin) {
			navigate('/');
		}
	}

	useEffect(() => {
		const user = Parse.User.current();
		if (user) {
			setEmail(user.get('username'));
		} else {
			navigate('/login');
		}

		setRefreshInterval(+setInterval(refresh, 5000));
		refresh();

		return () => {
			clearInterval(refreshInterval);
			setRefreshInterval(0);
		};
	}, []);

	return (
		<Layout title="Registreren <<(stap 3/3)>>" disableBackButton={true} disableLogo={true} backgroundColor='blue'>
			<h2>Nog geen beheerder!</h2>
			<p>Je bent door Stan en Stephan nog niet aangewezen als app-beheerder! Daarom heb je nog geen toegang tot de app. Vraag een van hen om je toe te voegen als beheerder. Je bent ingelogd als {email}.</p>
			<br/>
			<button className='big' onClick={() => {logOut(); navigate('/login')}}>Uitloggen</button>
		</Layout>
	);
}

export default IsNoAdmin;
