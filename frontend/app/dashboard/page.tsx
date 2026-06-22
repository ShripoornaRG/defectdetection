"use client"
import { useState, useRef } from 'react'
import CameraCapture from '../../components/CameraCapture'
import { useAuth } from '../../context/AuthContext'

interface Defect {
  type: string;
  confidence: number;
}

interface AnalysisResult {
  detected_defects: Defect[];
  surface_quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  adhesion_quality: 'Excellent' | 'Good' | 'Moderate' | 'Poor';
  adhesion_quality_note: string;
  severity: 'Low' | 'Medium' | 'High';
  recommendation: string;
  annotated_image: string; // Base64 JPEG string
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const [showCamera, setShowCamera] = useState(false)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleCapture = (file: File) => {
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
    setError(null)
    setShowCamera(false)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    setError(null)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      validateAndSetFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    const filenameLower = file.name.toLowerCase()
    const validExtensions = ['.jpg', '.jpeg', '.png']
    const isValidExtension = validExtensions.some(ext => filenameLower.endsWith(ext))
    const isValidMime = file.type.startsWith('image/')

    if (!isValidExtension && !isValidMime) {
      setError("Invalid file format. Only JPG, JPEG, and PNG files are accepted.")
      return
    }

    if (file.size === 0) {
      setError("Uploaded file is empty. Please upload a valid image.")
      return
    }

    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null)
  }

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleAnalyze = async () => {
    if (!image) return
    setAnalyzing(true)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', image)

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const res = await fetch(`${apiBaseUrl}/analyze`, {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.detail || `Analysis failed with status code ${res.status}`)
      }

      const data: AnalysisResult = await res.json()
      setResult(data)
    } catch (err: unknown) {
      console.error("Backend error:", err)
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const message = err instanceof Error ? err.message : `Failed to connect to the DefectVision API server. Please verify the backend is running at ${apiBaseUrl}.`
      setError(message)
    } finally {
      setAnalyzing(false)
    }
  }

  const resetDashboard = () => {
    setImage(null)
    setPreview(null)
    setResult(null)
    setError(null)
    setShowCamera(false)
  }

  // Helper colors for badges and metric levels
  const getSeverityColor = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case 'low': return '#3fb950';
      case 'medium': return '#d29922';
      case 'high': return '#f85149';
      default: return 'var(--primary)';
    }
  }

  const getQualityBadgeClass = (quality: string) => {
    switch (quality?.toLowerCase()) {
      case 'excellent': return 'quality-excellent';
      case 'good': return 'quality-good';
      case 'fair': return 'quality-fair';
      case 'poor': return 'quality-poor';
      default: return 'quality-good';
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid rgba(88, 166, 255, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'scan 1s linear infinite' }}></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div style={{ padding: '2rem 3.5rem', width: '100%', maxWidth: '100%', minHeight: '90vh' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em' }}>
            DefectVision <span className="gradient-text">Console</span>
          </h1>
          <p style={{ color: '#8b949e', marginTop: '0.25rem' }}>Industrial inspection and material surface analysis dashboard</p>
        </div>
        {preview && (
          <button className="btn-secondary" onClick={resetDashboard}>
            Reset Inspection
          </button>
        )}
      </div>

      {error && (
        <div style={{ padding: '1.25rem', background: 'rgba(248, 81, 73, 0.15)', border: '1px solid rgba(248, 81, 73, 0.4)', borderRadius: '12px', color: '#ff7b72', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', animation: 'fadeIn 0.3s ease' }}>
          <strong style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>⚠️ SYSTEM WARNING / ERROR</strong>
          <span style={{ fontSize: '0.95rem' }}>{error}</span>
        </div>
      )}

      {/* Upload/Camera Section (when no image selected) */}
      {!preview && (
        <div className="glass-panel animate-fade-in" style={{ padding: '3rem 2rem', display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center' }}>
          
          {showCamera ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '600px', marginBottom: '1rem', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Live Camera Feed</h3>
                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.9rem' }} onClick={() => setShowCamera(false)}>
                  Back to Upload
                </button>
              </div>
              <CameraCapture onCapture={handleCapture} />
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Drag and Drop Zone */}
              <div 
                className={`upload-zone ${isDragActive ? 'active' : ''}`}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileSelect}
              >
                <div style={{ fontSize: '3rem' }}>📥</div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.25rem' }}>Drag & Drop defect image here</h3>
                  <p style={{ color: '#8b949e', fontSize: '0.9rem' }}>Supports JPG, JPEG, and PNG formats</p>
                </div>
                <button className="btn-primary" style={{ pointerEvents: 'none', padding: '8px 18px', fontSize: '0.9rem' }}>
                  Browse Files
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', color: '#8b949e' }}>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
                <span>OR</span>
                <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
              </div>

              <button className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => setShowCamera(true)}>
                📷 Use Inspection Camera
              </button>

            </div>
          )}
        </div>
      )}

      {/* Main Workspace (when image selected) */}
      {preview && !result && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Pre-analysis: Full-width image with analyze button */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>SURFACE VISUALIZATION</h3>
              {!analyzing && (
                <button className="btn-primary" style={{ padding: '8px 20px', fontSize: '0.95rem' }} onClick={handleAnalyze}>
                  Analyze Surface
                </button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontWeight: 600 }}>Raw Input</div>
              <div className="scanner-container">
                {analyzing && <div className="scanner-line"></div>}
                <img 
                  src={preview} 
                  alt="Raw defect preview" 
                  style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain', display: 'block', opacity: analyzing ? 0.6 : 1 }} 
                />
              </div>
            </div>

            {analyzing && (
              <div className="pulse" style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', padding: '1rem 0' }}>
                <span className="spinner" style={{ display: 'inline-block', width: '18px', height: '18px', border: '2px solid rgba(88, 166, 255, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'scan 1s linear infinite' }}></span>
                YOLO Model Inference Running...
              </div>
            )}
          </div>

          {!analyzing && (
            <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: '#8b949e' }}>
              <p>Click the <strong>Analyze Surface</strong> button to initiate YOLO neural network defect detection on this surface segment.</p>
            </div>
          )}
        </div>
      )}

      {/* Post-analysis: Side-by-side layout — Images LEFT, Report RIGHT */}
      {preview && result && (
        <div className="dashboard-grid animate-fade-in" style={{ alignItems: 'stretch' }}>
          
          {/* Left Column: Images (Raw + YOLO stacked) */}
          <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)', flexShrink: 0 }}>SURFACE VISUALIZATION</h3>

            {/* Raw Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, minHeight: 0 }}>
              <div style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontWeight: 600, flexShrink: 0 }}>Raw Input</div>
              <div className="scanner-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, height: '100%' }}>
                <img 
                  src={preview} 
                  alt="Raw defect preview" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', minHeight: 0 }} 
                />
              </div>
            </div>

            {/* YOLO Annotated */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', animation: 'fadeIn 0.4s ease', flex: 1, minHeight: 0 }}>
              <div style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontWeight: 600, flexShrink: 0 }}>YOLO Detections</div>
              <div className="scanner-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 0, height: '100%' }}>
                <img 
                  src={result.annotated_image} 
                  alt="YOLO defect detections" 
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', minHeight: 0 }} 
                />
              </div>
            </div>
          </div>

          {/* Right Column: Inspection Report */}
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            
            {/* Header Metrics */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '1.25rem', flexShrink: 0 }}>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 700 }}>INSPECTION REPORT</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#8b949e', textTransform: 'uppercase', fontWeight: 600 }}>Severity:</span>
                <span className="badge" style={{ backgroundColor: 'transparent', borderColor: getSeverityColor(result.severity), color: getSeverityColor(result.severity) }}>
                  {result.severity}
                </span>
              </div>
            </div>

            {/* Score Indicators Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flexShrink: 0 }}>
              
              {/* Surface Quality */}
              <div className="metric-card">
                <span className="metric-label">Surface Quality</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span className={`quality-badge ${getQualityBadgeClass(result.surface_quality)}`}>
                    {result.surface_quality}
                  </span>
                </div>
                <span className="metric-desc" style={{ marginTop: '0.5rem' }}>
                  {result.surface_quality === 'Excellent' && 'Perfect condition.'}
                  {result.surface_quality === 'Good' && 'Minor surface wear.'}
                  {result.surface_quality === 'Fair' && 'Moderate defect clusters.'}
                  {result.surface_quality === 'Poor' && 'Significant structural defect concentration.'}
                </span>
              </div>

              {/* Adhesion Quality */}
              <div className="metric-card">
                <span className="metric-label">Est. Adhesion</span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <span className={`quality-badge ${getQualityBadgeClass(result.adhesion_quality)}`}>
                    {result.adhesion_quality}
                  </span>
                </div>
                <span className="metric-desc" style={{ marginTop: '0.5rem' }}>
                  Estimate based on surface defects.
                </span>
              </div>

            </div>

            {/* Warning note for Adhesion Quality */}
            <div style={{ padding: '0.75rem 1rem', background: 'rgba(210, 153, 34, 0.05)', border: '1px solid rgba(210, 153, 34, 0.2)', borderRadius: '8px', fontSize: '0.8rem', color: '#d29922', display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <span>ℹ️</span>
              <span>{result.adhesion_quality_note}</span>
            </div>

            {/* Actionable Maintenance Recommendation */}
            <div style={{ padding: '1rem', background: 'rgba(88, 166, 255, 0.07)', borderLeft: '4px solid var(--primary)', borderRadius: '0 8px 8px 0', display: 'flex', flexDirection: 'column', gap: '0.25rem', flexShrink: 0 }}>
              <span className="metric-label" style={{ color: 'var(--primary)' }}>Action Plan</span>
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>{result.recommendation}</span>
            </div>

            {/* Detected defects list */}
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
              <h4 style={{ fontSize: '0.9rem', color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                Detected defect details ({result.detected_defects.length})
              </h4>

              {result.detected_defects.length === 0 ? (
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', textAlign: 'center', color: '#8b949e', border: '1px dashed var(--border)', flexShrink: 0 }}>
                  No defects identified by the YOLO model.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1, minHeight: 0, paddingRight: '0.5rem' }} className="custom-scrollbar">
                  {result.detected_defects.map((defect, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', background: 'rgba(255,255,255,0.02)', padding: '0.6rem 1rem', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '0.95rem' }}>
                          {defect.type.replace('_', ' ').replace('-', ' ')}
                        </span>
                        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                          {(defect.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      
                      {/* Progress bar represent confidence */}
                      <div style={{ width: '100%', height: '5px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div 
                          style={{ 
                            height: '100%', 
                            width: `${defect.confidence * 100}%`, 
                            background: 'linear-gradient(90deg, var(--primary), #8a2be2)',
                            borderRadius: '3px' 
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}
    </div>
  )
}
