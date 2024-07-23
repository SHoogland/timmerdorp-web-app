import { useNavigate } from 'react-router-dom';
import checkIfStillLoggedIn from '../utils/checkIfStillLoggedIn';

export default function Root() {
	const navigate = useNavigate();
	checkIfStillLoggedIn().then((result) => {
		if (result.result) {
			navigate('/home');
		} else {
			navigate('/login');
		}
	})

	return null;
}
