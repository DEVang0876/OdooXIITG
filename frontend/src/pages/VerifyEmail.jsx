import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Auth from '../services/auth'

export default function VerifyEmail() {
    const [otp, setOtp] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const navigate = useNavigate()
    const location = useLocation()

    // Get email from location state or URL params
    const email = location.state?.email || new URLSearchParams(location.search).get('email')

    const submit = async (e) => {
        e.preventDefault()
        if (!otp || !email) {
            setMessage('Please enter the verification code')
            setMessageType('error')
            return
        }

        setLoading(true)
        setMessage('')
        try {
            await Auth.verifyEmail({ email, otp })
            setMessage('Email verified successfully! Redirecting to login...')
            setMessageType('success')
            setTimeout(() => navigate('/login'), 2000)
        } catch (error) {
            console.error('Verification error:', error)
            setMessage(error.response?.data?.message || error.message || 'Verification failed')
            setMessageType('error')
        } finally {
            setLoading(false)
        }
    }

    const resendOtp = async () => {
        if (!email) return

        setLoading(true)
        setMessage('')
        try {
            await Auth.resendVerification({ email })
            setMessage('Verification code sent to your email')
            setMessageType('success')
        } catch (error) {
            console.error('Resend error:', error)
            setMessage(error.response?.data?.message || error.message || 'Failed to resend code')
            setMessageType('error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={submit}>
                <h2>Verify Your Email</h2>
                <p className="muted">
                    We've sent a verification code to {email || 'your email'}.
                    Please enter it below to verify your account.
                </p>
                {message && (
                    <div className={`message ${messageType}`}>
                        {message}
                    </div>
                )}
                <label>Verification Code</label>
                <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    required
                />
                <div className="auth-actions">
                    <button className="btn-primary" type="submit" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </div>
                <div className="muted">
                    Didn't receive the code?{' '}
                    <button
                        type="button"
                        className="link-button"
                        onClick={resendOtp}
                        disabled={loading}
                    >
                        Resend code
                    </button>
                </div>
                <div className="muted">
                    <button
                        type="button"
                        className="link-button"
                        onClick={() => navigate('/login')}
                    >
                        Back to login
                    </button>
                </div>
            </form>
        </div>
    )
}