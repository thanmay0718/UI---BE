import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function VerifyOtpPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // ─── Extract scoped JWT from URL param ───────────────────────────
  const queryParams = new URLSearchParams(location.search)
  const token = queryParams.get('token')

  // ─── State ───────────────────────────────────────────────────────
  const [stage, setStage] = useState('channel_select') // channel_select | phone_input | otp_input
  const [channel, setChannel] = useState('')            // 'email' | 'call'
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const [attemptsLeft, setAttemptsLeft] = useState(3)

  const inputRefs = useRef([])

  // ─── Redirect if no token ────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      navigate('/signup')
    }
  }, [token, navigate])

  // ─── Countdown Timer ─────────────────────────────────────────────
  useEffect(() => {
    let timer
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(v => v - 1), 1000)
    }
    return () => clearInterval(timer)
  }, [countdown])

  // ─── Initiate OTP (email or voice call) ──────────────────────────
  const initiateOtp = async (selectedChannel, phone) => {
    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      const payload = { channel: selectedChannel }
      if (selectedChannel === 'call') {
        payload.phoneNumber = `+91${phone}`
      }

      const res = await api.post('/api/v1/auth/otp/initiate', payload, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setSuccessMsg(res.data.message || 'OTP sent!')
      setStage('otp_input')
      setCountdown(30)
      setOtp(['', '', '', '', '', ''])
      setTimeout(() => inputRefs.current[0]?.focus(), 100)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ─── User picks channel ───────────────────────────────────────────
  const handleChannelSelect = (ch) => {
    setChannel(ch)
    setError('')
    setSuccessMsg('')
    if (ch === 'call') {
      setStage('phone_input')
    } else {
      initiateOtp('email', null)
      setStage('otp_input') // will be set again in initiateOtp but show loader immediately
    }
  }

  // ─── OTP Input Handlers ───────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  // ─── Verify OTP ────────────────────────────────────────────────────
  const handleVerify = async () => {
    const code = otp.join('')
    if (code.length !== 6) {
      setError('Please enter all 6 digits.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const res = await api.post('/api/v1/auth/otp/verify',
        { channel, code },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setSuccessMsg(res.data.message || 'Verified successfully!')
      setTimeout(() => navigate('/worker'), 1500)
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed.'
      const remaining = err.response?.data?.attemptsRemaining ?? (attemptsLeft - 1)
      setAttemptsLeft(remaining)
      setError(msg)
      setOtp(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()

      if (remaining <= 0) {
        setError('Maximum attempts reached. Please restart the signup process.')
        setTimeout(() => navigate('/signup'), 3000)
      }
    } finally {
      setLoading(false)
    }
  }

  // ─── Resend OTP ────────────────────────────────────────────────────
  const handleResend = () => {
    const phone = channel === 'call' ? phoneNumber : null
    initiateOtp(channel, phone)
  }

  // ─────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient Glow Background */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-10%',
        width: '40%', height: '40%',
        background: 'rgba(0,242,254,0.15)',
        borderRadius: '50%', filter: 'blur(120px)', pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: '40%', height: '40%',
        background: 'rgba(79,172,254,0.1)',
        borderRadius: '50%', filter: 'blur(100px)', pointerEvents: 'none'
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: '420px',
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: '24px',
        padding: '2.5rem 2rem',
        boxShadow: '0 32px 80px rgba(0,0,0,0.6)'
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '52px', height: '52px', margin: '0 auto 1rem',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, rgba(0,242,254,0.2), rgba(79,172,254,0.2))',
            border: '1px solid rgba(0,242,254,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem'
          }}>🔐</div>
          <h2 style={{
            margin: 0, fontSize: '1.75rem', fontWeight: 700,
            background: 'linear-gradient(135deg, #00f2fe, #4facfe)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>
            Verify Identity
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
            GigShield Enterprise Security
          </p>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            marginBottom: '1.25rem', padding: '0.85rem 1rem',
            background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)',
            borderRadius: '12px', color: '#fca5a5', fontSize: '0.85rem', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div style={{
            marginBottom: '1.25rem', padding: '0.85rem 1rem',
            background: 'rgba(0,242,254,0.08)', border: '1px solid rgba(0,242,254,0.3)',
            borderRadius: '12px', color: '#00f2fe', fontSize: '0.85rem', textAlign: 'center'
          }}>
            {successMsg}
          </div>
        )}

        {/* ── STAGE: Channel Selection ── */}
        {stage === 'channel_select' && (
          <div>
            <p style={{
              color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem',
              marginBottom: '1.5rem', textAlign: 'center'
            }}>
              How would you like to receive your verification code?
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <button
                onClick={() => handleChannelSelect('email')}
                disabled={loading}
                style={{
                  padding: '1rem 1.25rem',
                  background: 'rgba(0,242,254,0.06)',
                  border: '1px solid rgba(0,242,254,0.25)',
                  borderRadius: '14px', cursor: 'pointer',
                  color: '#fff', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,242,254,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,242,254,0.06)'}
              >
                <span style={{ fontSize: '1.4rem' }}>📧</span>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>Send to Email</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
                    OTP sent to your Google email address
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleChannelSelect('call')}
                disabled={loading}
                style={{
                  padding: '1rem 1.25rem',
                  background: 'rgba(79,172,254,0.06)',
                  border: '1px solid rgba(79,172,254,0.25)',
                  borderRadius: '14px', cursor: 'pointer',
                  color: '#fff', textAlign: 'left',
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,172,254,0.12)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(79,172,254,0.06)'}
              >
                <span style={{ fontSize: '1.4rem' }}>📞</span>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: '0.2rem' }}>AI Voice Call</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
                    Our AI reads your OTP aloud over a phone call (like banks do)
                  </div>
                </div>
              </button>
            </div>

            {loading && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem', color: '#00f2fe', fontSize: '0.85rem' }}>
                <div style={{
                  width: '28px', height: '28px', margin: '0 auto 0.75rem',
                  border: '2px solid rgba(0,242,254,0.2)', borderTopColor: '#00f2fe',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite'
                }}></div>
                Initiating secure channel...
              </div>
            )}
          </div>
        )}

        {/* ── STAGE: Phone Number Entry (for voice call) ── */}
        {stage === 'phone_input' && (
          <div>
            <p style={{
              color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem',
              marginBottom: '1.5rem', lineHeight: 1.6
            }}>
              Enter your mobile number. Our AI will call you and read the verification code aloud — just like your bank does.
            </p>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                Mobile Number
              </label>
              <div style={{
                display: 'flex',
                background: 'rgba(0,0,0,0.4)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
                <span style={{
                  padding: '0.85rem 1rem',
                  background: 'rgba(255,255,255,0.04)',
                  borderRight: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', fontWeight: 500
                }}>
                  +91
                </span>
                <input
                  type="tel"
                  maxLength="10"
                  placeholder="Enter 10-digit number"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  style={{
                    flex: 1, background: 'transparent',
                    border: 'none', outline: 'none',
                    color: '#fff', padding: '0.85rem 1rem',
                    fontSize: '1rem', letterSpacing: '0.05em'
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (phoneNumber.length < 10) {
                  setError('Please enter a valid 10-digit mobile number.')
                  return
                }
                setError('')
                initiateOtp('call', phoneNumber)
              }}
              disabled={loading || phoneNumber.length < 10}
              style={{
                width: '100%',
                padding: '0.95rem',
                background: phoneNumber.length === 10
                  ? 'linear-gradient(135deg, #00f2fe, #4facfe)'
                  : 'rgba(255,255,255,0.08)',
                border: 'none', borderRadius: '12px', cursor: 'pointer',
                color: phoneNumber.length === 10 ? '#000' : 'rgba(255,255,255,0.3)',
                fontWeight: 700, fontSize: '0.95rem',
                transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000',
                    borderRadius: '50%', animation: 'spin 0.7s linear infinite'
                  }}></div>
                  Calling...
                </>
              ) : '📞 Receive AI Voice Call'}
            </button>

            <button
              onClick={() => { setStage('channel_select'); setError('') }}
              style={{
                marginTop: '1rem', width: '100%', padding: '0.7rem',
                background: 'transparent', border: 'none',
                color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.85rem'
              }}
            >
              ← Choose a different method
            </button>
          </div>
        )}

        {/* ── STAGE: OTP Input ── */}
        {stage === 'otp_input' && (
          <div>
            <div style={{
              marginBottom: '1.5rem', padding: '0.85rem 1rem',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px', fontSize: '0.83rem', color: 'rgba(255,255,255,0.6)',
              textAlign: 'center', lineHeight: 1.7
            }}>
              {channel === 'call'
                ? <>📞 Calling <strong style={{ color: '#fff' }}>+91 {phoneNumber}</strong><br />Answer the call — our AI will read your 6-digit code</>
                : <>📧 OTP sent to your <strong style={{ color: '#00f2fe' }}>Google email</strong><br />Check your inbox (and spam folder)</>
              }
            </div>

            {/* 6-box OTP Input */}
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => inputRefs.current[i] = el}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  style={{
                    width: '48px', height: '58px',
                    textAlign: 'center', fontSize: '1.5rem', fontWeight: 700,
                    background: digit ? 'rgba(0,242,254,0.08)' : 'rgba(0,0,0,0.4)',
                    border: digit ? '1px solid rgba(0,242,254,0.5)' : '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '12px', color: '#fff', outline: 'none',
                    transition: 'all 0.15s',
                    caretColor: '#00f2fe'
                  }}
                  onFocus={e => e.target.style.border = '1px solid rgba(0,242,254,0.6)'}
                  onBlur={e => e.target.style.border = digit ? '1px solid rgba(0,242,254,0.5)' : '1px solid rgba(255,255,255,0.12)'}
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading || otp.join('').length !== 6}
              style={{
                width: '100%', padding: '0.95rem',
                background: otp.join('').length === 6
                  ? 'linear-gradient(135deg, #00f2fe, #4facfe)'
                  : 'rgba(255,255,255,0.06)',
                border: 'none', borderRadius: '12px', cursor: 'pointer',
                color: otp.join('').length === 6 ? '#000' : 'rgba(255,255,255,0.25)',
                fontWeight: 700, fontSize: '0.95rem',
                transition: 'all 0.2s', marginBottom: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px', height: '16px',
                    border: '2px solid rgba(0,0,0,0.2)', borderTopColor: '#000',
                    borderRadius: '50%', animation: 'spin 0.7s linear infinite'
                  }}></div>
                  Verifying...
                </>
              ) : '✅ Complete Verification'}
            </button>

            {/* Resend / Timer */}
            <div style={{ textAlign: 'center' }}>
              {countdown > 0 ? (
                <span style={{
                  fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)',
                  padding: '0.4rem 1rem',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '20px', display: 'inline-block'
                }}>
                  Resend in <span style={{ color: '#00f2fe', fontWeight: 600 }}>{countdown}s</span>
                </span>
              ) : (
                <button
                  onClick={handleResend}
                  style={{
                    background: 'none', border: 'none',
                    color: '#00f2fe', cursor: 'pointer',
                    fontSize: '0.85rem', textDecoration: 'underline',
                    textUnderlineOffset: '3px'
                  }}
                >
                  {channel === 'call' ? '🔄 Call again' : '🔄 Resend email'}
                </button>
              )}
            </div>

            {attemptsLeft < 3 && (
              <p style={{
                textAlign: 'center', marginTop: '1rem',
                color: '#fbbf24', fontSize: '0.8rem'
              }}>
                ⚠️ {attemptsLeft} attempt{attemptsLeft !== 1 ? 's' : ''} remaining
              </p>
            )}
          </div>
        )}

      </div>

      {/* Global keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
