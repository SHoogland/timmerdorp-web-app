const prependZero = (n: number): string => (n < 10 ? '0' : '') + n;

const generateGebeurtenisDescription = (h: Parse.Object, withChildName: boolean): JSX.Element => {
	const d = h.get('datetime') as Date;
	const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
	const dateString = `${dayNames[d.getDay()]} om ${prependZero(d.getHours())}:${prependZero(d.getMinutes())}`;

	const admin = h.get('adminName') as string;

	const eventType = h.get('eventType') as string;
	let result: JSX.Element | null = null;

	switch (eventType) {
		case 'marked-absent':
			result = (
				<>
					<u>Afwezig</u> gemeld door {admin} met als reden: <i>{h.get('reason')}</i>.
				</>
			);
			break;
		case 'marked-present':
			result = (
				<>
					Aanwezig gemeld door {admin}.
				</>
			);
			break;
		case 'collected-sole':
			result = (
				<>
					Veiligheidszooltjes gemarkeerd als opgehaald door {admin}.
				</>
			);
			break;
		case 'set-hutnr':
			if (!h.get('old')) {
				result = (
					<>
						Toegevoegd aan hutje met nummer <u>{h.get('new')}</u> door {admin}.
					</>
				);
			} else if (!h.get('new')) {
				result = (
					<>
						Verwijderd uit hutje <u>{h.get('old')}</u> door {admin}.
					</>
				);
			} else {
				result = (
					<>
						Overgeplaatst van hutje <u>{h.get('old')}</u> naar hutje <u>{h.get('new')}</u> door {admin}.
					</>
				);
			}
			break;
		case 'gave-wristband':
			if (!h.get('old')) {
				result = (
					<>
						Polsbandje gegeven met nummer <u>{h.get('new')}</u> door {admin}.
					</>
				);
			} else {
				result = (
					<>
						Nieuw polsbandje gegeven met nummer <u>{h.get('new')}</u> (eerst: {h.get('old')}) door {admin}.
					</>
				);
			}
			break;
		case 'save-hut-location':
			result = (
				<>
					Hut-locatie van hutje {h.get('new')} {h.get('old') === '0' ? 'ingesteld' : <u>gewijzigd</u>} door {admin}.
				</>
			);
			break;
		default:
			result = null; // Handle unknown event types
			break;
	}

	const dateSpan = <b>{dateString}:</b>;

	if (withChildName && h.get('ticket')) {
		const ticket = h.get('ticket');
		const childInfo = `${ticket.get('firstName')} ${ticket.get('lastName')} (bandje ${ticket.get('wristband')}) `;
		return (
			<span>
				{dateSpan} {childInfo}
				{result}
			</span>
		);
	} else {
		return (
			<span>
				{dateSpan} {result}
			</span>
		);
	}
};

export default generateGebeurtenisDescription;