

const prependZero = function (n: number) {
	return (n < 10 ? '0' : '') + n
}

const generateGebeurtenisDescription = function (h: Parse.Object, withChildName: boolean) {
	const d = h.get('datetime');
	const dateString = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'][d.getDay()] + ' om ' + prependZero(d.getHours()) + ':' + prependZero(d.getMinutes())

	let result = ''
	const admin = h.get('adminName')

	if (h.get('eventType') == 'marked-absent') {
		result = `<u>Afwezig</u> gemeld door ${admin} met als reden: <i>${h.get('reason')}</i>.`
	}
	if (h.get('eventType') == 'marked-present') {
		result = `Aanwezig gemeld door ${admin}.`
	}
	if (h.get('eventType') == 'collected-sole') {
		result = `Veiligheidszooltjes gemarkeerd als opgehaald door ${admin}.`
	}
	if (h.get('eventType') == 'set-hutnr') {
		if (!h.get('old')) {
			result = `Toegevoegd aan hutje met nummer <u>${h.get('new')}</u> door ${admin}.`
		} else if (!h.get('new')) {
			result = `Verwijderd uit hutje <u>${h.get('old')}</u> door ${admin}.`
		} else {
			result = `Overgeplaatst van hutje <u>${h.get('old')}</u> naar hutje <u>${h.get('new')}</u> door ${admin}.`
		}
	}
	if (h.get('eventType') == 'gave-wristband') {
		if (!h.get('old')) {
			result = `Polsbandje gegeven met nummer <u>${h.get('new')}</u> door ${admin}.`
		} else {
			result = `Nieuw polsbandje gegeven met nummer <u>${h.get('new')}</u> (eerst: ${h.get('old')}) door ${admin}.`
		}
	}

	if (h.get('eventType') == 'save-hut-location') {
		if (h.get('old') == '0') {
			result = `Hut-locatie van hutje ${h.get('new')} ingesteld door ${admin}`
		} else {
			result = `Hut-locatie van hutje ${h.get('new')} <u>gewijzigd</u> door ${admin}`
		}
	}

	if (withChildName && h.get('ticket')) {
		return '<b>' + dateString + ':</b> ' + h.get('ticket').get('firstName') + ' ' + h.get('ticket').get('lastName') + ' (bandje ' + h.get('ticket').get('wristband') + ') ' + result.substring(0, 1).toLowerCase() + result.substring(1).replace('Afwezig', 'afwezig')
	} else {
		return '<b>' + dateString + ':</b> ' + result
	}
}

export default generateGebeurtenisDescription;