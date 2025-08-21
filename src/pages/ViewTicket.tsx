import { useEffect, useState } from 'react';
import Layout from '../layouts/layout';
import apiCall from '../utils/apiCall';
import LoadingIcon from '../components/LoadingIcon';
import { useNavigate } from 'react-router-dom';
import generateGebeurtenisDescription from '../utils/generateGebeurtenisDescription';

interface Ticket {
	[key: string]: any;
}


interface TicketProperty {
	label: string;
	appLabel?: string;
}

interface TicketPropertiesMap {
	[key: string]: TicketProperty;
}

// Theme configuration based on hutNr/wijk
const getThemeColors = (hutNr: string) => {
	if (!hutNr) return { primary: '#007bff', secondary: '#6c757d', accent: '#3498db' };
	
	const firstDigit = hutNr.charAt(0);
	switch (firstDigit) {
		case '0': // Yellow theme
			return {
				primary: '#f5e31d', // Standard yellow wijk color
				secondary: '#6c757d',
				accent: '#f5e31d',
				primaryText: '#333', // Dark text for yellow
				accentText: '#333'
			};
		case '1': // Red theme
			return {
				primary: '#ee0202', // Standard red wijk color
				secondary: '#6c757d',
				accent: '#ee0202',
				primaryText: '#fff',
				accentText: '#fff'
			};
		case '2': // Blue theme
			return {
				primary: '#2196f3', // Standard blue wijk color
				secondary: '#6c757d',
				accent: '#2196f3',
				primaryText: '#fff',
				accentText: '#fff'
			};
		case '3': // Green theme
			return {
				primary: '#43a047', // Standard green wijk color
				secondary: '#6c757d',
				accent: '#43a047',
				primaryText: '#fff',
				accentText: '#fff'
			};
		default: // Default blue theme
			return {
				primary: '#2196f3', // Standard blue wijk color
				secondary: '#6c757d',
				accent: '#2196f3',
				primaryText: '#fff',
				accentText: '#fff'
			};
	}
};

function ViewTicket() {
	const [loading, setLoading] = useState(false);
	const [ticket, setTicket] = useState<Ticket>({});
	const [ticketPropertiesMap, setTicketPropertiesMap] = useState<TicketPropertiesMap>({});
	const [canEditTickets, setCanEditTickets] = useState(false);
	const [themeColors, setThemeColors] = useState(getThemeColors(''));
	const navigate = useNavigate();

	const tableCategories = [
		{
			name: 'Gegevens Kind',
			props: ['birthdate', 'wristband', 'hutNr', 'opmerkingen', 'hasSole']
		},
		{
			name: 'Gegevens huisarts',
			props: ['naam_huisarts', 'tel_huisarts']
		},
		{
			name: 'Contactgegevens ouders/verzorgers',
			props: ['tel1', 'tel2', 'parent_email']
		},
	];

	useEffect(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const ticketId = urlParams.get('ticket-id');

		if (!ticketId) {
			navigate('/zoek');
		} else {
			setLoading(true);
			apiCall('findChildById', { id: ticketId }).then((result) => {
				setLoading(false);

				if (!result || result.response !== 'success' || !result.ticket) {
					alert('Ticket niet gevonden');
					navigate('/zoek');
					return;
				}

				result.ticket.history = result.history.map((h: Parse.Object) => {
					h.set('desc', generateGebeurtenisDescription(h, false, result.ticketPropertiesMap));
					return h;
				});

				setTicket(result.ticket);
				setTicketPropertiesMap(result.ticketPropertiesMap);
				setCanEditTickets(result.canEditTickets);
				
				// Set theme colors based on hutNr
				setThemeColors(getThemeColors(result.ticket.hutNr || ''));
			});
		}
	}, []);

	const getPropTr = (prop: string) => {
		let valueTd = <td>{ticket[prop]}</td>
		// if it's a boolean, show ja or nee
		if (typeof ticket[prop] === 'boolean') {
			valueTd = <td>{ticket[prop] ? 'Ja' : 'Nee'}</td>
		} else if (!ticket[prop]) {
			valueTd = <td style={{ color: '#999', fontStyle: 'italic' }}>–</td>
		} else {
			if (prop.startsWith('tel')) {
				valueTd = <td><a href={'tel:' + ticket[prop]} style={{ color: themeColors.accent, textDecoration: 'none' }}>{ticket[prop]}</a></td>
			}
			if (prop.endsWith('email')) {
				valueTd = <td><a href={'mailto:' + ticket[prop]} style={{ color: themeColors.accent, textDecoration: 'none' }}>{ticket[prop]}</a></td>
			}
		}


		return (
			<tr key={prop} style={{ borderBottom: '1px solid #eee' }}>
				<td style={{ fontWeight: '500', padding: '12px 16px 12px 0', color: '#555' }}>{(ticketPropertiesMap[prop] || {}).appLabel || (ticketPropertiesMap[prop] || {}).label}</td>
				{valueTd}
			</tr>
		)
	}

	const goBack = () => {
		// navigate back
		window.history.back();
	}

	return (
		<Layout noHeader={true} noPadding={true}>
			<LoadingIcon shown={loading} />
			{!loading &&
				<div className="ticketCard" style={{ 
					maxWidth: '800px', 
					margin: '0 auto', 
					backgroundColor: '#fff',
					borderRadius: '12px',
					boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
					position: 'relative',
					minHeight: '100vh'
				}}>
					{/* Close button in top right corner */}
					<button 
						onClick={goBack}
						style={{
							position: 'absolute',
							top: '20px',
							right: '20px',
							background: 'none',
							border: 'none',
							fontSize: '24px',
							cursor: 'pointer',
							color: '#666',
							width: '44px',
							height: '44px',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							borderRadius: '50%',
							transition: 'all 0.2s ease',
							zIndex: 10
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = '#f0f0f0';
							e.currentTarget.style.color = '#333';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = 'none';
							e.currentTarget.style.color = '#666';
						}}
					>
						✕
					</button>
					<div style={{ padding: "40px 32px 32px 32px" }}>
						<h1 style={{ 
							margin: '0 0 24px 0', 
							color: '#2c3e50', 
							fontSize: '28px',
							fontWeight: '600',
							borderBottom: `2px solid ${themeColors.primary}`,
							paddingBottom: '12px'
						}}>
							{ticket.firstName} {ticket.lastName}
						</h1>
						
						{tableCategories.map((cat, index) => (
							<div key={cat.name} style={{ marginBottom: index < tableCategories.length - 1 ? '32px' : '24px' }}>
								<h3 style={{ 
									color: '#34495e', 
									margin: '0 0 16px 0',
									fontSize: '18px',
									fontWeight: '600'
								}}>
									{cat.name}
								</h3>
								<table style={{ 
									width: '100%', 
									borderCollapse: 'collapse',
									backgroundColor: '#f8f9fa',
									borderRadius: '8px',
									overflow: 'hidden'
								}}>
									<tbody>
										{cat.props.map((prop) => getPropTr(prop))}
									</tbody>
								</table>
							</div>
						))}
						
						<h3 style={{ 
							color: '#34495e', 
							margin: '32px 0 16px 0',
							fontSize: '18px',
							fontWeight: '600'
						}}>
							Gebeurtenissen
						</h3>
						<ul style={{ 
							margin: '0 0 24px 0', 
							paddingLeft: '20px',
							backgroundColor: '#f8f9fa',
							padding: '8px 32px',
							borderRadius: '8px'
						}}>
							{ticket.history && ticket.history.map((h: Parse.Object, index: number) => (
								<li key={index} style={{ 
									marginBottom: '8px',
									color: '#555',
									lineHeight: '1.5'
								}}>
									{h.get('desc')}
								</li>
							))}
						</ul>
					</div>
					
					<div style={{ 
						padding: '0 32px 32px 32px',
						display: 'flex',
						flexWrap: 'wrap',
						gap: '12px',
						justifyContent: 'center'
					}}>
						<button 
							onClick={goBack}
							style={{
								padding: '12px 24px',
								backgroundColor: themeColors.secondary,
								color: 'white',
								border: 'none',
								borderRadius: '6px',
								cursor: 'pointer',
								fontSize: '14px',
								fontWeight: '500',
								transition: 'all 0.2s ease'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = '#5a6268';
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = themeColors.secondary;
							}}
						>
							Sluiten
						</button>
						{canEditTickets && (
							<button 
								onClick={() => navigate('/bewerk-ticket?ticket-id=' + ticket.id)}
								style={{
									padding: '12px 24px',
									backgroundColor: themeColors.accent,
									color: themeColors.accentText,
									border: 'none',
									borderRadius: '6px',
									cursor: 'pointer',
									fontSize: '14px',
									fontWeight: '500',
									transition: 'all 0.2s ease'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = themeColors.primary;
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = themeColors.accent;
								}}
							>
								Bewerken
							</button>
						)}
						<button 
							onClick={() => navigate('/polsbandje?ticket-id=' + ticket.id + '&origin=search')}
							style={{
								padding: '12px 24px',
								backgroundColor: themeColors.primary,
								color: themeColors.primaryText,
								border: 'none',
								borderRadius: '6px',
								cursor: 'pointer',
								fontSize: '14px',
								fontWeight: '500',
								transition: 'all 0.2s ease'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = themeColors.accent;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = themeColors.primary;
							}}
						>
							Polsbandje wijzigen
						</button>
						<button 
							onClick={() => navigate('/hutje?ticket-id=' + ticket.id)}
							style={{
								padding: '12px 24px',
								backgroundColor: themeColors.primary,
								color: themeColors.primaryText,
								border: 'none',
								borderRadius: '6px',
								cursor: 'pointer',
								fontSize: '14px',
								fontWeight: '500',
								transition: 'all 0.2s ease'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = themeColors.accent;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = themeColors.primary;
							}}
						>
							Naar hutje
						</button>
						<button 
							onClick={() => navigate('/aanwezigheid?bandje=' + ticket.wristband)}
							style={{
								padding: '12px 24px',
								backgroundColor: themeColors.primary,
								color: themeColors.primaryText,
								border: 'none',
								borderRadius: '6px',
								cursor: 'pointer',
								fontSize: '14px',
								fontWeight: '500',
								transition: 'all 0.2s ease'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = themeColors.accent;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = themeColors.primary;
							}}
						>
							Naar aanwezigheid
						</button>
						<button 
							onClick={() => navigate('/')}
							style={{
								padding: '12px 24px',
								backgroundColor: themeColors.primary,
								color: themeColors.primaryText,
								border: 'none',
								borderRadius: '6px',
								cursor: 'pointer',
								fontSize: '14px',
								fontWeight: '500',
								transition: 'all 0.2s ease'
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.backgroundColor = themeColors.accent;
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.backgroundColor = themeColors.primary;
							}}
						>
							Terug naar homepagina
						</button>
					</div>
				</div>}
		</Layout >
	);
}

export default ViewTicket;
