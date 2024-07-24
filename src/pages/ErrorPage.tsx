import { useRouteError } from 'react-router-dom';

export default function ErrorPage() {
    const error: any = useRouteError();
    console.error(error);

    return (
        <div id="error-page">
            <h1>Oeps!</h1>
            <p>Sorry, er is iets fout gegaan.</p>
            <p>
                <i>{error.statusText || error.message}</i>
            </p>
        </div>
    );
}