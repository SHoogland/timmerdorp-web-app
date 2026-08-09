import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import QrCode from '../components/QrCode.tsx';
import '../scss/Settings.scss';

function ScanTicket() {
	const [scanning, setScanning] = useState(true);
	const navigate = useNavigate();

	const qrCodeError = (error: object) => {
		console.error('Error scanning QR code', error);
	};

	const qrCodeFound = async (decodedText: string) => {
		setScanning(false);
		navigate('/polsbandje?ticket-id=' + decodedText);
	};

	return (
		<>
			{scanning ?
				<>
					<button
						type="button"
						className="scanner-close"
						aria-label="Sluiten"
						onClick={() => { setScanning(false); navigate('/') }}
					>
						<FaTimes />
					</button>
					<div className="scanner-page">
						<div className="scanner-stage">
							<QrCode
								fps={2}
								qrbox={{ width: 250, height: 250 }}
								qrCodeSuccessCallback={qrCodeFound}
								qrCodeErrorCallback={qrCodeError}
							/>
						</div>
					</div>
				</>
				: ''}
		</>
	);
}

export default ScanTicket;
