import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import QrCode from '../components/QrCode.tsx';

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
					<span onClick={() => { setScanning(false); navigate('/home')}} style={{
						position: 'fixed',
						top: 12,
						left: 18,
						fontSize: 36,
						cursor: 'pointer',
						zIndex: 3,
						color: 'white',
					}}>x</span>
					<div style={{
						position: 'fixed',
						top: 0,
						left: 0,
						width: '100%',
						height: '100%',
						background: 'black',
						display: 'flex',
						justifyContent: 'center',
						alignItems: 'center',
						zIndex: 2, 
					}}>
						<div style={{ width: '100%' }}>
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
