import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icons'
import './WorkerRegistration.css'
import api from '../services/api'

/* ── Validators ── */
const validate = {
  area:              v => v.trim().length >= 2 ? '' : 'Area must be at least 2 characters',
  pincode:           v => /^\d{6}$/.test(v) ? '' : 'Pincode must be exactly 6 digits',
  address:           v => v.trim().length >= 10 ? '' : 'Please enter a complete address (min 10 chars)',
  avgIncome:         v => (parseFloat(v) > 0) ? '' : 'Please enter a valid positive income amount',
  aadhaarNumber:     v => /^\d{12}$/.test(v) ? '' : 'Aadhaar must be exactly 12 digits',
  panNumber:         v => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v.toUpperCase()) ? '' : 'Invalid PAN format (e.g. ABCDE1234F)',
  bankName:          v => v.trim().length >= 3 ? '' : 'Please enter a valid bank name',
  bankAccountNumber: v => /^\d{9,18}$/.test(v) ? '' : 'Bank account must be 9–18 digits',
}

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.4rem',
      marginTop: '0.375rem', padding: '0.4rem 0.625rem',
      background: 'rgba(255,100,80,0.1)', border: '1px solid rgba(255,100,80,0.3)',
      borderRadius: '6px', fontSize: '0.75rem', color: '#ff6450',
    }}>
      <Icon name="alert" size={12} color="#ff6450" />
      {msg}
    </div>
  )
}

export default function WorkerRegistration() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState({})
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  useEffect(() => {
    async function loadEmail() {
      try {
        const res = await api.get('/auth/profile')
        if (res.data?.email) setEmail(res.data.email)
      } catch (err) {
        // Not logged in — show gentle message but don't redirect
        console.warn('Could not load profile, user may not be logged in yet')
      }
    }
    loadEmail()
  }, [])

  const [formData, setFormData] = useState({
    area: '',
    pincode: '',
    address: '',
    deliverySegment: 'FOOD',
    avgIncome: '',
    aadhaarNumber: '',
    panNumber: '',
    bankAccountNumber: '',
    bankName: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    const newVal = name === 'panNumber' ? value.toUpperCase() : value
    setFormData(prev => ({ ...prev, [name]: newVal }))
    // Live-validate on change if field was already touched
    if (touched[name] && validate[name]) {
      setErrors(prev => ({ ...prev, [name]: validate[name](newVal) }))
    }
  }

  const touch = (name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    if (validate[name]) {
      setErrors(prev => ({ ...prev, [name]: validate[name](formData[name]) }))
    }
  }

  // Validate a set of fields and return true if all pass
  const validateStep = (fields) => {
    const newErrors = {}
    const newTouched = {}
    let ok = true
    fields.forEach(f => {
      newTouched[f] = true
      if (validate[f]) {
        const err = validate[f](formData[f])
        newErrors[f] = err
        if (err) ok = false
      }
    })
    setTouched(prev => ({ ...prev, ...newTouched }))
    setErrors(prev => ({ ...prev, ...newErrors }))
    return ok
  }

  const goToStep2 = () => {
    if (validateStep(['area', 'pincode', 'address'])) setStep(2)
  }

  const goToStep3 = () => {
    if (validateStep(['avgIncome'])) setStep(3)
  }

  const handleSubmit = async () => {
    if (!validateStep(['aadhaarNumber', 'panNumber', 'bankName', 'bankAccountNumber'])) return
    
    setIsSubmitting(true)
    setSubmitError('')
    try {
      await api.post('/api/v1/workers', {
        email: email,
        ...formData,
        panNumber: formData.panNumber.toUpperCase(),
        avgIncome: parseFloat(formData.avgIncome) || 0
      })
      setSubmitSuccess(true)
      // Store KYC status locally so dashboard knows
      localStorage.setItem('gigshield_kyc_done', 'true')
      setTimeout(() => navigate('/worker'), 2000)
    } catch (err) {
      console.error('Submission error', err)
      const msg = err.response?.data?.message || err.response?.data || err.message
      if (err.response?.status === 400) {
        // Highlight which field caused the backend error
        const msgStr = String(msg).toLowerCase()
        if (msgStr.includes('bank account') || msgStr.includes('account number')) {
          setErrors(prev => ({ ...prev, bankAccountNumber: 'Invalid bank account number. Please check and retry.' }))
          setTouched(prev => ({ ...prev, bankAccountNumber: true }))
          setStep(3)
        } else if (msgStr.includes('aadhaar')) {
          setErrors(prev => ({ ...prev, aadhaarNumber: 'Invalid Aadhaar number.' }))
          setTouched(prev => ({ ...prev, aadhaarNumber: true }))
          setStep(3)
        } else if (msgStr.includes('pan')) {
          setErrors(prev => ({ ...prev, panNumber: 'Invalid PAN number.' }))
          setTouched(prev => ({ ...prev, panNumber: true }))
          setStep(3)
        } else {
          setSubmitError(String(msg))
        }
      } else if (err.response?.status === 409) {
        setSubmitError('A worker profile already exists for this account.')
      } else if (err.response?.status === 401) {
        setSubmitError('Session expired. Please log in again and retry.')
      } else {
        setSubmitError('Submission failed. Please try again. ' + String(msg))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const SegmentOptions = ['FOOD', 'ECOMMERCE', 'GROCERY', 'RIDESHARE']

  if (submitSuccess) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-bg-glow" />
        <div className="onboarding-container card glass" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(74,225,131,0.15)', border: '2px solid var(--tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <Icon name="check" size={28} color="var(--tertiary)" />
          </div>
          <h2 style={{ color: 'var(--tertiary)', marginBottom: '0.5rem' }}>KYC Verification Complete!</h2>
          <p style={{ color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>Your GigShield AI protection is now active.</p>
          <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.85rem' }}>Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-bg-glow" />

      <div className="onboarding-container card glass">
        <div className="onboarding-header">
          <Icon name="verified_user" size={32} color="var(--primary)" />
          <h2>Worker Verification & Profile</h2>
          <p>Complete your KYC and location details to activate your GigShield AI protection.</p>
        </div>

        {/* Step Indicator */}
        <div className="onboard-steps">
          {['Location', 'Professional', 'KYC & Bank'].map((label, idx) => (
            <div key={idx} className={`ob-step ${step > idx + 1 ? 'completed' : ''} ${step === idx + 1 ? 'active' : ''}`}>
              <div className="ob-step-circle">{step > idx + 1 ? <Icon name="check" size={14} /> : idx + 1}</div>
              <span className="ob-step-label">{label}</span>
            </div>
          ))}
        </div>

        {/* Global submit error */}
        {submitError && (
          <div style={{ margin: '0 0 1rem', padding: '0.75rem 1rem', background: 'rgba(255,100,80,0.12)', border: '1px solid rgba(255,100,80,0.4)', borderRadius: '8px', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <Icon name="alert" size={16} color="#ff6450" />
            <div>
              <p style={{ fontWeight: 600, color: '#ff6450', fontSize: '0.875rem', margin: 0 }}>Submission Failed</p>
              <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.8rem', marginTop: '0.25rem' }}>{submitError}</p>
            </div>
          </div>
        )}

        <div className="onboard-forms">
          {/* ── Step 1: Location ── */}
          {step === 1 && (
            <div className="onboard-step-content fade-in">
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" className="form-input disabled" value={email || 'Loading...'} readOnly />
                <span className="ob-hint">Fetched automatically from your account.</span>
              </div>
              <div className="two-col-fields">
                <div className="form-group">
                  <label>Area / Locality <span className="req">*</span></label>
                  <input
                    type="text" name="area" className={`form-input ${errors.area && touched.area ? 'input-error' : ''}`}
                    placeholder="e.g. HSR Layout"
                    value={formData.area}
                    onChange={handleChange}
                    onBlur={() => touch('area')}
                  />
                  <FieldError msg={touched.area && errors.area} />
                </div>
                <div className="form-group">
                  <label>Pincode <span className="req">*</span></label>
                  <input
                    type="text" name="pincode" className={`form-input ${errors.pincode && touched.pincode ? 'input-error' : ''}`}
                    placeholder="6 Digits" maxLength={6}
                    value={formData.pincode}
                    onChange={handleChange}
                    onBlur={() => touch('pincode')}
                  />
                  <FieldError msg={touched.pincode && errors.pincode} />
                </div>
              </div>
              <div className="form-group">
                <label>Complete Address <span className="req">*</span></label>
                <textarea
                  name="address" className={`form-input ob-textarea ${errors.address && touched.address ? 'input-error' : ''}`}
                  placeholder="Flat No, Building, Street..."
                  value={formData.address}
                  onChange={handleChange}
                  onBlur={() => touch('address')}
                  rows={3}
                />
                <FieldError msg={touched.address && errors.address} />
              </div>
              <div className="ob-actions">
                <div />
                <button className="btn-primary" onClick={goToStep2}>Next Step →</button>
              </div>
            </div>
          )}

          {/* ── Step 2: Professional ── */}
          {step === 2 && (
            <div className="onboard-step-content fade-in">
              <div className="form-group">
                <label>Delivery Segment <span className="req">*</span></label>
                <div className="segment-grid">
                  {SegmentOptions.map(seg => (
                    <div
                      key={seg}
                      className={`seg-card ${formData.deliverySegment === seg ? 'selected' : ''}`}
                      onClick={() => setFormData(prev => ({ ...prev, deliverySegment: seg }))}
                    >
                      <span>{seg}</span>
                      {formData.deliverySegment === seg && <Icon name="check" size={16} />}
                    </div>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Average Monthly Earnings (₹) <span className="req">*</span></label>
                <input
                  type="number" name="avgIncome"
                  className={`form-input ${errors.avgIncome && touched.avgIncome ? 'input-error' : ''}`}
                  placeholder="e.g. 25000"
                  value={formData.avgIncome}
                  onChange={handleChange}
                  onBlur={() => touch('avgIncome')}
                  min="1"
                />
                <FieldError msg={touched.avgIncome && errors.avgIncome} />
              </div>
              <div className="ob-actions">
                <button className="btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button className="btn-primary" onClick={goToStep3}>Next Step →</button>
              </div>
            </div>
          )}

          {/* ── Step 3: KYC & Bank ── */}
          {step === 3 && (
            <div className="onboard-step-content fade-in">
              <div className="ai-secure-banner">
                <Icon name="shield" size={16} />
                <span>All sensitive details are 256-bit AES encrypted by GigShield AI Core.</span>
              </div>
              <div className="two-col-fields">
                <div className="form-group">
                  <label>Aadhaar Number <span className="req">*</span></label>
                  <input
                    type="text" name="aadhaarNumber"
                    className={`form-input ob-crypto ${errors.aadhaarNumber && touched.aadhaarNumber ? 'input-error' : ''}`}
                    placeholder="12 Digit Aadhaar" maxLength={12}
                    value={formData.aadhaarNumber}
                    onChange={handleChange}
                    onBlur={() => touch('aadhaarNumber')}
                  />
                  <FieldError msg={touched.aadhaarNumber && errors.aadhaarNumber} />
                </div>
                <div className="form-group">
                  <label>PAN Card Number <span className="req">*</span></label>
                  <input
                    type="text" name="panNumber"
                    className={`form-input ob-crypto ${errors.panNumber && touched.panNumber ? 'input-error' : ''}`}
                    placeholder="e.g. ABCDE1234F" maxLength={10}
                    style={{ textTransform: 'uppercase' }}
                    value={formData.panNumber}
                    onChange={handleChange}
                    onBlur={() => touch('panNumber')}
                  />
                  <FieldError msg={touched.panNumber && errors.panNumber} />
                </div>
              </div>

              <div className="two-col-fields">
                <div className="form-group">
                  <label>Bank Name <span className="req">*</span></label>
                  <input
                    type="text" name="bankName"
                    className={`form-input ${errors.bankName && touched.bankName ? 'input-error' : ''}`}
                    placeholder="e.g. State Bank of India"
                    value={formData.bankName}
                    onChange={handleChange}
                    onBlur={() => touch('bankName')}
                  />
                  <FieldError msg={touched.bankName && errors.bankName} />
                </div>
                <div className="form-group">
                  <label>Bank Account Number <span className="req">*</span></label>
                  <input
                    type="text" name="bankAccountNumber"
                    className={`form-input ob-crypto ${errors.bankAccountNumber && touched.bankAccountNumber ? 'input-error' : ''}`}
                    placeholder="9–18 digit account number"
                    value={formData.bankAccountNumber}
                    onChange={handleChange}
                    onBlur={() => touch('bankAccountNumber')}
                    maxLength={18}
                  />
                  <FieldError msg={touched.bankAccountNumber && errors.bankAccountNumber} />
                  <span className="ob-hint" style={{ marginTop: '0.25rem', display: 'block' }}>
                    <Icon name="shield" size={11} color="var(--tertiary)" /> This is stored securely and used only for claim payouts.
                  </span>
                </div>
              </div>

              <div className="ob-actions final-action">
                <button className="btn-secondary" onClick={() => setStep(2)}>← Back</button>
                <button
                  className="btn-primary btn-with-icon"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  <Icon name={isSubmitting ? 'activity' : 'check'} size={16} />
                  {isSubmitting ? 'Encrypting & Submitting...' : 'Complete Registration'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
