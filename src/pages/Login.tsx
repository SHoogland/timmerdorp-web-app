import Parse from 'parse';
import Layout from '../layouts/layout';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const navigate = useNavigate();

	const login = async () => {
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
		<Layout title='Inloggen'>
			<input
				name="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				onKeyUp={(e) => e.key == 'Enter' ? login() : null}
				type="email"
				placeholder="Email"
			/>
			<input
				name="password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				onKeyUp={(e) => e.key == 'Enter' ? login() : null}
				type="password"
				placeholder="Password"
			/>
			<button onClick={() => login()}>Login</button>
		</Layout>
	)
}

export default Login
