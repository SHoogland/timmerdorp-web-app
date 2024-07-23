import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiCall from '../utils/apiCall';
import { FaShareAlt, FaSearch, FaBirthdayCake } from 'react-icons/fa'; // Use the correct icon import
import Layout from '../layouts/layout';

const Birthdays: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [data, setData] = useState<any>(null);
  const [days] = useState<string[]>(['di', 'wo', 'do', 'vr']);
  const [dates] = useState<string[]>(['Dinsdag 23 augustus', 'Woensdag 24 augustus', 'Donderdag 25 augustus', 'Vrijdag 26 augustus']);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiCall('wijkStats'); // Use your apiCall utility
        if (result && result.response === 'success') {
          setData(result.birthdays);
        } else {
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
    const getBdayMsg = (bday: any) => `${bday.name} uit hutje ${bday.hutNr} (wijk ${bday.hutNr}) wordt ${bday.newAge}!`;
    const msg = `Vandaag ${bdays.length > 1 ? 'zijn' : 'is'} er op Timmerdorp ${bdays.length} verjaardag${bdays.length > 1 ? 'en!\n -' : '!'} ${bdays.map(getBdayMsg).join('\n - ')}`;
    alert(msg + '\n\nVergeten jullie niet te feliciteren?');
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
					<table>
						<tbody>
						<tr>
							<td>
							<FaBirthdayCake style={{ fontSize: '32px', position: 'relative', left: '2px' }} />
							</td>
							<td style={{ paddingLeft: '0px' }}>
							<h2>
								<b>{bday.name}</b>
								<br />
								<p style={{ fontSize: '14px', marginBottom: '4px', marginTop: '0px' }}>
								Wordt {bday.newAge}!
								</p>
								<p style={{ fontSize: '14px', marginBottom: '0px', marginTop: '0px' }}>
								Hutje: {bday.hutNr}
								</p>
							</h2>
							</td>
							<td>
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
			</div>
			))}
		</Layout>
    </>
  );
};

export default Birthdays;