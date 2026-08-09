
import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import LoadingIcon from '../components/LoadingIcon';
import { useNavigate } from 'react-router-dom';

function NewPassword() {
	const [email, setEmail] = useState('')
	const [code, setCode] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [hasSaved, setHasSaved] = useState(false)
	const navigate = useNavigate();

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const email = urlParams.get('email');
		const code = urlParams.get('code');

		if (!email || !code) {
			alert('Er is iets misgegaan. Probeer het later opnieuw.');
			navigate('/login');
		} else {
			setEmail(atob(email));
			setCode(atob(code));
		}
	}, []);

	const saveNewPassword = async () => {
		if (!password) {
			alert('Voer een wachtwoord in.');
			return;
		}

		setLoading(true);

		const response = await apiCall('changePassword', {
			resetCode: code,
			resetEmail: email,
			newPass: password,
		}, true)

		setLoading(false);
		if (response == 'success') {
			setHasSaved(true);
		} else {
			alert('Er is iets misgegaan. Probeer het later opnieuw. ' + JSON.stringify(response));
		}
	}

	return (
		<Layout noHeader={true} backgroundColor='blue'>
			<div className="auth-page">
				<div className="auth-head">
					<div className="auth-brand">Timmerdorp</div>
					<h1 className="auth-title">Nieuw Wachtwoord</h1>
				</div>

				{!hasSaved &&
					<>
						<p className="auth-copy">Op deze pagina kan je een nieuw wachtwoord instellen voor het account met e-mailadres { email }.</p>

						<div className="form">
							{/* Verborgen e-mail input voor toegankelijkheid, per deze standaard:
							https://www.chromium.org/developers/design-documents/create-amazing-password-forms */}
							<div className="hidden">
								<input
									value={email}
									autoComplete='username'
									type="email"
								/>
							</div>
							<input
								name="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								onKeyUp={(e) => e.key == 'Enter' ? saveNewPassword() : null}
								type="password"
								placeholder="Nieuw wachtwoord"
							/>
							<button className='big' onClick={() => saveNewPassword()}>Nieuw wachtwoord opslaan</button>

							<LoadingIcon color="white" shown={loading}/>
						</div>
					</>
				}

				{hasSaved && <p className="auth-copy">Nieuw wachtwoord opgeslagen! Ga naar de <a href="/login">Inlogpagina</a> om in te loggen met je nieuwe wachtwoord.</p>}
			</div>
		</Layout>
	);
}

export default NewPassword;
