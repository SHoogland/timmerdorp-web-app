import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';

function ForgotPassword() {
	const [email, setEmail] = useState('')
	const [loading, setLoading] = useState(false)
	const [hasRequested, setHasRequested] = useState(false)

	useEffect(() => {
		document.body.classList.add('page-with-blue-background');

		return () => {
			document.body.classList.remove('page-with-blue-background');
		};
	}, []);

	const forgotPassword = async () => {
		setLoading(true);
		const response = await apiCall('forgotPassword', {
			email,
			domain: 'https://app.timmerdorp.com'
		}, true)
		setLoading(false);
		if (response == 'success') {
			setHasRequested(true);
		} else if (response.error && response.error == "no user found") {
			alert("Gebruiker niet gevonden.")
		} else {
			alert('Er is iets misgegaan. Probeer het later opnieuw. ' + JSON.stringify(response));
		}
	}


	return (
		<Layout title="Wachtwoord Vergeten" disableBackButton={true}>
			{!hasRequested &&
				<>
					<div className="form">
						<p>Voer je e-mailadres in en we sturen je een e-mail met instructies om je wachtwoord te resetten.</p>
						<input
							name="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							onKeyUp={(e) => e.key == 'Enter' ? forgotPassword() : null}
							type="email"
							placeholder="E-mailadres"
						/>
						<button className='big' onClick={() => forgotPassword()}>Nieuw wachtwoord opvragen</button>

						{loading && <p className='loading'>Laden...</p>}
					</div>
				</>
			}

			{hasRequested && <p>Nieuw wachtwoord opgevraagd! Controleer je inbox en spam-map voor instructies om je nieuwe wachtwoord in te stellen.</p>}

		</Layout>
	);
}

export default ForgotPassword;
