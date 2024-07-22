const redirectToLogin = () => {
    window.location.href.indexOf('/login') < 0 ? window.location.href = "/login" : null;
}

export default redirectToLogin;