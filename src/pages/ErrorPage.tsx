import { useRouteError } from 'react-router-dom';
import Layout from '../layouts/layout';

export default function ErrorPage() {
    const error: any = useRouteError();
    console.error(error);

    return (
        <Layout id="error-page" title="Oeps!" backgroundColor='red' disableBackButton="true">
            <p>Sorry, er is iets fout gegaan.</p>
            <p>
                <b>Foutmelding: </b><i>{error.statusText || error.message}</i>
            </p>
        </Layout>
    );
}