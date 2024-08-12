import Parse from 'parse';
import Layout from '../layouts/layout';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../scss/Login.scss';

function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [loading, setLoading] = useState(false)
	const navigate = useNavigate();

	useEffect(() => {
		document.body.classList.add('page-with-blue-background');

		return () => {
			document.body.classList.remove('page-with-blue-background');
		};
	}, []);

	useEffect(() => {
		if (Parse.User.current()) {
			navigate('/');
		}
	}, []);

	const login = async () => {
		setLoading(true);
		await Parse.User.logIn(email, password)
			.catch(error => {
				alert('Probleem bij inloggen ' + error);
				setLoading(false);
			})
			.then(function (user) {
				if (user) {
					navigate('/');
					console.log('User logged in', user);
				} else {
					alert('Probleem bij inloggen');
				}
				setLoading(false);
			})
	}

	return (
		<Layout title='Inloggen' disableBackButton={true}>
			<div className="form">
				<input
					name="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onKeyUp={(e) => e.key == 'Enter' ? login() : null}
					type="email"
					placeholder="E-mailadres"
				/>
				<input
					name="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					onKeyUp={(e) => e.key == 'Enter' ? login() : null}
					type="password"
					placeholder="Wachtwoord"
				/>
				<button className='big' onClick={() => login()}>Inloggen</button>

				{ loading && <p className='loading'>Laden...</p> }

				<p className='helper-link'><a href="/wachtwoord-vergeten">Wachtwoord vergeten?</a></p>
			</div>
		</Layout>
	)
}

export default Login
