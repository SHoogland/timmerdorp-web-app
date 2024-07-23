import { useState } from 'react'
import Parse from 'parse';
import QrCode from '../components/QrCode.tsx';

export default function ScanTicket() {
  const [qrCode, setQrCode] = useState("")
  const [scanning, setScanning] = useState(false)

  const startScan = () => {
    if (scanning) {
      setScanning(false)
    } else {
      setScanning(true)
    }
  }

  const qrCodeError = (error: any) => {
    console.error('Error scanning QR code', error);
  }

  const qrCodeFound = async (qrCode: string) => {
    setQrCode(qrCode)
    setScanning(false)

    await Parse.Cloud.run('app-findChildById', { id: qrCode }).then(async (child) => {
      console.log('Child found:', child);
    }).catch((error) => {
      console.error('Error while finding child by id', error);
    })
  }

  return (
    <>
      <div className="">
        <h1>Scan</h1>
        <div className="">
          <button className="" onClick={() => startScan()}>
            Scan
          </button>
          <button className="" onClick={() => qrCodeFound('X3fD28GOlN')}>
            QR found
          </button>
          {scanning &&
            <QrCode
              fps={2}
              qrbox={{ width: 250, height: 250 }}
              qrCodeSuccessCallback={qrCodeFound}
              qrCodeErrorCallback={qrCodeError}
            />}
        </div>
        <p className="">
          {qrCode}
        </p>
      </div>
    </>
  )
}
