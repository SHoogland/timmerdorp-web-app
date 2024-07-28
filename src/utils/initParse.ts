import Parse from 'parse';
import handleParseException from './handleParseException';
import redirectToLogin from './redirectToLogin.ts';

const initParse = async () => {
	Parse.initialize(
		import.meta.env.VITE_APP_ID,
		import.meta.env.VITE_JS_KEY
	);
	Parse.serverURL = import.meta.env.VITE_PARSE_URL

	const currentUser = Parse.User.current();
	if (currentUser) {
		currentUser.fetch().catch(handleParseException)
	} else {
		redirectToLogin();
	}
}

export default initParse;