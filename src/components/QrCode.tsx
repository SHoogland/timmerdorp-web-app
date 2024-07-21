import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';
import { useEffect, useState } from 'react';

interface QrCodeProps {
    fps: number;
    qrbox: { width: number, height: number };
    qrCodeSuccessCallback: (decodedText: string) => void;
    qrCodeErrorCallback?: (error: any) => void;
}

const QrCode = (props:QrCodeProps) => {
    const [loading, setLoading] = useState(true);

    let htmlScanner: Html5Qrcode | null = null;

    const render = async () => {
        console.log('starting');
        // Suceess callback is required.
        if (!(props.qrCodeSuccessCallback)) {
            throw "qrCodeSuccessCallback is required callback.";
        }
    
        if(!htmlScanner){
            htmlScanner = new Html5Qrcode("qrscanner", false)
        }
        const config = { fps: props.fps, qrbox: props.qrbox };
        setLoading(true);
        await htmlScanner.start({ facingMode: "environment" }, config, props.qrCodeSuccessCallback, props.qrCodeErrorCallback);
        setLoading(false);
    }

    const stop = async () => {
        console.log('stopping');
        if(htmlScanner?.getState() === Html5QrcodeScannerState.SCANNING) {
            await htmlScanner?.stop();
        }
    }
    
    useEffect(() => {
        render();
        // cleanup function when component will unmount
        return () => {
            stop();
        };
    }, []);

    return (
        <>
        {loading && <div>Loading...</div>}
        <div id="qrscanner" />
        </>
    );
};

export default QrCode;