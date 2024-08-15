
import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import LoadingIcon from '../components/LoadingIcon';
import generateGebeurtenisDescription from '../utils/generateGebeurtenisDescription';


interface Ticket {
	[key: string]: any;
}


function HutjesManagement() {
	const [hutNummer, setHutNummer] = useState('');
	const [kidsInHut, setKidsInHut] = useState<Ticket[]>([]);
	const [loading, setLoading] = useState(false);
	const [hasSearchedForHut, setHasSearchedForHut] = useState(false);
	const [errorTitle, setErrorTitle] = useState('');
	const [errorHelpText, setErrorHelpText] = useState('');
	const [lastSearchedHut, setLastSearchedHut] = useState('');
	const [showAddChildModal, setShowAddChildModal] = useState(false);
	const [wristbandSearchIsLoading, setWristbandSearchIsLoading] = useState(false);
	const [addChildToHutIsLoading, setAddChildToHutIsLoading] = useState(false);
	const [hasFoundChildToAdd, setHasFoundChildToAdd] = useState(false);
	const [foundChildToAdd, setFoundChildToAdd] = useState<Ticket>({});
	const [hutHistory, setHutHistory] = useState<Parse.Object[]>([]);


	const search = async () => {
		setKidsInHut([]);
		setErrorTitle('');
		setErrorHelpText('');
		if (hutNummer.length < 3) {
			return;
		}
		setLoading(true);

		try {
			const result = await apiCall('searchHut', { hutNr: hutNummer });
			setLoading(false);

			if (!result || result.response !== 'success') {
				setErrorTitle(result.errorTitle || result.response);
				setErrorHelpText(result.errorTitleMessage || result.response);
				return;
			}

			setHasSearchedForHut(true);
			setLastSearchedHut(hutNummer);
			setHutHistory(result.history);
			setKidsInHut(result.tickets.sort((a: Ticket, b: Ticket) => a.firstName.localeCompare(b.firstName)));
		} catch (e) {
			setLoading(false);
			setErrorTitle(String(e));
		}
	}


	useEffect(() => {
		if (hasSearchedForHut && hutNummer === lastSearchedHut) return;

		if (hutNummer.length < 3) {
			setKidsInHut([]);
			return;
		}
		setLoading(true);

		const timer = setTimeout(() => {
			search();
		}, 500);

		return () => clearTimeout(timer);
	}, [hutNummer]);

	const changeHutNummer = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newhutNummer = e.target.value;
		setHutNummer(newhutNummer);
		setHasSearchedForHut(false);
		setLastSearchedHut('');
	};

	const removeKidFromHut = (kid: Ticket) => {
		if (confirm(`Weet je zeker dat je ${kid.firstName} ${kid.lastName} uit hut ${hutNummer} wilt verwijderen?`)) {
			setLoading(true);
			apiCall('setHutNr', { id: kid.id, hutNr: null, removeFromHut: true }).then((result) => {
				setLoading(false);
				if (!result || result.response !== 'success') {
					alert('daar ging iets goed mis... het kind is waarschijnlijk niet uit het hutje verwijderd')
				} else {
					setKidsInHut(kidsInHut.filter((k) => k.id !== kid.id));
				}
			});
		}
	};


	const wristbandInputChange = (e: any) => {
		const wb = e.target.value;
		setHasFoundChildToAdd(false);
		if (wb.length == 3) {
			setWristbandSearchIsLoading(true);
			apiCall('search', { searchTerm: wb }).then((result) => {
				setWristbandSearchIsLoading(false);
				if (result.response === 'success') {
					const tickets = result.tickets;
					const foundTicket = tickets.find((ticket: Ticket) => ticket.wristband == wb);
					if (!foundTicket) {
						alert('Kind niet gevonden');
						return;
					}
					setHasFoundChildToAdd(true);
					setFoundChildToAdd(foundTicket);
				} else {
					setHasFoundChildToAdd(false);
				}
			});
		}
	}

	const addChildToHut = () => {
		setAddChildToHutIsLoading(true);
		apiCall('setHutNr', { id: foundChildToAdd.id, hutNr: hutNummer }).then((result) => {
			setAddChildToHutIsLoading(false);
			if (!result || result.response !== 'success') {
				alert('daar ging iets goed mis... het hutje is waarschijnlijk niet opgeslagen')
			} else {
				(document.getElementById('wristbandInput') as HTMLInputElement).value = '';
				setShowAddChildModal(false);
				setHasFoundChildToAdd(false);
				setFoundChildToAdd({});
				setKidsInHut([...kidsInHut, foundChildToAdd]);
			}
		});
	};

	return (
		<Layout title='Hutjes beheren'>
			<center>
				<h2>Hutnummer: </h2>
				<input
					type="number"
					title="Hutnummer"
					maxLength={3}
					onChange={changeHutNummer}
					value={hutNummer}
					placeholder="000"
					className="wristband-number"
				/>
				<br />
				<LoadingIcon shown={loading} />
			</center>

			{kidsInHut.length > 0 && (
				<div id="results">
					<h3>Kinderen in hut {hutNummer}</h3>
					<ul>
						{kidsInHut.map((kid) => (
							<li
								key={kid.id}
								onClick={() => removeKidFromHut(kid)}
								style={{ borderBottom: '1px solid #ccc', width: '100%', textAlign: 'left', color: 'blue' }}
							>
								{kid.firstName + ' ' + kid.lastName}
								&nbsp;
							</li>
						))}
					</ul>
				</div>
			)}

			{kidsInHut.length === 0 && hasSearchedForHut && !errorTitle && (
				<div>
					<b>Nog geen kinderen in hutje.</b>
				</div>
			)}

			{hasSearchedForHut && <>
				<button
					onClick={() => setShowAddChildModal(true)}
					type="button"
					className={"big"}
				>
					Kind toevoegen aan hutje
				</button>
				<h2>Hut-geschiedenis</h2>
				{hutHistory.length == 0 && <p>Er zijn nog geen kinderen toegevoegd/verwijderd uit deze hut.</p>}
				{hutHistory.length > 0 && <ul>
					{hutHistory.map((historyItem, index) => (
						<li key={index}>
							{generateGebeurtenisDescription(historyItem, true)}
						</li>
					))
					}
				</ul>}
			</>}



			{errorTitle && (
				<div>
					<b>{errorTitle}</b>
					<br />
					{errorHelpText}
				</div>
			)}

			<br />

			{showAddChildModal && (
				<div>
					<center>
						<h2>Kind toevoegen aan hutje {hutNummer}</h2>
						<h4>Polsbandnummer:</h4>
						<input
							type="number"
							maxLength={3}
							title="Polsbandnummer"
							id="wristbandInput"
							onChange={(e) => wristbandInputChange(e)}
							placeholder="000"
							style={{ "display": "inline-block", "right": "24px" }}
							className="wristband-number"
						/>
						<button
							onClick={addChildToHut}
							style={{ "display": "inline-block" }}
							className={"big" + (addChildToHutIsLoading ? " with-loading-icon" : "")}
						>
							<LoadingIcon color="white" shown={addChildToHutIsLoading} />
							{!addChildToHutIsLoading && "Toevoegen"}
						</button>
						<br />
						<LoadingIcon shown={wristbandSearchIsLoading} />
						{!wristbandSearchIsLoading && hasFoundChildToAdd && <>
							<b>Gevonden kind:</b> {foundChildToAdd.firstName} {foundChildToAdd.lastName}
						</>
						}
					</center>
				</div>
			)}
		</Layout>
	);
}

export default HutjesManagement;
