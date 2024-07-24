import Layout from '../layouts/layout';
import { useNavigate } from 'react-router-dom';
import checkIfStillLoggedIn from '../utils/checkIfStillLoggedIn.ts';

function PhotosAndAttachments() {
  const navigate = useNavigate();

  checkIfStillLoggedIn().then((result) => {
    if (!result.result) {
      navigate('/login');
    }
  });

  return (
	<>		<Layout title="Foto's en bijlagen">
			<p>placeholder</p>
		</Layout>
	</>
  );
}

export default PhotosAndAttachments;
