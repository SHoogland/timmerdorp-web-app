import Parse from 'parse';
import Layout from '../layouts/layout';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import Card from '../components/Card';
import LoadingIcon from '../components/LoadingIcon.tsx';
import * as Sentry from "@sentry/react";

function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const [errorTitle, setErrorTitle] = useState('')
	const [errorText, setErrorText] = useState('')
	const navigate = useNavigate();

	useEffect(() => {
		if (Parse.User.current()) {
			navigate('/');
		}
	}, []);

	const login = async () => {
		setLoading(true);
		setErrorTitle('');
		setErrorText('');
		await Parse.User.logIn(email, password)
			.catch(error => {
				setErrorTitle('Inloggen mislukt');
				setErrorText('Controleer je e-mailadres en wachtwoord en probeer het opnieuw.');
				console.log(error);
				setLoading(false);
			})
			.then(function (user) {
				if (user) {
					if (import.meta.env.VITE_SENTRY_ENABLED === 'true') {
						Sentry.setUser({
							id: user.id,
							email: user.get("email"),
						});
					}
					if (location.href.includes('redirect-to')) {
						const redirect = location.href.split('redirect-to=')[1].split('&')[0];
						navigate(decodeURIComponent(redirect));
					} else {
						navigate('/');
					}
				} else {
					setErrorTitle('Inloggen mislukt');
					setErrorText('Controleer je e-mailadres en wachtwoord en probeer het opnieuw.');
				}
				setLoading(false);
			})
	}

	return (
		<Layout noHeader={true} backgroundColor='blue'>
			<div className="auth-page">
				<div className="auth-head">
					<div className="auth-brand">Timmerdorp App</div>
					<h1 className="auth-title">Inloggen</h1>
				</div>

				{errorText && <Card
					icon={FaExclamationTriangle}
					header={errorTitle}
					bgColor='bg-red'
				>
					<p>{errorText}</p>
				</Card>}

				<div className="form">
					<input
						name="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						onKeyUp={(e) => e.key == 'Enter' ? login() : null}
						type="email"
						placeholder="E-mailadres"
						autoComplete="email"
					/>
					<input
						name="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						onKeyUp={(e) => e.key == 'Enter' ? login() : null}
						type="password"
						placeholder="Wachtwoord"
						autoComplete="current-password"
					/>
					<button className='big' onClick={() => login()}>Inloggen</button>

					<LoadingIcon color="white" shown={loading} />

					<p className='helper-link'><a href="/wachtwoord-vergeten">Wachtwoord vergeten?</a></p>
				</div>

				{/* One line, not a slab. Registering is the rare path; making it a
				    second big button gave it equal weight to signing in. */}
				<p className="auth-alt">
					Nog geen account? <a onClick={() => navigate('/registreren')}>Registreren</a>
				</p>

				{/* Only people who cannot get in need this, so it stays folded away
				    instead of taking up a third of the first screen. */}
				<details className="auth-note">
					<summary>Lukt inloggen niet?</summary>
					<ul>
						<li>Accounts van vorig jaar werken ook nog steeds.</li>
						<li>Heb je al een account in de Timmerdorp-webshop, bijvoorbeeld om kaartjes te kopen voor je kinderen? Log dan in met dat webshop-account.</li>
					</ul>
				</details>
			</div>
		</Layout>
	)
}

export default Login
