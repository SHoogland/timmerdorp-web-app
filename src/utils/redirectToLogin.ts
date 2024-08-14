
const permittedPages = ['/login', '/registreren', '/wachtwoord-vergeten', '/new-password/'];

const redirectToLogin = () => {
	!permittedPages.includes(window.location.pathname) ? window.location.href = "/login" : null;
}

export default redirectToLogin;