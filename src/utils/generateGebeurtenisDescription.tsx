import parse from 'html-react-parser';
const prependZero = (n: number): string => (n < 10 ? '0' : '') + n;

const generateGebeurtenisDescription = (h: Parse.Object, withChildName: boolean, ticketPropertiesMap?: any): JSX.Element => {
	const d = h.get('datetime') as Date;
	// convert back to GMT+0
	d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
	const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
	const dateString = `${dayNames[d.getDay()]} om ${prependZero(d.getHours())}:${prependZero(d.getMinutes())}`;

	const admin = h.get('adminName') as string;

	const eventType = h.get('eventType') as string;
	let result = ''

	if (eventType == 'marked-absent') {
		result = `<u>Afwezig</u> gemeld door ${admin} met als reden: <i>${h.get('reason')}</i>.`
	}
	if (eventType == 'marked-present') {
		result = `Aanwezig gemeld door ${admin}.`
	}
	if (eventType == 'collected-sole') {
		result = `Veiligheidszooltjes gemarkeerd als opgehaald door ${admin}.`
	}
	if (eventType == 'set-hutnr') {
		if (!h.get('old')) {
			result = `Toegevoegd aan hutje met nummer <u>${h.get('new')}</u> door ${admin}.`
		} else if (!h.get('new')) {
			result = `Verwijderd uit hutje <u>${h.get('old')}</u> door ${admin}.`
		} else {
			result = `Overgeplaatst van hutje <u>${h.get('old')}</u> naar hutje <u>${h.get('new')}</u> door ${admin}.`
		}
	}
	if (eventType == 'gave-wristband') {
		if (!h.get('old')) {
			result = `Polsbandje gegeven met nummer <u>${h.get('new')}</u> door ${admin}.`
		} else {
			result = `Nieuw polsbandje gegeven met nummer <u>${h.get('new')}</u> (eerst: ${h.get('old')}) door ${admin}.`
		}
	}

	if (eventType == 'save-hut-location') {
		if (h.get('old') == '0') {
			result = `Hut-locatie van hutje ${h.get('new')} ingesteld door ${admin}`
		} else {
			result = `Hut-locatie van hutje ${h.get('new')} <u>gewijzigd</u> door ${admin}`
		}
	}

	if (eventType == 'ticket-edit') {
		const prop = h.get('old').split('-')[0];
		const propLabel = ((ticketPropertiesMap||{})[prop] || {}).label || prop;
		const oldV = h.get('old').substring(prop.length + 1);
		const newV = h.get('new').substring(prop.length + 1);

		result = `<i>${propLabel}</i> gewijzigd van <u>${oldV}</u> naar <u>${newV}</u> door ${admin} ${h.get('reason') ? 'met als reden: <i>' + h.get('reason') + '</i>' : ''}.`
	}



	if (withChildName && h.get('ticket')) {
		result = h.get('ticket').get('firstName') + ' ' + h.get('ticket').get('lastName') + ' (bandje ' + h.get('ticket').get('wristband') + ') ' + result.substring(0, 1).toLowerCase() + result.substring(1).replace('Afwezig', 'afwezig')
		result = `<span><b> ${dateString}:</b> ${result} </span>`
	} else {
		result = `<span><b>${dateString}:</b> ${result}</span>`
	}

	return <>
		{parse(result)}
	</>;
};

export default generateGebeurtenisDescription;