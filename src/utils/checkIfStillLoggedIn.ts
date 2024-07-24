import Parse from 'parse';
import initParse from './initParse.ts'; 
import apiCall from './apiCall.ts'; 


const checkIfStillLoggedIn = async (wantsToBecomeAdmin: boolean = false) => {
	const staging = await localStorage.getItem('staging');
	if((staging == 'true' && Parse.serverURL != 'http://localhost:1337/1/') || (staging == 'false' && Parse.serverURL != 'https://api.timmerdorp.com/1')) {
		initParse();
	}

	let result;
	try {
		result = await apiCall('checkIfLoggedIn', { wantsToBecomeAdmin })
	}
	catch (e: unknown) {
		if (e instanceof Error) {
			if (e.message == 'Invalid session token') {
				result = {
					result: false
				}
			}
		}
	}

	return result
}

export default checkIfStillLoggedIn;
