import { Error } from 'parse';

import redirectToLogin from './redirectToLogin';

const handleParseException = (error: Error) => {
    switch (error.code) {
        case Parse.Error.INVALID_SESSION_TOKEN:
            Parse.User.logOut();
            redirectToLogin();
            break;
        default:
            console.error(error);
            break;
    }

}

export default handleParseException;
