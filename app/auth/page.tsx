"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mountain, User, Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react'
import Navigation from '@/components/navigation'
import Footer from '@/components/footer'
import { useAuth } from '@/hooks/use-auth'

interface FormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  phone: string
}

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  phone?: string
  general?: string
}

export default function AuthPage() {
  const router = useRouter()
  const { login: authLogin } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: ""
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long"
    }

    // Additional validations for signup
    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = "Name is required"
      }
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = "Please confirm your password"
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
      if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
        newErrors.phone = "Please enter a valid Indian phone number"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted!', { isLogin, formData, errors })

    if (!validateForm()) {
      console.log('Validation failed:', errors)
      return
    }

    setIsLoading(true)
    console.log('Starting authentication request...')

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone
        }

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        // Use the auth hook to manage authentication state
        authLogin(data.data.user, data.data.token)

        alert(isLogin ? 'Login successful!' : 'Account created successfully!')

        // Check if there's a redirect URL stored
        const redirectUrl = localStorage.getItem('redirectAfterLogin')
        if (redirectUrl) {
          localStorage.removeItem('redirectAfterLogin')
          router.push(redirectUrl)
        } else {
          router.push('/')
        }
      } else {
        setErrors({ general: data.message || 'Authentication failed' })
      }
    } catch (error) {
      console.error('Auth error:', error)
      setErrors({ general: 'Network error. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: ""
    })
    setErrors({})
  }

  return (
    <div className="min-h-screen" style={{
    }}>
      <style jsx>{`
        input::placeholder {
          color: white !important;
          opacity: 0.7;
        }
        input::-webkit-input-placeholder {
          color: white !important;
          opacity: 0.7;
        }
        input::-moz-placeholder {
          color: white !important;
          opacity: 0.7;
        }
        input:-ms-input-placeholder {
          color: white !important;
          opacity: 0.7;
        }
        .autofill-fix:-webkit-autofill,
        .autofill-fix:-webkit-autofill:hover,
        .autofill-fix:-webkit-autofill:focus,
        .autofill-fix:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px rgba(255, 255, 255, 0.08) inset !important;
          -webkit-text-fill-color: white !important;
          background-color: rgba(255, 255, 255, 0.08) !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        p {
          color: white !important;
        }
        .error-message {
          color: white !important;
          font-weight: normal !important;
        }
      `}</style>
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="ai-demo-card" data-aos="fade-up" data-aos-delay="600">
          <div className="max-w-4xl mx-auto">
            <div
              className="p-12"
              style={{
                background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.18) 0%, rgba(30, 58, 138, 0.18) 100%)',
                backdropFilter: 'blur(15px)',
                border: '2px solid rgba(244, 208, 63, 0.35)',
                borderRadius: '20px',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.25)'
              }}
              data-aos="fade-up"
              data-aos-delay="200"
            >
              {/* Header */}
              <div className="text-center mb-10">
                <div className="flex justify-center mb-1">
                  <div className="p-6 rounded-3xl" style={{
                  }}>
                    <Mountain className="h-12 w-12 text-yellow-300 relative z-10" style={{ color: '#f4d03f' }} />
                  </div>
                </div>
                <h2 className="text-4xl font-bold mb-4 tracking-tight" style={{
                  color: '#f4d03f',
                  textShadow: '0 2px 10px rgba(244, 208, 63, 0.3)'
                }}>
                  {isLogin ? 'Welcome Back' : 'Join Our Community'}
                </h2>
                <p className="text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.85)' }}>
                  {isLogin
                    ? 'Continue your journey through Jharkhand\'s wonders'
                    : 'Discover the hidden gems and rich heritage of Jharkhand'
                  }
                </p>
              </div>

              {/* General Error Message */}
              {errors.general && (
                <div className="mb-6 p-4 rounded-xl" style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '2px solid rgba(239, 68, 68, 0.3)',
                  color: '#ef4444'
                }}>
                  <p className="text-center font-medium">{errors.general}</p>
                </div>
              )}

              {/* Form */}
              <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                  {/* Name Field (Register only) - Full width at top */}
                  {!isLogin && (
                    <div className="w-full">
                      <label htmlFor="name" className="block text-sm font-semibold mb-3" style={{
                        color: '#f4d03f',
                        textShadow: '0 1px 3px rgba(244, 208, 63, 0.3)'
                      }}>
                        Full Name *
                      </label>
                      <div className="relative group">
                        <User className="h-5 w-5" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, color: 'white' }} />
                        <input
                          id="name"
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full pl-4 pr-12 py-3 rounded-md placeholder-white autofill-fix"
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(244, 208, 63, 0.3)',
                            color: 'white',
                            height: '42px'
                          }}
                          onFocus={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                            e.target.style.color = 'white';
                            e.target.style.border = '1px solid rgba(244, 208, 63, 0.5)';
                          }}
                          onBlur={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                            e.target.style.color = 'white';
                            e.target.style.border = '1px solid rgba(244, 208, 63, 0.3)';
                          }}
                          placeholder="Enter your name"
                        />
                      </div>
                      {errors.name && <p className="text-sm mt-2 ml-1" style={{ color: 'white !important' }}>{errors.name}</p>}
                    </div>
                  )}

                  {/* Email and Phone Row (Register) / Email Full Width (Login) */}
                  <div className={!isLogin ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "w-full"}>
                    {/* Email Field */}
                    <div className="w-full">
                      <label htmlFor="email" className="block text-sm font-semibold mb-3" style={{
                        color: '#f4d03f',
                        textShadow: '0 1px 3px rgba(244, 208, 63, 0.3)'
                      }}>
                        Email Address *
                      </label>
                      <div className="relative group">
                        <Mail className="h-5 w-5" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, color: 'white' }} />
                        <input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-4 pr-12 py-3 rounded-md placeholder-white autofill-fix"
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(244, 208, 63, 0.3)',
                            color: 'white',
                            height: '42px'
                          }}
                          onFocus={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                            e.target.style.color = 'white';
                            e.target.style.border = '1px solid rgba(244, 208, 63, 0.5)';
                          }}
                          onBlur={(e) => {
                            e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                            e.target.style.color = 'white';
                            e.target.style.border = '1px solid rgba(244, 208, 63, 0.3)';
                          }}
                          autoComplete="email"
                          placeholder="Enter your email"
                        />
                      </div>
                      {errors.email && <p className="error-message text-sm mt-2 ml-1" style={{ color: 'white !important', fontWeight: 'normal' }}>{errors.email}</p>}
                    </div>

                    {/* Phone Field (Register only) */}
                    {!isLogin && (
                      <div className="w-full">
                        <label htmlFor="phone" className="block text-sm font-semibold mb-3" style={{
                          color: '#f4d03f',
                          textShadow: '0 1px 3px rgba(244, 208, 63, 0.3)',
                          marginLeft: '24px'
                        }}>
                          Phone Number (Optional)
                        </label>
                        <div className="relative group" style={{ marginLeft: '24px' }}>
                          <Phone className="h-5 w-5" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, color: 'white' }} />
                          <input
                            id="phone"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-4 pr-12 py-3 rounded-md placeholder-white autofill-fix"
                            style={{
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(244, 208, 63, 0.3)',
                              color: 'white',
                              height: '42px'
                            }}
                            onFocus={(e) => {
                              e.target.style.background = 'rgba(255, 255, 255, 0.12)';
                              e.target.style.color = 'white';
                              e.target.style.border = '1px solid rgba(244, 208, 63, 0.5)';
                            }}
                            onBlur={(e) => {
                              e.target.style.background = 'rgba(255, 255, 255, 0.08)';
                              e.target.style.color = 'white';
                              e.target.style.border = '1px solid rgba(244, 208, 63, 0.3)';
                            }}
                            placeholder="Enter your phone number"
                          />
                        </div>
                        {errors.phone && <p className="text-sm mt-2" style={{ color: 'white !important', marginLeft: '25px' }}>{errors.phone}</p>}
                      </div>
                    )}
                  </div>

                  {/* Password Fields Row */}
                  <div className={!isLogin ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "w-full"}>
                    {/* Password Field */}
                    <div className="w-full">
                      <label htmlFor="password" style={{ color: '#f4d03f' }} className="block text-sm font-medium mb-2">
                        Password *
                      </label>
                      <div className="relative">
                        <Lock className="h-5 w-5" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, color: 'white' }} />
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pl-4 pr-20 py-3 rounded-md"
                          style={{
                            background: 'rgba(255, 255, 255, 0.08)',
                            border: '1px solid rgba(244, 208, 63, 0.3)',
                            color: 'white',
                            height: '42px'
                          }}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-md"
                          style={{
                            background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                            border: '1px solid #f4d03f',
                            color: '#1a1a1a',
                            boxShadow: '0 2px 8px rgba(244, 208, 63, 0.3)'
                          }}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="error-message text-sm mt-1" style={{ color: 'white !important', fontWeight: 'normal' }}>{errors.password}</p>}
                    </div>

                    {/* Confirm Password Field (Register only) */}
                    {!isLogin && (
                      <div className="w-full">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{
                          color: '#f4d03f',
                          marginLeft: '24px'
                        }}>
                          Confirm Password *
                        </label>
                        <div className="relative" style={{ marginLeft: '24px' }}>
                          <Lock className="h-5 w-5" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, color: 'white' }} />
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full pl-4 pr-20 py-3 rounded-md placeholder-white autofill-fix"
                            style={{
                              background: 'rgba(255, 255, 255, 0.08)',
                              border: '1px solid rgba(244, 208, 63, 0.3)',
                              color: 'white',
                              height: '42px'
                            }}
                            placeholder="Confirm your password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-md"
                            style={{
                              background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                              border: '1px solid #f4d03f',
                              color: '#1a1a1a',
                              boxShadow: '0 2px 8px rgba(244, 208, 63, 0.3)'
                            }}
                          >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.confirmPassword && <p className="text-sm mt-1" style={{ color: 'white !important', marginLeft: '24px' }}>{errors.confirmPassword}</p>}
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    onClick={(e) => {
                      console.log('Button clicked!', { isLogin, formData });
                      // The form onSubmit will handle the actual submission
                    }}
                    className="w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl mt-8 relative overflow-hidden cursor-pointer"
                    style={{
                      background: isLoading
                        ? 'linear-gradient(135deg, #999 0%, #666 100%)'
                        : 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                      color: '#800020',
                      border: '3px solid #f4d03f',
                      boxShadow: '0 8px 25px rgba(244, 208, 63, 0.4)',
                      textShadow: '0 1px 2px rgba(128, 0, 32, 0.3)',
                      opacity: isLoading ? 0.7 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading) {
                        const target = e.target as HTMLButtonElement;
                        target.style.background = 'linear-gradient(135deg, #f7e047 0%, #f4d03f 100%)';
                        target.style.transform = 'translateY(-3px) scale(1.02)';
                        target.style.boxShadow = '0 12px 35px rgba(244, 208, 63, 0.6)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading) {
                        const target = e.target as HTMLButtonElement;
                        target.style.background = 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)';
                        target.style.transform = 'translateY(0) scale(1)';
                        target.style.boxShadow = '0 8px 25px rgba(244, 208, 63, 0.4)';
                      }
                    }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-current mr-3"></div>
                        <span className="font-semibold" style={{ background: 'none' }}>
                          {isLogin ? 'Logging In...' : 'Creating Account...'}
                        </span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center font-bold">
                        {isLogin ? 'Login to Explore' : 'Join the Journey'}
                      </span>
                    )}
                  </button>

                  {/* Toggle Mode */}
                  <div className="text-center mt-8">
                    <p style={{ color: 'rgba(255,255,255,0.7)' }}>
                      {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </p>
                    <button
                      type="button"
                      onClick={toggleMode}
                      className="font-bold py-3 px-6 rounded-xl transition-all duration-300 mt-4"
                      style={{
                        background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                        color: '#800020',
                        border: '2px solid #f4d03f',
                        boxShadow: '0 4px 15px rgba(244, 208, 63, 0.3)',
                        textShadow: '0 1px 2px rgba(128, 0, 32, 0.3)'
                      }}
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                        const target = e.target as HTMLButtonElement;
                        target.style.background = 'linear-gradient(135deg, #f7e047 0%, #f4d03f 100%)';
                        target.style.transform = 'translateY(-2px) scale(1.02)';
                        target.style.boxShadow = '0 6px 20px rgba(244, 208, 63, 0.5)';
                      }}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                        const target = e.target as HTMLButtonElement;
                        target.style.background = 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)';
                        target.style.transform = 'translateY(0) scale(1)';
                        target.style.boxShadow = '0 4px 15px rgba(244, 208, 63, 0.3)';
                      }}
                    >
                      {isLogin ? 'Sign Up' : 'Login'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Terms */}
              <p className="text-center text-sm mt-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
