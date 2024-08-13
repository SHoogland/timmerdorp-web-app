import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiCall from '../utils/apiCall';
import { FaShareAlt, FaSearch, FaBirthdayCake } from 'react-icons/fa';
import Layout from '../layouts/layout';

const Birthdays: React.FC = () => {
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<boolean>(false);
	const [data, setData] = useState<any>(null);
	const [days] = useState<string[]>(['di', 'wo', 'do', 'vr']);
	const [dates] = useState<string[]>(['Dinsdag 27 augustus', 'Woensdag 28 augustus', 'Donderdag 29 augustus', 'Vrijdag 30 augustus']);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const result = await apiCall('wijkStats');
				if (result && result.response === 'success') {
					setData(result.birthdays);
				} else {
					if (result.response === 'unauthorized') {
						// one of two reasons: either the user is not logged in, or the user is not an admin
						// at /is-geen-beheerder both cases are handled
						navigate('/is-geen-beheerder');
						return;
					}
					setError(true);
				}
			} catch (err) {
				setError(true);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const shareDate = (d: string) => {
		const bdays = data[d].kids;
		const getWijk = (hutNr: string) => ['geel', 'rood', 'blauw', 'groen', 'onbekend'][parseInt(hutNr[0] || '4')];
		const getBdayMsg = (bday: any) => `${bday.name} ${bday.hutNr ? 'uit hutje ' + bday.hutNr + ' (wijk ' + getWijk(bday.hutNr) + ')' : '(onbekend hutje/wijk)'} wordt ${bday.newAge}!`;
		const msg = `Vandaag ${bdays.length > 1 ? 'zijn' : 'is'} er op Timmerdorp ${bdays.length} verjaardag${bdays.length > 1 ? 'en!\n -' : '!'} ${bdays.map(getBdayMsg).join('\n - ')}`;

		if (navigator.share) {
			navigator.share({
				title: 'Verjaardagen op Timmerdorp',
				text: msg,
				url: window.location.href
			});
		} else {
			alert(msg);
		}
	};

	const zoekKind = (kind: any) => {
		navigate(`/zoek?q=${kind.name}`);
	};

	if (loading) {
		return <div>Laden...</div>;
	}

	if (error) {
		return <div>Er is iets fout gegaan...</div>;
	}

	return (
		<>
			<Layout title="Verjaardagen">
				{days.map((d, i) => (
					<div key={d} id={d} className='peopleList'>
						<div className='list-header' style={{ paddingLeft: '0px', position: 'relative' }}>
							{dates[i]} ({data[d].count})
							{data[d].kids.length > 0 && (
								<FaShareAlt
									onClick={() => shareDate(d)}
									style={{ position: 'absolute', right: '8px', top: '12px', cursor: 'pointer' }}
								/>
							)}
						</div>
						{data[d].kids.length === 0 ? (
							<div><b>Geen kinderen jarig</b></div>
						) : (
							data[d].kids.map((bday: any, idx: number) => (
								<div key={idx} className={`childItem ${bday.hutNr}`} onClick={() => zoekKind(bday)}>
									<table style={{ width: "100%" }}>
										<tbody>
											<tr>
												<td style={{ width: '48px' }}>
													<FaBirthdayCake style={{ fontSize: '32px', position: 'relative', left: '2px' }} />
												</td>
												<td style={{ paddingLeft: '0px' }}>
													<h2 style={{marginBottom: '0px'}}>
														<b>{bday.name}</b>
														<br />
													</h2>
													<p style={{ fontSize: '14px', marginBottom: '4px', marginTop: '0px' }}>
														Wordt {bday.newAge}!
													</p>
													<p style={{ fontSize: '14px', marginBottom: '0px', marginTop: '0px' }}>
														Hutje: {bday.hutNr}
													</p>
												</td>
												<td style={{ width: "48px" }}>
													<button className='fab'>
														<FaSearch />
													</button>
												</td>
											</tr>
										</tbody>
									</table>
								</div>
							))
						)}
						<hr />
					</div>
				))}
			</Layout>
		</>
	);
};

export default Birthdays;