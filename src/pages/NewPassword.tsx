
import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import LoadingIcon from '../components/LoadingIcon';

function NewPassword() {
	const [email, setEmail] = useState('')
	const [code, setCode] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [hasSaved, setHasSaved] = useState(false)

	useEffect(() => {
		document.body.classList.add('page-with-blue-background');

		const urlParams = new URLSearchParams(window.location.search);
		const email = urlParams.get('email');
		let code = urlParams.get('code');

		if (!email || !code) {
			alert('Er is iets misgegaan. Probeer het later opnieuw.');
			window.location.href = '/login';
		} else {
			setEmail(atob(email));
			setCode(atob(code));
		}

		return () => {
			document.body.classList.remove('page-with-blue-background');
		};
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
		<Layout title="Nieuw Wachtwoord" disableBackButton={true}>
			{!hasSaved &&
				<>
					<div className="form">
						<p>Op deze pagina kan je een nieuw wachtwoord instellen voor het account met e-mailadres { email }.</p>

						<div
							style={{ display: 'none' }}
						>
							{/* Verborgen e-mail input voor toegankelijkheid, per deze standaard:
							https://www.chromium.org/developers/design-documents/create-amazing-password-forms */}
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

						<LoadingIcon shown={loading}/>
					</div>
				</>
			}

			{hasSaved && <p>Nieuw wachtwoord opgeslagen! Ga naar de <a href="/login">Inlogpagina</a> om in te loggen met je nieuwe wachtwoord.</p>}

		</Layout>
	);
}

export default NewPassword;
