import { Link } from 'react-router-dom';

export default function Root() {
    return (
        <>
            <Link to={"home"}>Home</Link>
            <Link to={"scan-ticket"}>Scan Ticket</Link>
        </>
    );
}
