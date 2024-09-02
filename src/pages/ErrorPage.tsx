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
        <Layout title="Oeps!" backgroundColor='red' disableBackButton={true}>
            <p>Sorry, er is iets fout gegaan.</p>
            <p>
                <b>Foutmelding: </b><i>{errorMessage}</i>
            </p>
        </Layout>
    );
}