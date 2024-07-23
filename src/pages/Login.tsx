import Parse from 'parse';

import Layout from '../layouts/layout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import initParse from '../utils/initParse';
import checkIfStillLoggedIn from '../utils/checkIfStillLoggedIn';

function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [staging, setStaging] = useState(localStorage.getItem('staging') == 'true');
	const navigate = useNavigate();

	checkIfStillLoggedIn().then((result) => {
		if (result.result) {
			navigate('/home');
		}
	})



	const login = async () => {
		if (email == 'staging123' && password == 'staging123') {
			if (staging) {
				localStorage.setItem('staging', 'false');
				alert('Staging mode disabled');
			} else {
				localStorage.setItem('staging', 'true');
				alert('Staging mode enabled');
			}
			initParse();
			setEmail('');
			setPassword('');
			setStaging(!staging);

			return;
		}

		await Parse.User.logIn(email, password)
			.catch(error => {
				alert('Probleem bij inloggen ' + error);
			})
			.then(function (user) {
				if (user) {
					navigate('/home');
					console.log('User logged in', user);
				}
			})
	}


	return (
		<>
			<Layout title='Inloggen'>
				{staging ? <p>Staging mode enabled</p> : ''}
				<input
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onKeyUp={(e) => e.key == 'Enter' ? login() : null}
					type="email"
					placeholder="Email"
				/>
				<input
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					onKeyUp={(e) => e.key == 'Enter' ? login() : null}
					type="password"
					placeholder="Password"
				/>
				<button onClick={() => login()}>Login</button>
			</Layout>
		</>
	)
}

export default Login
