import Parse from 'parse';
import handleParseException from './handleParseException';
import redirectToLogin from './redirectToLogin.ts';

const initParse = async () => {
	Parse.initialize(
		'myAppId',
		'jsKey'
	);
	Parse.serverURL = 'http://localhost:1337/1'

	const currentUser = Parse.User.current();
	if (currentUser) {
		currentUser.fetch().catch(handleParseException)
	} else {
		redirectToLogin();
	}
}

export default initParse;