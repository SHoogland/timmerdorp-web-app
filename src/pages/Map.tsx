
import Layout from '../layouts/layout';
import { useNavigate } from 'react-router-dom';
import checkIfStillLoggedIn from '../utils/checkIfStillLoggedIn.ts';

function Map() {
  const navigate = useNavigate();

  checkIfStillLoggedIn().then((result) => {
    if (!result.result) {
      navigate('/login');
    }
  });

  return (
	<>		<Layout title="Kaart">
			<p>placeholder</p>
		</Layout>
	</>
  );
}

export default Map;
