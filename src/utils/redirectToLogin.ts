
const permittedPages = ['/login', '/registreren', '/wachtwoord-vergeten', '/new-password/'];

const redirectToLogin = () => {
	!permittedPages.includes(window.location.pathname) ? (window.location.href = "/login?redirect-to=" + window.location.pathname) : null;
}

export default redirectToLogin;