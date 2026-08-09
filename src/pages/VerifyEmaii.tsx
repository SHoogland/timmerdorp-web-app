
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
					setTimeout(() => {
						navigate('/is-geen-beheerder');
					}, 5000);
				} else {
					alert('Er is iets misgegaan. Probeer het later opnieuw. ' + JSON.stringify(result));
					navigate('/email-niet-bevestigd');
				}
			});
		}
	}, []);

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

				{!success ? <>
					<h2>E-mailadres bevestigen</h2>
					{loading && <LoadingIcon color="white" shown={loading} />}
				</> : <>
					<h2>E-mailadres bevestigd!</h2>
					<p className="auth-copy">Je e-mailadres is bevestigd. Zodra je door Stan of Stephan als beheerder bent bevestigd, kun je gebruik maken van de app. Je wordt automatisch doorgestuurd over 5 seconden.</p>
					<button className='big' onClick={() => { navigate('/is-geen-beheerder') }}>Naar stap 3/3</button>
				</>
				}
			</div>
		</Layout >
	);
}

export default VerifyEmail;
