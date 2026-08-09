import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import { useNavigate } from 'react-router-dom';
import logOut from '../utils/logOut';
import Parse from 'parse';

function IsNoAdmin() {
	const [email, setEmail] = useState('')
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

		const refreshInterval = setInterval(refresh, 5000);
		refresh();

		return () => {
			clearInterval(refreshInterval);
		}
	}, []);

	return (
		<Layout noHeader={true} backgroundColor='blue'>
			<div className="auth-page">
				<div className="auth-head">
					<div className="auth-brand">Timmerdorp</div>
					<div className="funnel-step">
						<div className="funnel-progress" role="img" aria-label="Stap 3 van 3">
							<span className="dot is-done" />
							<span className="dot is-done" />
							<span className="dot is-active" />
						</div>
						<span>Registreren, stap 3 van 3</span>
					</div>
				</div>

				<h2>Nog geen beheerder!</h2>
				<p className="auth-copy">Je bent door Stan en Stephan nog niet aangewezen als app-beheerder! Daarom heb je nog geen toegang tot de app. Vraag een van hen om je toe te voegen als beheerder. Je bent ingelogd als {email}.</p>
				<button className='big auth-secondary' onClick={() => {logOut(); navigate('/login')}}>Uitloggen</button>
			</div>
		</Layout>
	);
}

export default IsNoAdmin;
