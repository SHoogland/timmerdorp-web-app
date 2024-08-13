import Parse from 'parse';

import redirectToLogin from './redirectToLogin';
import logOut from './logOut';

const handleParseException = (error: Parse.Error) => {
    switch (error.code) {
        case Parse.Error.INVALID_SESSION_TOKEN:
            logOut();
            redirectToLogin();
            break;
        default:
            console.error(error);
            break;
    }

}

export default handleParseException;
