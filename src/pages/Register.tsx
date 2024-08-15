import Parse from 'parse';
import Layout from '../layouts/layout.tsx';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import Card from '../components/Card.tsx';
import LoadingIcon from '../components/LoadingIcon.tsx';
import '../scss/Register.scss';
import apiCall from '../utils/apiCall.ts';

function Register() {
	const [firstName, setfirstName] = useState('')
	const [lastName, setlastName] = useState('')
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

	const register = async () => {
		const emailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		if (!email || !password || !emailRegex.test(email) || email.split(' ').length > 1) {
			setErrorTitle('Registreren mislukt!');
			setErrorText('Een geldig e-mailadres en wachtwoord zijn vereist!');
			return
		}
		if (!firstName || !lastName) {
			setErrorTitle('Registreren mislukt!');
			setErrorText('Vul alsjeblieft je hele naam in');
			return
		}

		setErrorTitle('')
		setErrorText('')
		setLoading(true)
		apiCall('registreren', {
			username: email,
			password,
			email,
			firstName,
			lastName,
			domain: location.origin + (location.port ? ':' + location.port : ''),
		}, true).catch((e) => {
			setErrorTitle('Registreren mislukt!')
			if (e.message === 'Account already exists for this username.') {
				setErrorText('Er bestaat al een account met dit e-mailadres! Accounts van vorig jaar, en accounts uit de webshop, zijn nog steeds geldig. Probeer in te loggen.')
			} else {
				setErrorText('Er is iets misgegaan bij het registreren. Probeer het later nog eens. Foutmelding: ' + e.message)
			}
			setLoading(false)
		}).then(async function (result) {
			if (result === 'success') {
				await Parse.User.logIn(email.toLowerCase().replace(' ', ''), password)
				navigate('/email-niet-bevestigd')
			}
			setLoading(false)
		})
	}

	return (
		<Layout title='Registreren <<(stap 1/3)>>' disableBackButton={true} disableLogo={true} backgroundColor='blue'>
			<div className="form">
				<input
					name="firstName"
					value={firstName}
					onChange={(e) => setfirstName(e.target.value)}
					onKeyUp={(e) => e.key == 'Enter' ? register() : null}
					type="text"
					id="firstName"
					placeholder="Voornaam"
					autoComplete="given-name"
				/>
				<input
					name="lastName"
					value={lastName}
					onChange={(e) => setlastName(e.target.value)}
					onKeyUp={(e) => e.key == 'Enter' ? register() : null}
					type="text"
					id="lastName"
					placeholder="Achternaam"
					autoComplete="family-name"
				/>
				<input
					name="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onKeyUp={(e) => e.key == 'Enter' ? register() : null}
					type="email"
					placeholder="E-mailadres"
					autoComplete="email"
				/>
				<input
					name="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					onKeyUp={(e) => e.key == 'Enter' ? register() : null}
					type="password"
					placeholder="Wachtwoord"
					autoComplete="new-password"
				/>
				<button className='big' onClick={() => register()}>Registreren</button>

				<LoadingIcon color="white" shown={loading} />

				{errorText && <Card
					icon={FaExclamationTriangle}
					header={errorTitle}
					bgColor='bg-red'
				>
					<p>{errorText}</p>
				</Card>}


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
				<button onClick={() => navigate('/login')}>
					Inloggen
				</button>
			</footer>
		</Layout>
	)
}

export default Register
