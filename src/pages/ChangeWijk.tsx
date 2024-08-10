
import Layout from '../layouts/layout';
import '../scss/ChangeWijk.scss';

function ChangeWijk() {

	const changeWijk = (wijk: string) => {
		localStorage.setItem('wijkName', wijk);
		window.location.href = '/instellingen';
	}

	return (
		<Layout title="Wijk wijzigen" noPadding="true">
			<div id="wijk-keuze">
				<div className="wijk blue" onClick={() => changeWijk('blue')}>Blauw</div>
				<div className="wijk green" onClick={() => changeWijk('green')}>Groen</div>
				<div className="wijk red" onClick={() => changeWijk('red')}>Rood</div>
				<div className="wijk yellow" onClick={() => changeWijk('yellow')}>Geel</div>
			</div>
		</Layout>
	);
}

export default ChangeWijk;