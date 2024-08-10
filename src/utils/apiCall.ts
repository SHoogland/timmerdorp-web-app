import Parse from 'parse';


const apiCall = async (func: string, data: object = {}, notApp: boolean = false) => {
	// if notApp is true, we're not using an app-specific parse function, but a web shop/general function
	return Parse.Cloud.run((notApp ? '' : 'app-') + func, data)
}

export default apiCall;