import { useNavigate } from 'react-router-dom';

export default function Root() {
	const navigate = useNavigate();
	navigate('/');
	return null;
}
