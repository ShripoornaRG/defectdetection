"use client"
import { useRef, useState, useCallback, useEffect } from 'react'

export default function CameraCapture({ onCapture }: { onCapture: (file: File) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string>('')

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: true
      })
      setStream(mediaStream)
    } catch (err: unknown) {
      console.error(err);
      setError('Could not access camera. Please check permissions or upload a file instead.')
    }
  }

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream
    }
  }, [stream])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "capture.jpg", { type: "image/jpeg" })
          onCapture(file)
          stopCamera()
        }
      }, 'image/jpeg', 0.9)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      onCapture(files[0])
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
      {error && <div style={{ color: 'var(--danger)' }}>{error}</div>}
      
      {!stream ? (
        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column', width: '100%', maxWidth: '300px' }}>
          <button className="btn-primary" onClick={startCamera}>Open Camera</button>
          
          <div style={{ textAlign: 'center', color: '#8b949e', margin: '0.5rem 0' }}>— OR —</div>
          
          <label className="btn-secondary" style={{ textAlign: 'center', display: 'block', cursor: 'pointer' }}>
            Upload Image
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
        </div>
      ) : (
        <div style={{ position: 'relative', width: '100%', maxWidth: '600px', borderRadius: '16px', overflow: 'hidden', background: '#111', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid var(--border)' }}>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block' }} 
          />
          {/* Viewfinder overlay */}
          <div style={{ position: 'absolute', top: '10%', left: '10%', right: '10%', bottom: '20%', border: '2px dashed rgba(255,255,255,0.4)', borderRadius: '12px', pointerEvents: 'none' }}></div>
          
          <button 
            className="btn-primary" 
            onClick={takePhoto}
            style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', borderRadius: '99px', width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, border: '4px solid rgba(255,255,255,0.8)', background: 'transparent', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', transition: 'transform 0.1s' }}
          >
             <div style={{ width: '54px', height: '54px', borderRadius: '50%', background: 'white' }}></div>
          </button>
          <button 
            onClick={stopCamera}
            style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.6)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, backdropFilter: 'blur(4px)' }}
          >
            Close
          </button>
        </div>
      )}
      
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  )
}
