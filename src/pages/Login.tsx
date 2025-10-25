import Parse from 'parse';
import Layout from '../layouts/layout';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import Card from '../components/Card';
import LoadingIcon from '../components/LoadingIcon.tsx';

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
					if(location.href.includes('redirect-to')) {
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
		<Layout title='Inloggen' disableBackButton={true} disableLogo={true} backgroundColor='blue'>
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

				<LoadingIcon color="white" shown={loading}/>

				{errorText && <Card
					icon={FaExclamationTriangle}
					header={errorTitle}
					bgColor='bg-red'
				>
					<p>{errorText}</p>
				</Card>}

				<p className='helper-link'><a href="/wachtwoord-vergeten">Wachtwoord vergeten?</a></p>

				<Card
					icon={FaExclamationTriangle}
					header="Let op!"
				>
					<ul>
						<li>Accounts van vorig jaar werken ook nog steeds!</li>
						<li>Heb je al een account gemaakt in de Timmerdorp-webshop, bijvoorbeeld om kaartjes te kopen voor je kinderen? Log dan in met dat webshop-account.</li>
					</ul>
				</Card>
			</div>
			<footer className="one-button-footer">
				<button onClick={() => navigate('/registreren')}>
					Registreren
				</button>
			</footer>
		</Layout>
	)
}

export default Login
