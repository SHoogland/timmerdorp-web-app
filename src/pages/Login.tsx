import Parse from 'parse';

import ding from '../assets/ding.svg'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate();

  const login = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await Parse.User.logIn(email, password)
      .catch(error => {
        console.error('Error while logging in user', error);
      })
      .then(function (user) {
        navigate('/home');
        console.log('User logged in', user);
      })
  }

  return (
    <>
      <div>
        <h1>Login</h1>
        <img src={ding} />
        <form onSubmit={login}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
          />
          <button type="submit">Login</button>
        </form>
      </div>
    </>
  )
}

export default Login
