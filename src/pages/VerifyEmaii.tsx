
import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import LoadingIcon from '../components/LoadingIcon';
import { useNavigate } from 'react-router-dom';
import logOut from '../utils/logOut';

function VerifyEmail() {
	const [loading, setLoading] = useState(false)
	const [success, setSuccess] = useState(false)
	const navigate = useNavigate();

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		let email = urlParams.get('email');
		let code = urlParams.get('code');

		if (!email || !code) {
			alert('Er is iets misgegaan. Probeer het later opnieuw.');
			navigate('/email-niet-bevestigd');
		} else {
			try {
				email = atob(email);
				code = atob(code);
			} catch (e) {
				alert('Er is iets misgegaan. Probeer het later opnieuw.');
				navigate('/email-niet-bevestigd');
				return;
			}
			setLoading(true);
			apiCall('emailVerificationAttempt', { email, code }, true).then((result) => {
				setLoading(false);
				if (result === 'not-signed-in') {
					logOut().then(() => {
						navigate('/login');
					});
				} else if (result === 'success' || result === 'already_verified') {
					setSuccess(true);
				} else {
					alert('Er is iets misgegaan. Probeer het later opnieuw. ' + JSON.stringify(result));
					navigate('/email-niet-bevestigd');
				}
			});
		}
	}, []);

	return (
		<Layout title="Registreren <<(stap 2/3)>>" disableBackButton={true} disableLogo={true} backgroundColor='blue'>
			{!success ? <>
				<h2>E-mailadres bevestigen</h2>
				{loading && <LoadingIcon color="white" shown={loading} />}
			</> : <>
				<h2>E-mailadres bevestigd!</h2>
				<p>Je e-mailadres is bevestigd. Zodra je door Stan of Stephan als beheerder bent bevestigd, kun je gebruik maken van de app.</p>
				<button className='big' onClick={() => { navigate('/is-geen-beheerder') }}>Naar stap 3/3</button>
			</>
			}

		</Layout >
	);
}

export default VerifyEmail;
