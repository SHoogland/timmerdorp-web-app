import { useEffect, useState } from 'react';
import BottomBar from '../components/BottomBar';
import Icon from '../components/Icon';
import { useNavigate } from 'react-router-dom';
import apiCall from '../utils/apiCall';
import logOut from '../utils/logOut';
import getCurrentWijk from '../utils/getCurrentWijk';
import { FaChevronRight } from 'react-icons/fa';
import WijkPicker from '../components/WijkPicker';
import '../scss/Home.scss';

interface WeatherData {
	temp: number;
	msg: string;
	icon: string;
}

interface PageItem {
	title: string;
	component: string;
	icon: string;
	small?: boolean;
}

const WIJK_LABELS: Record<string, string> = {
	blue: 'Blauw',
	red: 'Rood',
	green: 'Groen',
	yellow: 'Geel',
	white: 'Wit / EHBO',
};


function Home() {
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [childrenCount, setChildrenCount] = useState(0);
	const [birthdays, setBirthdays] = useState(0);
	const [wijkCount, setWijkCount] = useState(0);
	const [showWijkChoice, setShowWijkChoice] = useState(false);
	const [currentWijkChoice, setCurrentWijkChoice] = useState('');
	const [finishedWijkChoice, setFinishedWijkChoice] = useState(false);
	const navigate = useNavigate();

	const currentYear = new Date().getFullYear();
	const [wijk, setWijk] = useState(getCurrentWijk());

	// Update wijkkleur als localStorage wijzigt (bijvoorbeeld na wijkkeuze)
	useEffect(() => {
		const onStorage = () => {
			setWijk(getCurrentWijk());
		};
		window.addEventListener('storage', onStorage);
		return () => window.removeEventListener('storage', onStorage);
	}, []);

	// Home renders without <Layout>, so it owns its own theme class.
	useEffect(() => {
		const themeClass = `theme-${wijk}`;
		document.body.classList.add(themeClass);
		return () => document.body.classList.remove(themeClass);
	}, [wijk]);

	const pages: PageItem[] = [
		{ title: 'Zoek kinderen', component: 'search', icon: 'search' },
		{ title: 'Aanwezigheid', component: 'presence', icon: 'how_to_reg' },
		{ title: 'Scan ticket', component: 'scan-ticket', icon: 'qr_code_scanner' },
		{ title: 'Beheer hutjes', component: 'connect-child-to-cabin', icon: 'person_add_alt' },
		{ title: 'Statistieken', component: 'stats', icon: 'insert_chart', small: true },
		{ title: 'Verjaardagen', component: 'birthdays', icon: 'cake', small: true },
		{ title: 'Instellingen', component: 'settings', icon: 'settings', small: true },
		{ title: 'Log uit', component: 'login', icon: 'logout', small: true },
	];

	useEffect(() => {
		let wantsAdmin = false;
		if (!localStorage.getItem('isAdmin')) {
			wantsAdmin = true;
		}

		apiCall('checkIfLoggedIn', { wantsToBecomeAdmin: wantsAdmin }).then((response) => {
			if (!response.result) {
				logOut().then(() => {
					navigate('/login');
				});
			}
			if (!response.admin) {
				localStorage.setItem('isAdmin', 'false');
				navigate('/is-geen-beheerder');
			}

			if (!response.wijk) {
				setShowWijkChoice(true);
			}
		}).catch((error) => {
			if (error.message == 'Invalid session token') {
				logOut().then(() => {
					navigate('/login');
				});
			}
		});

		loadWeatherData();
		loadWijkStats();
	}, []);

	const loadWeatherData = async () => {
		try {
			const response = await fetch("https://api.openweathermap.org/data/2.5/forecast?q=Heiloo,NL&APPID=e98a229cdc17ffdc226168c33aefa0c1");
			if (!response.ok) {
				throw new Error(`Weather API error: ${response.status}`);
			}
			const data = await response.json();
			processWeatherData(data);
		} catch (error) {
			console.error('Error loading weather:', error);
			setWeather({
				temp: 20,
				msg: "Weer niet beschikbaar",
				icon: "wb_sunny"
			});
		}
	};

	const processWeatherData = (data: any) => {
		let weatherMessage = "Geen regen";
		let totalRain = 0;
		let skipped = 0;
		let weatherIcon = "wb_sunny";

		if (!data.list || !Array.isArray(data.list) || data.list.length === 0) {
			console.error('Invalid weather data structure');
			setWeather({
				temp: 20,
				msg: "Weer niet beschikbaar",
				icon: "wb_sunny"
			});
			return;
		}

		for (let i = 0; i < Math.min(2 + skipped, data.list.length); i++) {
			let w = data.list[i];
			if (!w || !w.dt) continue;

			let td = 1000 * w.dt - +new Date();
			if (td < 30 * 60 * 1000) {
				skipped++;
				continue;
			}
			if (!w.rain) continue;
			totalRain += w.rain["3h"] || w.rain[Object.keys(w.rain)[0]] || 0;
		}

		let rainPerHour = totalRain / 6;
		if (rainPerHour > 0) {
			if (rainPerHour > .5) {
				weatherMessage = "Veel regen!";
			} else {
				weatherMessage = "Lichte buien";
			}
			weatherIcon = "water_drop";
		}

		const temperature = Math.round(data.list[0].main.temp - 273.15);

		setWeather({
			temp: temperature,
			msg: weatherMessage,
			icon: weatherIcon
		});
	};

	const loadWijkStats = async () => {
		try {
			const result = await apiCall('wijkStats');

			if (result && result.response === 'success') {
				let dag = ['di', 'wo', 'do', 'vr'][new Date().getDay() - 2];

				// wijkStats only buckets the four hut-backed wijken; white/EHBO and
				// fuchsia are badge-only wijken with no hut range, so fall back.
				const currentWijk = (wijk === 'white' || wijk === 'fuchsia') ? 'blue' : wijk;
				setWijkCount(result.quarters?.[currentWijk]?.['aanwezig_' + dag] || 0);
				setChildrenCount(result['aanwezig_' + dag] || 0);
				setBirthdays((result.birthdays?.[dag] || {}).count || 0);
			}
		} catch (error) {
			console.error('Error loading wijk stats:', error);
			setWijkCount(0);
			setChildrenCount(0);
			setBirthdays(0);
		}
	};

	const openPage = (page: PageItem) => {
		if (page.component === 'login') {
			logOut().then(() => {
				navigate('/login');
			});
			return;
		}

		const routeMap: { [key: string]: string } = {
			'search': 'zoek',
			'presence': 'aanwezigheid',
			'scan-ticket': 'scan',
			'connect-child-to-cabin': 'hutjes',
			'stats': 'statistieken',
			'birthdays': 'verjaardagen',
			'map': 'kaart',
			'files': 'fotos',
			'settings': 'instellingen'
		};

		const route = routeMap[page.component];
		if (route) {
			navigate(route);
		}
	};

	const saveWijkChoice = async (choice: string) => {
		setCurrentWijkChoice(choice);
		try {
			await apiCall('setAdminWijk', { wijk: choice });
			localStorage.setItem('wijk', choice);
			localStorage.setItem('wijkName', choice);

			window.dispatchEvent(new CustomEvent('wijkChanged', { detail: { wijk: choice } }));

			setWijk(choice);
			setFinishedWijkChoice(true);
			setTimeout(() => {
				setShowWijkChoice(false);
			}, 400);
		} catch (error) {
			console.error('Error saving wijk choice:', error);
		}
	};

	const mainButtons = pages.filter(p => !p.small);
	const menuButtons = pages.filter(p => p.small);
	const bottomBarButtons = menuButtons.map(page => ({
		icon: page.icon,
		label: page.title,
		onClick: () => openPage(page)
	}));

	return (
		<div className={`home theme-${wijk}`}>
			<header className="home-hero">
				<h1 className="home-title">
					Timmerdorp
					<span className="home-year">{currentYear}</span>
				</h1>

			</header>

			<div className="home-info">
					<button
						className="home-info-card"
						onClick={() => window.open('https://buienradar.nl/weer/heiloo/nl/2754516', '_blank')}
					>
						<Icon name={weather?.icon || 'partly-sunny'} />
						<span className="home-info-text">
							<span className="home-info-lead">{weather ? `${weather.temp}°C` : '—'}</span>
							<span className="home-info-sub">{weather?.msg || 'Weer laden…'}</span>
						</span>
					</button>

					<button
						className="home-info-card"
						onClick={() => navigate('statistieken')}
					>
						<Icon name="insert_chart" />
						<span className="home-info-text">
							<span className="home-info-lead">{childrenCount} kinderen</span>
							<span className="home-info-sub">
								{wijkCount} in wijk {WIJK_LABELS[wijk]?.toLowerCase() || 'blauw'}, {birthdays} {birthdays === 1 ? 'jarige' : 'jarigen'}
							</span>
						</span>
					</button>
				</div>

			<div className="home-rows">
				{mainButtons.map((page) => (
					<button
						key={page.component}
						onClick={() => openPage(page)}
						className="home-row"
					>
						<Icon name={page.icon} />
						<span className="home-row-label">{page.title}</span>
						<span className="home-row-chevron">
							<FaChevronRight />
						</span>
					</button>
				))}
			</div>

			<BottomBar buttons={bottomBarButtons} wijk={wijk} />

			{showWijkChoice && (
				<div className={`wijk-choice${finishedWijkChoice ? ' fadedOut' : ''}`}>
					<h1>Bij welke wijk zit je?</h1>
					<p className="wijk-choice-sub">Je kunt dit later wijzigen bij Instellingen.</p>

					{/* Picking a wijk IS the action, so there is no separate save
					    step: the tap commits and the overlay closes. */}
					<WijkPicker value={currentWijkChoice} onSelect={saveWijkChoice} />
				</div>
			)}
		</div>
	);
}

export default Home;
