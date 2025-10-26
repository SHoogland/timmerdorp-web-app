import Parse from 'parse';
import handleParseException from './handleParseException';
import redirectToLogin from './redirectToLogin.ts';
import * as Sentry from "@sentry/react";

const initParse = async () => {
	Parse.initialize(
		import.meta.env.VITE_APP_ID,
		import.meta.env.VITE_JS_KEY
	);
	Parse.serverURL = import.meta.env.VITE_PARSE_URL

	const currentUser = Parse.User.current();
	if (currentUser) {
		currentUser.fetch().catch(handleParseException)
		if (import.meta.env.VITE_SENTRY_ENABLED === 'true') {
			Sentry.setUser({
				id: currentUser.id,
				email: currentUser.get("email"),
			});
		}
	} else {
		redirectToLogin();
	}
}

export default initParse;