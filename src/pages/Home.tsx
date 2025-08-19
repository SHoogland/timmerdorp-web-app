import Parse from 'parse';
import { useEffect, useState } from 'react';
import BottomBar from '../components/BottomBar';
import { useNavigate } from 'react-router-dom';
import apiCall from '../utils/apiCall';
import logOut from '../utils/logOut';
import getCurrentWijk from '../utils/getCurrentWijk';

interface WeatherData {temp: number;
  msg: string;
  icon: string;
}

interface PageItem {
  title: string;
  component: string;
  class: string;
  icon: string;
  weather?: boolean;
  data?: boolean;
  small?: boolean;
}

function Home() {
	const [isStanOfStephan, setIsStanOfStephan] = useState(false);
	const [weather, setWeather] = useState<WeatherData | null>(null);
	const [childrenCount, setChildrenCount] = useState(0);
	const [birthdays, setBirthdays] = useState(0);
	const [wijkCount, setWijkCount] = useState(0);
	const [waitingPotentialAdmins, setWaitingPotentialAdmins] = useState(0);
	const [showWijkChoice, setShowWijkChoice] = useState(false);
	const [currentWijkChoice, setCurrentWijkChoice] = useState('');
	const [onlyChangeWijk, setOnlyChangeWijk] = useState(false);
	const [finishedWijkChoice, setFinishedWijkChoice] = useState(false);
	const [error, setError] = useState('');
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

	const wijken = {
		blue: "blauw",
		red: "rood", 
		green: "groen",
		yellow: "geel"
	};

	const pages: PageItem[] = [
		{
			title: '-',
			component: "weather",
			class: 'halfWidth homeInfoCard weather realWeather',
			icon: "partly-sunny",
			weather: true
		},
		{
			title: '-',
			component: "children",
			class: 'halfWidth homeInfoCard weather',
			icon: "query_stats",
			data: true
		},
		{
			title: 'Zoek kinderen',
			component: "search",
			class: '',
			icon: "search"
		},
		{
			title: 'Aanwezigheid',
			component: "presence",
			class: '',
			icon: "how_to_reg"
		},
		{
			title: 'Scan ticket',
			component: "scan-ticket",
			class: '',
			icon: 'qr_code_scanner'
		},
		{
			title: 'Beheer hutjes',
			component: "connect-child-to-cabin",
			class: '',
			icon: 'person_add_alt'
		},
		{
			title: 'Statistieken',
			component: "stats",
			class: 'small',
			icon: "insert_chart",
			small: true
		},
		{
			title: 'Verjaardagen',
			component: "birthdays",
			class: 'small',
			icon: "cake",
			small: true
		},
		// Hutjeskaart en Foto's en Bijlagen knop verwijderd
		{
			title: 'Instellingen',
			component: "settings",
			class: 'small',
			icon: "settings",
			small: true
		},
		{
			title: 'Log uit',
			component: "login",
			class: 'small',
			icon: "logout",
			small: true
		}
	];

	useEffect(() => {
		const email = Parse.User.current()?.get('username');
		if (email === 'stanvanbaarsen@hotmail.com' || email === 'stephan@shoogland.com') {
		 setIsStanOfStephan(true);
		}

		let wantsAdmin = false;
		if(!localStorage.getItem('isAdmin')) {
			wantsAdmin = true;
		}
		
		apiCall('checkIfLoggedIn', { wantsToBecomeAdmin: wantsAdmin }).then((response) => {
			if (!response.result) {
				logOut().then(() => {
					navigate('/login');
				});
			}
			if(!response.admin) {
				localStorage.setItem('isAdmin', 'false');
				navigate('/is-geen-beheerder');
			}
			setWaitingPotentialAdmins(response.waitingPotentialAdmins || 0);
			
			if(!response.wijk) {
				setShowWijkChoice(true);
			}
		}).catch((error) => {
			if (error.message == 'Invalid session token') {
				logOut().then(() => {
					navigate('/login');
				});
			}
		});

		// Load weather data
		loadWeatherData();
		
		// Load wijk stats
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
			// Set default weather data if API fails
			setWeather({
				temp: 20,
				msg: "Weer niet beschikbaar",
				icon: "wb_sunny"
			});
		}
	};

	const processWeatherData = (data: any) => {
		console.log('Processing weather data:', data);
		
		let weatherMessage = "Geen regen (?)";
		let totalRain = 0;
		let skipped = 0;
		let weatherIcon = "wb_sunny";
		
		// Check if we have valid data
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
		console.log('Setting weather:', { temp: temperature, msg: weatherMessage, icon: weatherIcon });
		
		setWeather({
			temp: temperature,
			msg: weatherMessage,
			icon: weatherIcon
		});
	};

	const loadWijkStats = async () => {
		try {
			console.log('Loading wijk stats...');
			const result = await apiCall('wijkStats');
			console.log('Wijk stats result:', result);
			
			if (result && result.response === 'success') {
				let dag = ['di', 'wo', 'do', 'vr'][new Date().getDay() - 2];
				console.log('Current day:', dag, 'Current wijk:', wijk);
				
				const currentWijk = wijk === 'white' ? 'blue' : wijk;
				const wijkCountValue = result.quarters?.[currentWijk]?.['aanwezig_' + dag] || 0;
				const childrenCountValue = result['aanwezig_' + dag] || 0;
				const birthdaysValue = (result.birthdays?.[dag] || {}).count || 0;
				
				console.log('Setting stats:', { wijkCount: wijkCountValue, childrenCount: childrenCountValue, birthdays: birthdaysValue });
				
				setWijkCount(wijkCountValue);
				setChildrenCount(childrenCountValue);
				setBirthdays(birthdaysValue);
			}
		} catch (error) {
			console.error('Error loading wijk stats:', error);
			// Set default values if API fails
			setWijkCount(0);
			setChildrenCount(0);
			setBirthdays(0);
		}
	};

	const openPage = (page: PageItem) => {
		if (page.component === 'weather') {
			window.open("https://buienradar.nl/weer/heiloo/nl/2754516", "_blank");
		} else if (page.component === 'login') {
			logOut().then(() => {
				navigate('/login');
			});
		} else {
			// Map component names to routes
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
		}
	};

	const wijkChoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setCurrentWijkChoice(e.target.value);
	};

	const saveWijkChoice = async () => {
		try {
			await apiCall('setAdminWijk', { wijk: currentWijkChoice });
			localStorage.setItem('wijk', currentWijkChoice);
			
			// if (onlyChangeWijk) {
			// 	// Navigate back if this was just a wijk change
			// 	navigate(-1);
			// } else {
		       setWijk(currentWijkChoice); // update wijkkleur direct
		       setFinishedWijkChoice(true);
		       setTimeout(() => {
			       setShowWijkChoice(false);
		       }, 500);
			// }
		} catch (error) {
			console.error('Error saving wijk choice:', error);
		}
	};

	const logOutFunction = async () => {
		await logOut().catch(
			error => {
				alert('Probleem tijdens uitloggen: ' + error);
			}
		);
		navigate('/login');
	};

       // Import BottomBar
       // ...existing code...
       // Herstel originele rendering van weer-widget en statistiekenblok
       const mainButtons = pages.filter(p => !p.small && !p.weather && !p.data);
       const menuButtons = pages.filter(p => p.small);
       const bottomBarButtons = menuButtons.map(page => ({
	       icon: page.icon,
	       onClick: () => openPage(page)
       }));

       // Vind weather en data knoppen
       const weatherPage = pages.find(p => p.weather);
       const dataPage = pages.find(p => p.data);

	   return (
	   <div className={`${wijk} homeContent`}>
		   <header className="home-header">
			       <div id="overlay">
				       <div id="titleContainer">
						   <h1 id="ptitle" className="home-header">
						       Timmerdorp <br/>{currentYear}
					       </h1>
				       </div>
			       </div>
		       </header>

		       <div id="homeBtnContainer">
			       <div id="homeButtons">
				       {/* Weer-widget */}
			       {weatherPage && (
				       <button
					       className={`halfWidth homeInfoCard weather realWeather alternate ${wijk}`}
					       onClick={() => openPage(weatherPage)}
				       >
						       <div className="homeBtnD">
							       <i className="material-icons">{weather && weather.icon ? weather.icon : weatherPage.icon}</i>
							       {weather && (
								       <>
									       <h2>Het is {weather.temp}°C</h2>
									       <div className="weatherMsg">
										       <p>{weather.msg}</p>
									       </div>
								       </>
							       )}
						       </div>
					       </button>
				       )}
				       {/* Statistiekenblok */}
			       {dataPage && (
				       <button
					       className={`halfWidth homeInfoCard weather alternate ${wijk}`}
					       onClick={() => openPage(dataPage)}
				       >
						       <div className="homeBtnD">
							       <i className="material-icons data">{dataPage.icon}</i>
							       <div id="data">
								       <div className="weatherMsg" style={{top: '3px', fontSize: '80%'}}>
									       <p>{childrenCount} kind{childrenCount !== 1 ? "eren" : ""} hier</p>
								       </div>
								       <div className="weatherMsg" style={{top: '22px', fontSize: '80%'}}>
									       <p>{wijkCount} in wijk {wijken[wijk as keyof typeof wijken]}</p>
								       </div>
								       <div className="weatherMsg" style={{top: '41px', fontSize: '80%'}}>
									       <p>{birthdays} {birthdays === 1 ? "jarige" : "jarigen"} vandaag</p>
								       </div>
							       </div>
						       </div>
					       </button>
				       )}
				       {/* Vier grote knoppen */}
			       {mainButtons.map((page, index) => (
				       <button
					       key={index}
					       onClick={() => openPage(page)}
					       className={`homeBtn alternate ${wijk}`}
				       >
						       <div className="homeBtnD">
							       <i className={`material-icons`}>{page.icon}</i>
							       <span>{page.title}</span>
						       </div>
					       </button>
				       ))}
			       </div>
		       </div>

		       {/* BottomBar onderaan */}
		       <div id="bottomBarContainer">
			       <BottomBar buttons={bottomBarButtons} wijk={wijk} />
		       </div>

		       {/* <span>{error}</span> */}

		       {showWijkChoice && (
			       <div id="wijkChoice" className={`${currentWijkChoice} ${finishedWijkChoice ? ' fadedOut' : ''}`}>
				       <h1>Wijk-keuze</h1>
				       {/* <p>{!onlyChangeWijk ? 'Het allerlaatste wat je moet doen voor je de app kunt gebruiken, is hieronder selecteren bij welke wijk je hoort:' : ''}</p> */}
				       <div className="wijk-select-container">
					       <select 
						       value={currentWijkChoice} 
						       onChange={wijkChoiceChange}
						       className="wijk-select"
						       aria-label="Kies je wijk"
					       >
						       <option value="">Kies je wijk</option>
						       <option value="blue">Blauw</option>
						       <option value="yellow">Geel</option>
						       <option value="red">Rood</option>
						       <option value="green">Groen</option>
						       <option value="white">Wit/EHBO</option>
					       </select>
				       </div>
				       <br/>
				       {currentWijkChoice && (
					       <button 
						       onClick={saveWijkChoice} 
						       className="modern wijk-save-btn"
					       >
						       Opslaan
					       </button>
				       )}
			       </div>
		       )}
	       </div>
       );
}

export default Home;
