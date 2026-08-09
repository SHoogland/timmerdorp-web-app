import { useNavigate } from 'react-router-dom';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import WijkPicker from '../components/WijkPicker';

function ChangeWijk() {
	const navigate = useNavigate();
	const currentWijk = localStorage.getItem('wijkName') || '';

	const changeWijk = async (wijk: string) => {
		// Also persist to the API. Previously this page only wrote localStorage,
		// so a wijk changed here was forgotten on another device or after a
		// logout, while the first-run picker on Home did save it properly.
		try {
			await apiCall('setAdminWijk', { wijk });
		} catch (error) {
			console.error('Error saving wijk:', error);
		}

		localStorage.setItem('wijk', wijk);
		localStorage.setItem('wijkName', wijk);

		// Dispatch custom event to notify statusbar color update
		window.dispatchEvent(new CustomEvent('wijkChanged', { detail: { wijk } }));

		navigate('/instellingen');
	}

	return (
		<Layout title="Wijk wijzigen" theme={currentWijk || undefined}>
			<div className="wijk-page">
				<WijkPicker value={currentWijk} onSelect={changeWijk} />
			</div>
		</Layout>
	);
}

export default ChangeWijk;
