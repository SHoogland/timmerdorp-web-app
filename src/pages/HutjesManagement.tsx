import Parse from 'parse';


import Layout from '../layouts/layout';
import { useNavigate } from 'react-router-dom';
import checkIfStillLoggedIn from '../utils/checkIfStillLoggedIn.ts';

function HutjesManagement() {
	const navigate = useNavigate();

	checkIfStillLoggedIn().then((result) => {
		if (!result.result) {
			navigate('/login');
		}
	});

	return (
		<>
			<Layout title='Hutjes beheren'>
				content
			</Layout>
		</>
	);
}

export default HutjesManagement;
