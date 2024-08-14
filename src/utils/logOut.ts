import Parse from 'parse';


const logOut = async () => {
	localStorage.setItem('isAdmin', 'false');
	return Parse.User.logOut();
}

export default logOut;