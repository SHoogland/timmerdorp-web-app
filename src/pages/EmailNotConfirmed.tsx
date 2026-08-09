import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import { useNavigate } from 'react-router-dom';
import logOut from '../utils/logOut';
import Parse from 'parse';
import LoadingIcon from '../components/LoadingIcon';

function EmailNotConfirmed() {
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false);
	const navigate = useNavigate();

	const refresh = async () => {
		const response = await apiCall('checkIfLoggedIn', { wantsToBecomeAdmin: true });
		if (!response.result) {
			navigate('/login');
		}
		if (response.emailConfirmed) {
			if (response.isAdmin) {
				navigate('/');
			} else {
				navigate('/is-geen-beheerder');
			}
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
		};
	}, []);

	const requestNewCode = async () => {
		setLoading(true);
		await apiCall('sendEmailCode', { domain: location.origin }, true).catch((e) => {
			alert('Er is iets misgegaan bij het versturen van de e-mail. Probeer het later nog eens. Foutmelding: ' + JSON.stringify(e));
			setLoading(false);
		});
		setLoading(false);
		alert('Er is een nieuwe e-mail verstuurd! Check je inbox en spam-map.');
	};


	return (
		<Layout noHeader={true} backgroundColor='blue'>
			<div className="auth-page">
				<div className="auth-head">
					<div className="auth-brand">Timmerdorp</div>
					<div className="funnel-step">
						<div className="funnel-progress" role="img" aria-label="Stap 2 van 3">
							<span className="dot is-done" />
							<span className="dot is-active" />
							<span className="dot" />
						</div>
						<span>Registreren, stap 2 van 3</span>
					</div>
				</div>

				{/* Reads as a next step, not a reprimand: the user just signed up
				    successfully, nothing went wrong. */}
				<h2>Bijna klaar!</h2>
				<p className="auth-copy">We hebben een e-mail gestuurd naar {email}. Klik op de link in die
					e-mail om je account te activeren. Staat hij er niet? Kijk dan ook even in je spam-map.</p>

				<div className="auth-actions">
					<button className='big' onClick={() => { loading || requestNewCode() }}>Nieuwe code aanvragen</button>
					<LoadingIcon color="white" shown={loading} />
					<button className='big auth-secondary' onClick={() => { logOut(); navigate('/login') }}>Uitloggen</button>
				</div>
			</div>
		</Layout>
	);
}

export default EmailNotConfirmed;
