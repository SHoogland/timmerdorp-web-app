import Parse from 'parse';
import initParse from './initParse.ts'; 


const apiCall = async (func: string, data: object = {}, notApp: boolean = false) => {
	// if notApp is true, we're not using an app-specific parse function, but a web shop/general function
	const staging = await localStorage.getItem('staging');
	if((staging == 'true' && Parse.serverURL != 'http://localhost:1337/1/') || (staging == 'false' && Parse.serverURL != 'https://api.timmerdorp.com/1')) {
		initParse();
	}
	return Parse.Cloud.run((notApp ? '' : 'app-') + func, data)
}

export default apiCall;