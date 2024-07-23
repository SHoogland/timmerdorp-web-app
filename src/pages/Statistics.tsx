import Parse from 'parse';


import Layout from '../layouts/layout';
import { useNavigate } from 'react-router-dom';
import checkIfStillLoggedIn from '../utils/checkIfStillLoggedIn.ts';

function Statistics() {
  const navigate = useNavigate();

  checkIfStillLoggedIn().then((result) => {
    if (!result.result) {
      navigate('/login');
    }
  });

  return (
	<>
		<Layout title="Statistieken">
			
		</Layout>
	</>
  );
}

export default Statistics;
