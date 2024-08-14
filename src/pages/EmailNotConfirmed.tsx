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
	const [refreshInterval, setRefreshInterval] = useState(0);
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

		setRefreshInterval(+setInterval(refresh, 5000));
		refresh();

		return () => {
			clearInterval(refreshInterval);
			setRefreshInterval(0);
		};
	}, []);

	const requestNewCode = async () => {
		setLoading(true);
		await apiCall('sendEmailCode', { domain: location.hostname + (location.port ? ':' + location.port : '') }, true).catch((e) => {
			alert('Er is iets misgegaan bij het versturen van de e-mail. Probeer het later nog eens. Foutmelding: ' + JSON.stringify(e));
			setLoading(false);
		});
		setLoading(false);
		alert('Er is een nieuwe e-mail verstuurd! Check je inbox en spam-map.');
	};


	return (
		<Layout title="Registreren (stap 2/3)" disableBackButton={true} disableLogo={true} backgroundColor='blue'>
			<h2>E-mail niet bevestigd!</h2>
			<p> Om gebruik te maken van de app, moet je eerst je e-mailadres bevestigen. Je hebt een
				e-mail ontvangen op {email} met een link waarmee je dit kunt doen. Check ook je spam-map.</p>
			<br />
			<button className='big' onClick={() => { loading || requestNewCode() }}>Nieuwe code aanvragen</button>
			<br />
			{ loading && <LoadingIcon color="white" /> }
			<br />
			<button className='big' onClick={() => { logOut(); navigate('/login') }}>Uitloggen</button>
		</Layout>
	);
}

export default EmailNotConfirmed;
