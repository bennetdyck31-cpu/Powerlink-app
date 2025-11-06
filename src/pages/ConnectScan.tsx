import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { QrCode, Wifi, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { webrtcManager } from '@/lib/webrtc'

const ConnectScan = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showScanner, setShowScanner] = useState(false)
  
  const peerIdFromUrl = searchParams.get('peer')

  useEffect(() => {
    // Automatisch verbinden wenn Peer-ID in URL und sofort zum Dashboard
    if (peerIdFromUrl && !connecting && !connected) {
      // Sofort zum Dashboard navigieren (während Verbindung im Hintergrund läuft)
      navigate('/dashboard', { replace: true })
      // Verbindung im Hintergrund herstellen
      connectToPeer(peerIdFromUrl)
    }
  }, [peerIdFromUrl, connecting, connected, navigate])

  const connectToPeer = async (peerId: string) => {
    setConnecting(true)
    setError(null)

    try {
      console.log('🔄 Verbinde zu Peer:', peerId)
      await webrtcManager.connectToHost(peerId)
      
      console.log('✅ WebRTC Manager verbunden')
      
      // Warte auf tatsächliche Peer-Verbindung
      let attempts = 0
      const maxAttempts = 20
      
      const checkConnection = () => {
        attempts++
        const devices = webrtcManager.getConnectedDevices()
        console.log(`🔍 Verbindungs-Check ${attempts}/20:`, devices)
        
        if (devices.length > 0) {
          console.log('✅ Verbindung bestätigt:', devices)
          setConnecting(false)
          setConnected(true)
          // Kein Redirect mehr - Dashboard ist bereits aktiv
        } else if (attempts < maxAttempts) {
          setTimeout(checkConnection, 500)
        } else {
          console.log('⚠️ Timeout - Verbindung dauert zu lange')
          setError('Verbindung dauert zu lange. Bitte erneut versuchen.')
          setConnecting(false)
        }
      }
      
      setTimeout(checkConnection, 1000)
      
    } catch (err: any) {
      console.error('❌ Verbindungsfehler:', err)
      setError(err.message || 'Verbindung fehlgeschlagen')
      setConnecting(false)
    }
  }

  const handleManualConnect = () => {
    const peerId = prompt('Gib die Peer-ID des Host-Geräts ein:')
    if (peerId && peerId.trim()) {
      connectToPeer(peerId.trim())
    }
  }

  const handleQRScan = () => {
    // In einer echten App würde hier die Kamera geöffnet werden
    // Für jetzt: Zeige Anleitung
    setShowScanner(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="p-8 bg-gray-800/50 backdrop-blur-sm border-gray-700">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
              {connecting ? (
                <Loader2 className="w-10 h-10 text-white animate-spin" />
              ) : connected ? (
                <CheckCircle2 className="w-10 h-10 text-white" />
              ) : error ? (
                <XCircle className="w-10 h-10 text-white" />
              ) : (
                <Wifi className="w-10 h-10 text-white" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              {connecting ? 'Verbinde...' : connected ? 'Verbunden!' : error ? 'Fehler' : 'Gerät verbinden'}
            </h1>
            
            <p className="text-gray-400">
              {connecting 
                ? 'WebRTC-Verbindung wird hergestellt...'
                : connected 
                ? 'Erfolgreich mit dem Host verbunden'
                : error
                ? error
                : 'Scanne den QR-Code vom anderen Gerät'
              }
            </p>
          </div>

          {!connecting && !connected && !error && (
            <div className="space-y-4">
              {!showScanner ? (
                <>
                  <Button
                    onClick={handleQRScan}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    size="lg"
                  >
                    <QrCode className="mr-2 h-5 w-5" />
                    QR-Code scannen
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-800 text-gray-400">oder</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleManualConnect}
                    variant="outline"
                    className="w-full"
                    size="lg"
                  >
                    Peer-ID manuell eingeben
                  </Button>
                </>
              ) : (
                <div className="bg-gray-700/50 rounded-lg p-6 text-center">
                  <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    QR-Code Scanner
                  </h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Für die Kamera-Funktion benötigen wir eine zusätzliche Library.
                    Verwende vorerst den manuellen Link oder die Peer-ID.
                  </p>
                  <div className="space-y-2">
                    <Button
                      onClick={() => setShowScanner(false)}
                      variant="outline"
                      className="w-full"
                    >
                      Zurück
                    </Button>
                    <Button
                      onClick={handleManualConnect}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    >
                      Peer-ID eingeben
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {connected && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center"
            >
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-400 mb-4" />
              <p className="text-gray-400">Weiterleitung zum Dashboard...</p>
            </motion.div>
          )}

          {error && (
            <div className="space-y-4">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
              <Button
                onClick={() => {
                  setError(null)
                  if (peerIdFromUrl) {
                    connectToPeer(peerIdFromUrl)
                  }
                }}
                className="w-full"
                variant="outline"
              >
                Erneut versuchen
              </Button>
            </div>
          )}
        </Card>

        <div className="mt-6 text-center">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            Zurück zum Dashboard
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

export default ConnectScan
