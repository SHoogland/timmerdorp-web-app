import { useRouteError } from 'react-router-dom';
import Layout from '../layouts/layout';

export default function ErrorPage() {
    const error: any = useRouteError();
    console.error(error);

	const errorMap: { [key: string]: string } = {
		'Not Found': 'Deze pagina bestaat niet.',
	}

	const errorMessage = errorMap[error.statusText] || errorMap[error.message] || error.statusText || error.message;

    return (
        <Layout noHeader={true} backgroundColor='red'>
            <div className="auth-page error-page">
                <div className="auth-head">
                    <div className="auth-brand">Timmerdorp</div>
                </div>

                <h2>Sorry, er is iets fout gegaan.</h2>

                {errorMessage && (
                    <div className="error-detail">
                        <span className="error-detail-label">Foutmelding</span>
                        <span className="error-detail-value selectable">{errorMessage}</span>
                    </div>
                )}

                {/* Routing itself has failed here, so a react-router navigate()
                    cannot be trusted. A full page load always gets you out. */}
                <button className="big" onClick={() => { window.location.href = '/' }}>
                    Terug naar de app
                </button>
            </div>
        </Layout>
    );
}
