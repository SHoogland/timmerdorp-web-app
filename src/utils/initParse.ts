import Parse from 'parse';
import handleParseException from './handleParseException';
import redirectToLogin from './redirectToLogin.ts';

const initParse = async () => {
    Parse.initialize(
        "knDC2JAquVJZ1jSPwARj53IhQCfpOPIDNKcgRMsD",
        "xnFIbFCrE1vjzWbRVehMO4QzPpNMCIdDgORKNlRI"
    );
    Parse.serverURL = 'https://api.timmerdorp.com/1'

    const currentUser = Parse.User.current();
    if (currentUser) {
        currentUser.fetch().catch(handleParseException)
    } else {
        redirectToLogin();
    }
}

export default initParse;