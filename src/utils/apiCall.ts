import Parse from 'parse';

// if notApp is true, we're not using an app-specific parse function, but a web shop/general function
const apiCall = async (func: string, data: object = {}, notApp: boolean = false) => {
	return Parse.Cloud.run((notApp ? '' : 'app-') + func, data)
}

export default apiCall;