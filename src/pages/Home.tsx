import { useState } from 'react'
import Parse from 'parse';

import ding from '../assets/ding.svg'
import QrCode from '../components/QrCode.tsx';

function Home() {
  const [count, setQr] = useState("")
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

  const qrCodeFound = async (decodedText: string) => {
    setQr(decodedText)
    setScanning(false)

    await Parse.User.logIn('stephan@shoogland.com', 'dingen').catch(
      error => {
        console.error('Error while logging in user', error);
      }
    ).then(function (user) {
      console.log('User logged in', user);
    })
  }

  return (
    <>
      <div className="">
        <h1>Timmerdorp</h1>
        <img src={ding} />
        <div className="card">
          <button className="" onClick={() => startScan()}>
            qr code: {count}
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
          Text goes here
        </p>
      </div>
    </>
  )
}

export default Home
