"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  MapPin,
  Star,
  AlertTriangle,
  Download,
  RefreshCw,
  Calendar,
  Target,
  Award,
  Activity,
  Eye,
  ShoppingBag,
  Home,
  Compass,
  Brain,
  Zap,
  Database,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Volume2,
  MessageSquare,
  Sparkles,
  Mountain
} from "lucide-react"

interface AnalyticsData {
  overview: {
    totalVisitors: number
    totalRevenue: number
    averageSatisfaction: number
    totalBookings: number
    activeVendors: number
    totalFeedbacks: number
  }
  visitorTrends: Array<{
    month: string
    visitors: number
    revenue: number
    satisfaction: number
    bookings: number
  }>
  destinations: Array<{
    name: string
    visitors: number
    revenue: number
    satisfaction: number
    growth: number
  }>
  demographics: {
    ageGroups: Array<{ group: string; percentage: number; count: number }>
    origin: Array<{ state: string; percentage: number; count: number }>
    purpose: Array<{ type: string; percentage: number; count: number }>
  }
  vendorPerformance: Array<{
    name: string
    category: string
    revenue: number
    orders: number
    rating: number
    growth: number
  }>
  sentimentTrends: Array<{
    date: string
    positive: number
    negative: number
    neutral: number
  }>
  predictions: {
    nextMonthVisitors: number
    peakSeason: string
    emergingDestinations: string[]
    riskAreas: string[]
    recommendedActions: string[]
  }
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [exportFormat, setExportFormat] = useState('csv')
  const [isExporting, setIsExporting] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("all")

  useEffect(() => {
    fetchAnalytics()
  }, [selectedTimeRange, selectedCategory])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/analytics?timeRange=${selectedTimeRange}`)
      const analyticsData = await response.json()
      setData(analyticsData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const exportData = async () => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/analytics/export?format=${exportFormat}&timeRange=${selectedTimeRange}`)
      const blob = await response.blob()
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tourism-analytics-${selectedTimeRange}.${exportFormat}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to export data:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const COLORS = ['#0B3D2E', '#145A3A', '#F28C28', '#082621', '#2563eb', '#fbbf24']

  if (loading) {
    return (
      <div className="min-h-screen" style={{
        background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.05) 0%, rgba(30, 58, 138, 0.05) 100%)'
      }}>
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center" style={{
            background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.15) 0%, rgba(30, 58, 138, 0.15) 100%)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(244, 208, 63, 0.4)',
            borderRadius: '24px',
            padding: '60px 40px',
            boxShadow: '0 8px 32px rgba(128, 0, 32, 0.3)'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #F28C28 0%, #E67E1D 100%)',
              borderRadius: '50%',
              padding: '20px',
              display: 'inline-block',
              marginBottom: '24px',
              boxShadow: '0 8px 25px rgba(242, 140, 40, 0.4)'
            }}>
              <RefreshCw className="h-12 w-12 animate-spin" style={{ color: '#0B3D2E' }} />
            </div>
            <h2 className="text-3xl font-bold mb-4" style={{
              color: '#F28C28',
              textShadow: '0 2px 4px rgba(242, 140, 40, 0.3)'
            }}>🔄 Loading Analytics Dashboard</h2>
            <p className="text-lg" style={{ color: 'white' }}>Fetching comprehensive tourism insights...</p>
            <div className="mt-6 flex justify-center space-x-4">
              <div className="animate-pulse" style={{
                background: 'rgba(242, 140, 40, 0.3)',
                height: '8px',
                width: '60px',
                borderRadius: '4px'
              }}></div>
              <div className="animate-pulse" style={{
                background: 'rgba(242, 140, 40, 0.3)',
                height: '8px',
                width: '60px',
                borderRadius: '4px',
                animationDelay: '0.2s'
              }}></div>
              <div className="animate-pulse" style={{
                background: 'rgba(244, 208, 63, 0.3)',
                height: '8px',
                width: '60px',
                borderRadius: '4px',
                animationDelay: '0.4s'
              }}></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen" style={{
        background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.05) 0%, rgba(30, 58, 138, 0.05) 100%)'
      }}>
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <div style={{
            background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.15) 0%, rgba(30, 58, 138, 0.15) 100%)',
            backdropFilter: 'blur(20px)',
            border: '2px solid rgba(244, 208, 63, 0.4)',
            borderRadius: '24px',
            padding: '60px 40px',
            boxShadow: '0 8px 32px rgba(128, 0, 32, 0.3)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)',
              borderRadius: '50%',
              padding: '20px',
              display: 'inline-block',
              marginBottom: '24px',
              boxShadow: '0 8px 25px rgba(255, 68, 68, 0.4)'
            }}>
              <AlertTriangle className="h-12 w-12" style={{ color: 'white' }} />
            </div>
            <h1 className="text-3xl font-bold mb-4" style={{
              color: '#f4d03f',
              textShadow: '0 2px 4px rgba(244, 208, 63, 0.3)'
            }}>⚠️ Failed to Load Analytics</h1>
            <p className="text-lg mb-6" style={{ color: 'white' }}>Unable to fetch analytics data. Please check your connection and try again.</p>
            <Button 
              onClick={fetchAnalytics}
              style={{
                background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                border: '2px solid #f4d03f',
                color: '#800020',
                borderRadius: '25px',
                fontWeight: '700',
                padding: '12px 24px',
                boxShadow: '0 6px 20px rgba(244, 208, 63, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" style={{ color: '#800020' }} />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.05) 0%, rgba(30, 58, 138, 0.05) 100%)'
    }}>
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8" style={{
          background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.15) 0%, rgba(30, 58, 138, 0.15) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '2px solid rgba(244, 208, 63, 0.4)',
          borderRadius: '24px',
          padding: '32px',
          boxShadow: '0 8px 32px rgba(128, 0, 32, 0.3), 0 16px 64px rgba(30, 58, 138, 0.2)'
        }}>
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div style={{
                background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                borderRadius: '16px',
                padding: '12px',
                boxShadow: '0 8px 25px rgba(244, 208, 63, 0.4)'
              }}>
                <Mountain className="h-10 w-10" style={{ color: '#800020' }} />
              </div>
              <h1 className="text-5xl font-bold" style={{
                background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 4px 8px rgba(244, 208, 63, 0.3)',
                fontWeight: '900'
              }}>
                Tourism Analytics Dashboard
              </h1>
            </div>
            <p className="text-lg flex items-center gap-3" style={{
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: '500'
            }}>
              <Brain className="h-6 w-6" style={{ color: '#f4d03f' }} />
              AI-Powered insights for Jharkhand tourism excellence
            </p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value)}
              style={{
                background: 'linear-gradient(135deg, rgba(244, 208, 63, 0.15) 0%, rgba(244, 208, 63, 0.25) 100%)',
                border: '2px solid #f4d03f',
                borderRadius: '25px',
                padding: '12px 16px',
                color: 'white',
                fontWeight: '600',
                fontSize: '14px',
                backdropFilter: 'blur(15px)',
                boxShadow: '0 6px 20px rgba(244, 208, 63, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              <option value="7d" style={{ color: '#800020' }}>📅 Last 7 Days</option>
              <option value="30d" style={{ color: '#800020' }}>📊 Last 30 Days</option>
              <option value="90d" style={{ color: '#800020' }}>📈 Last 3 Months</option>
              <option value="1y" style={{ color: '#800020' }}>🗓️ Last Year</option>
            </select>
            
            {/* Export Controls */}
            <div className="flex items-center gap-2">
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                style={{
                  background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.15) 0%, rgba(128, 0, 32, 0.25) 100%)',
                  border: '2px solid #800020',
                  borderRadius: '25px',
                  padding: '12px 16px',
                  color: 'white',
                  fontWeight: '600',
                  fontSize: '14px',
                  backdropFilter: 'blur(15px)',
                  boxShadow: '0 6px 20px rgba(128, 0, 32, 0.4)',
                  transition: 'all 0.3s ease'
                }}
              >
                <option value="csv" style={{ color: '#800020' }}>📄 CSV</option>
                <option value="xlsx" style={{ color: '#800020' }}>📊 Excel</option>
                <option value="pdf" style={{ color: '#800020' }}>📋 PDF</option>
                <option value="json" style={{ color: '#800020' }}>💾 JSON</option>
              </select>
              <Button 
                onClick={exportData} 
                disabled={isExporting}
                style={{
                  background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                  border: '2px solid #f4d03f',
                  color: '#800020',
                  borderRadius: '25px',
                  fontWeight: '700',
                  padding: '12px 20px',
                  boxShadow: '0 6px 20px rgba(244, 208, 63, 0.4)',
                  transition: 'all 0.3s ease'
                }}
                size="sm"
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Export
              </Button>
            </div>
            
            <Button 
              onClick={fetchAnalytics} 
              disabled={loading} 
              style={{
                background: 'linear-gradient(135deg, #800020 0%, #a00028 100%)',
                border: '2px solid #800020',
                color: 'white',
                borderRadius: '25px',
                fontWeight: '700',
                padding: '12px 20px',
                boxShadow: '0 6px 20px rgba(128, 0, 32, 0.4)',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* AI Features Highlight */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.15) 0%, rgba(30, 58, 138, 0.15) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '2px solid rgba(244, 208, 63, 0.5)',
          borderRadius: '20px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 8px 32px rgba(244, 208, 63, 0.2)'
        }}>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-8 w-8" style={{ color: '#f4d03f' }} />
            <h2 className="text-2xl font-bold" style={{
              color: '#f4d03f',
              textShadow: '0 2px 4px rgba(244, 208, 63, 0.3)',
              fontWeight: '800'
            }}>🤖 AI-Powered Features Active</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{
              background: 'linear-gradient(135deg, rgba(244, 208, 63, 0.1) 0%, rgba(244, 208, 63, 0.2) 100%)',
              border: '1px solid rgba(244, 208, 63, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <Brain className="h-6 w-6" style={{ color: '#f4d03f' }} />
              <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>🧠 Sentiment Analysis</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{
              background: 'linear-gradient(135deg, rgba(244, 208, 63, 0.1) 0%, rgba(244, 208, 63, 0.2) 100%)',
              border: '1px solid rgba(244, 208, 63, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <Zap className="h-6 w-6" style={{ color: '#f4d03f' }} />
              <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>⚡ Predictive Modeling</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{
              background: 'linear-gradient(135deg, rgba(244, 208, 63, 0.1) 0%, rgba(244, 208, 63, 0.2) 100%)',
              border: '1px solid rgba(244, 208, 63, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <Volume2 className="h-6 w-6" style={{ color: '#f4d03f' }} />
              <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>🎤 Voice Analytics</span>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{
              background: 'linear-gradient(135deg, rgba(244, 208, 63, 0.1) 0%, rgba(244, 208, 63, 0.2) 100%)',
              border: '1px solid rgba(244, 208, 63, 0.3)',
              backdropFilter: 'blur(10px)'
            }}>
              <ImageIcon className="h-6 w-6" style={{ color: '#f4d03f' }} />
              <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>📸 Image Recognition</span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2" style={{
            background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.2) 0%, rgba(30, 58, 138, 0.2) 100%)',
            backdropFilter: 'blur(15px)',
            border: '2px solid rgba(244, 208, 63, 0.3)',
            borderRadius: '20px',
            padding: '8px',
            boxShadow: '0 4px 20px rgba(244, 208, 63, 0.2)'
          }}>
            <TabsTrigger value="overview" style={{
              background: 'linear-gradient(135deg, rgba(244, 208, 63, 0.2) 0%, rgba(244, 208, 63, 0.3) 100%)',
              border: '2px solid rgba(244, 208, 63, 0.4)',
              color: 'white',
              fontWeight: '600',
              borderRadius: '15px',
              padding: '12px 16px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(244, 208, 63, 0.2)',
              transition: 'all 0.3s ease'
            }}>🏠 Overview</TabsTrigger>
            <TabsTrigger value="visitors" style={{
              background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.2) 0%, rgba(128, 0, 32, 0.3) 100%)',
              border: '2px solid rgba(128, 0, 32, 0.4)',
              color: 'white',
              fontWeight: '600',
              borderRadius: '15px',
              padding: '12px 16px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(128, 0, 32, 0.2)',
              transition: 'all 0.3s ease'
            }}>👥 Visitors</TabsTrigger>
            <TabsTrigger value="destinations" style={{
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(30, 58, 138, 0.3) 100%)',
              border: '2px solid rgba(30, 58, 138, 0.4)',
              color: 'white',
              fontWeight: '600',
              borderRadius: '15px',
              padding: '12px 16px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(30, 58, 138, 0.2)',
              transition: 'all 0.3s ease'
            }}>🏛️ Destinations</TabsTrigger>
            <TabsTrigger value="vendors" style={{
              background: 'linear-gradient(135deg, rgba(244, 208, 63, 0.2) 0%, rgba(128, 0, 32, 0.2) 100%)',
              border: '2px solid rgba(244, 208, 63, 0.4)',
              color: 'white',
              fontWeight: '600',
              borderRadius: '15px',
              padding: '12px 16px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(244, 208, 63, 0.2)',
              transition: 'all 0.3s ease'
            }}>🛍️ Vendors</TabsTrigger>
            <TabsTrigger value="insights" style={{
              background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.2) 0%, rgba(30, 58, 138, 0.2) 100%)',
              border: '2px solid rgba(128, 0, 32, 0.4)',
              color: 'white',
              fontWeight: '600',
              borderRadius: '15px',
              padding: '12px 16px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(128, 0, 32, 0.2)',
              transition: 'all 0.3s ease'
            }}>🤖 AI Insights</TabsTrigger>
            <TabsTrigger value="database" style={{
              background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(244, 208, 63, 0.2) 100%)',
              border: '2px solid rgba(30, 58, 138, 0.4)',
              color: 'white',
              fontWeight: '600',
              borderRadius: '15px',
              padding: '12px 16px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(30, 58, 138, 0.2)',
              transition: 'all 0.3s ease'
            }}>💾 Database</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-8">
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                <Card style={{
                  background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.15) 0%, rgba(128, 0, 32, 0.25) 100%)',
                  backdropFilter: 'blur(15px)',
                  border: '2px solid rgba(244, 208, 63, 0.3)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 25px rgba(128, 0, 32, 0.3)',
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold mb-2" style={{ color: '#f4d03f' }}>👥 Total Visitors</p>
                        <p className="text-3xl font-bold" style={{ color: 'white' }}>{data.overview.totalVisitors.toLocaleString()}</p>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                        borderRadius: '15px',
                        padding: '12px',
                        boxShadow: '0 4px 15px rgba(244, 208, 63, 0.4)'
                      }}>
                        <Users className="h-8 w-8" style={{ color: '#800020' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card style={{
                  background: 'linear-gradient(135deg, rgba(244, 208, 63, 0.2) 0%, rgba(128, 0, 32, 0.2) 100%)',
                  backdropFilter: 'blur(15px)',
                  border: '2px solid rgba(244, 208, 63, 0.4)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 25px rgba(244, 208, 63, 0.3)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(135deg, rgba(244, 208, 63, 0.1) 0%, rgba(128, 0, 32, 0.1) 100%)',
                    backdropFilter: 'blur(10px)'
                  }}></div>
                  <CardContent className="p-6 relative z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold mb-2" style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>💰 Total Revenue</p>
                        <p className="text-3xl font-bold" style={{ color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>₹{(data.overview.totalRevenue / 10000000).toFixed(1)}Cr</p>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                        borderRadius: '15px',
                        padding: '12px',
                        boxShadow: '0 6px 20px rgba(244, 208, 63, 0.4)',
                        border: '2px solid rgba(244, 208, 63, 0.6)'
                      }}>
                        <DollarSign className="h-8 w-8" style={{ color: '#800020' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.15) 0%, rgba(30, 58, 138, 0.25) 100%)',
                  backdropFilter: 'blur(15px)',
                  border: '2px solid rgba(30, 58, 138, 0.4)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 25px rgba(30, 58, 138, 0.3)',
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold mb-2" style={{ color: '#f4d03f' }}>⭐ Satisfaction</p>
                        <p className="text-3xl font-bold" style={{ color: 'white' }}>{data.overview.averageSatisfaction.toFixed(1)}/5</p>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #f4d03f 0%, #d4af37 100%)',
                        borderRadius: '15px',
                        padding: '12px',
                        boxShadow: '0 4px 15px rgba(244, 208, 63, 0.4)'
                      }}>
                        <Star className="h-8 w-8" style={{ color: '#800020' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card style={{
                  background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.15) 0%, rgba(30, 58, 138, 0.15) 100%)',
                  backdropFilter: 'blur(15px)',
                  border: '2px solid rgba(244, 208, 63, 0.3)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 25px rgba(128, 0, 32, 0.2)',
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold mb-2" style={{ color: '#f4d03f' }}>📅 Bookings</p>
                        <p className="text-3xl font-bold" style={{ color: 'white' }}>{data.overview.totalBookings.toLocaleString()}</p>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                        borderRadius: '15px',
                        padding: '12px',
                        boxShadow: '0 4px 15px rgba(30, 58, 138, 0.4)'
                      }}>
                        <Calendar className="h-8 w-8" style={{ color: '#f4d03f' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.15) 0%, rgba(244, 208, 63, 0.15) 100%)',
                  backdropFilter: 'blur(15px)',
                  border: '2px solid rgba(30, 58, 138, 0.3)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 25px rgba(30, 58, 138, 0.2)',
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold mb-2" style={{ color: '#f4d03f' }}>🛍️ Active Vendors</p>
                        <p className="text-3xl font-bold" style={{ color: 'white' }}>{data.overview.activeVendors}</p>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                        borderRadius: '15px',
                        padding: '12px',
                        boxShadow: '0 4px 15px rgba(30, 58, 138, 0.4)'
                      }}>
                        <ShoppingBag className="h-8 w-8" style={{ color: '#f4d03f' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.15) 0%, rgba(244, 208, 63, 0.15) 100%)',
                  backdropFilter: 'blur(15px)',
                  border: '2px solid rgba(30, 58, 138, 0.3)',
                  borderRadius: '20px',
                  boxShadow: '0 8px 25px rgba(30, 58, 138, 0.2)',
                  transition: 'all 0.3s ease'
                }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold mb-2" style={{ color: '#f4d03f' }}>💬 Feedbacks</p>
                        <p className="text-3xl font-bold" style={{ color: 'white' }}>1</p>
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                        borderRadius: '15px',
                        padding: '12px',
                        boxShadow: '0 4px 15px rgba(30, 58, 138, 0.4)'
                      }}>
                        <Activity className="h-8 w-8" style={{ color: '#f4d03f' }} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Visitor Trends Chart */}
              <Card style={{
                background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.15) 0%, rgba(30, 58, 138, 0.15) 100%)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(244, 208, 63, 0.4)',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(128, 0, 32, 0.3)'
              }}>
                <CardHeader>
                  <CardTitle style={{
                    color: '#f4d03f',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    textShadow: '0 2px 4px rgba(244, 208, 63, 0.3)'
                  }}>📈 Visitor Trends Over Time</CardTitle>
                  <CardDescription style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1rem'
                  }}>Monthly visitor count and revenue trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={data.visitorTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(244, 208, 63, 0.2)" />
                      <XAxis dataKey="month" stroke="#f4d03f" />
                      <YAxis stroke="#f4d03f" />
                      <Tooltip 
                        contentStyle={{
                          background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.9) 0%, rgba(30, 58, 138, 0.9) 100%)',
                          border: '2px solid #f4d03f',
                          borderRadius: '12px',
                          color: 'white'
                        }}
                      />
                      <Area type="monotone" dataKey="visitors" stackId="1" stroke="#f4d03f" fill="rgba(244, 208, 63, 0.3)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Sentiment Trends */}
              <Card style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.15) 0%, rgba(244, 208, 63, 0.15) 100%)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(30, 58, 138, 0.4)',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(30, 58, 138, 0.3)'
              }}>
                <CardHeader>
                  <CardTitle style={{
                    color: '#f4d03f',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    textShadow: '0 2px 4px rgba(244, 208, 63, 0.3)'
                  }}>🧠 Sentiment Analysis Trends</CardTitle>
                  <CardDescription style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1rem'
                  }}>Daily sentiment analysis of tourist feedback</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.sentimentTrends.slice(-30)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(244, 208, 63, 0.2)" />
                      <XAxis dataKey="date" stroke="#f4d03f" />
                      <YAxis stroke="#f4d03f" />
                      <Tooltip 
                        contentStyle={{
                          background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(128, 0, 32, 0.9) 100%)',
                          border: '2px solid #f4d03f',
                          borderRadius: '12px',
                          color: 'white'
                        }}
                      />
                      <Line type="monotone" dataKey="positive" stroke="#00ff88" strokeWidth={3} name="Positive" />
                      <Line type="monotone" dataKey="negative" stroke="#ff4444" strokeWidth={3} name="Negative" />
                      <Line type="monotone" dataKey="neutral" stroke="#f4d03f" strokeWidth={3} name="Neutral" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Visitors Tab */}
          <TabsContent value="visitors" className="mt-8">
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Age Demographics */}
                <Card style={{
                  background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.15) 0%, rgba(30, 58, 138, 0.15) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(244, 208, 63, 0.4)',
                  borderRadius: '24px',
                  boxShadow: '0 8px 32px rgba(128, 0, 32, 0.3)'
                }}>
                  <CardHeader>
                    <CardTitle style={{
                      color: '#f4d03f',
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      textShadow: '0 2px 4px rgba(244, 208, 63, 0.3)'
                    }}>📈 Age Demographics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={data.demographics.ageGroups}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ group, percentage }) => `${group}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="percentage"
                        >
                          {data.demographics.ageGroups.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Origin States */}
                <Card style={{
                  background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.15) 0%, rgba(244, 208, 63, 0.15) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(30, 58, 138, 0.4)',
                  borderRadius: '24px',
                  boxShadow: '0 8px 32px rgba(30, 58, 138, 0.3)'
                }}>
                  <CardHeader>
                    <CardTitle style={{
                      color: '#f4d03f',
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      textShadow: '0 2px 4px rgba(244, 208, 63, 0.3)'
                    }}>🗺️ Visitor Origin States</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={data.demographics.origin}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="state" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#800020" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Travel Purpose */}
              <Card style={{
                background: 'linear-gradient(135deg, rgba(244, 208, 63, 0.15) 0%, rgba(128, 0, 32, 0.15) 100%)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(244, 208, 63, 0.4)',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(244, 208, 63, 0.3)'
              }}>
                <CardHeader>
                  <CardTitle style={{
                    color: '#f4d03f',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    textShadow: '0 2px 4px rgba(244, 208, 63, 0.3)'
                  }}>🎯 Travel Purpose Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {data.demographics.purpose.map((purpose, index) => (
                      <Card key={purpose.type}>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-[#800020] mb-2">
                            {purpose.percentage}%
                          </div>
                          <div className="text-sm font-medium">{purpose.type}</div>
                          <div className="text-xs text-muted-foreground">
                            {purpose.count.toLocaleString()} visitors
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Destinations Tab */}
          <TabsContent value="destinations" className="mt-8">
            <div className="space-y-8">
              <Card style={{
                background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.15) 0%, rgba(30, 58, 138, 0.15) 100%)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(244, 208, 63, 0.4)',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(128, 0, 32, 0.3)'
              }}>
                <CardHeader>
                  <CardTitle style={{
                    color: '#f4d03f',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    textShadow: '0 2px 4px rgba(244, 208, 63, 0.3)'
                  }}>🏛️ Destination Performance</CardTitle>
                  <CardDescription style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1rem'
                  }}>Visitor count, revenue, and satisfaction by destination</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.destinations.map((destination, index) => (
                      <div key={destination.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-[#800020]/10 rounded-full flex items-center justify-center">
                            <MapPin className="h-4 w-4 text-[#800020]" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{destination.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {destination.visitors.toLocaleString()} visitors
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-medium">₹{(destination.revenue / 1000000).toFixed(1)}M</p>
                            <p className="text-sm text-muted-foreground">Revenue</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-current text-[#f4d03f]" />
                              <span className="font-medium">{destination.satisfaction}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Rating</p>
                          </div>
                          <div className="text-right">
                            <div className={`flex items-center gap-1 ${destination.growth > 0 ? 'text-[#f4d03f]' : 'text-[#800020]'}`}>
                              {destination.growth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              <span className="font-medium">{destination.growth > 0 ? '+' : ''}{destination.growth}%</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Growth</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.15) 0%, rgba(244, 208, 63, 0.15) 100%)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(30, 58, 138, 0.4)',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(30, 58, 138, 0.3)'
              }}>
                <CardHeader>
                  <CardTitle style={{
                    color: '#f4d03f',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    textShadow: '0 2px 4px rgba(244, 208, 63, 0.3)'
                  }}>💰 Revenue by Destination</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={data.destinations}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => [`₹${(Number(value) / 1000000).toFixed(1)}M`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#1e3a8a" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Vendors Tab */}
          <TabsContent value="vendors" className="mt-8">
            <div className="space-y-8">
              <Card style={{
                background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.15) 0%, rgba(30, 58, 138, 0.15) 100%)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(244, 208, 63, 0.4)',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(128, 0, 32, 0.3)'
              }}>
                <CardHeader>
                  <CardTitle style={{
                    color: '#f4d03f',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    textShadow: '0 2px 4px rgba(244, 208, 63, 0.3)'
                  }}>🏆 Top Performing Vendors</CardTitle>
                  <CardDescription style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '1rem'
                  }}>Revenue, orders, and ratings by vendor</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.vendorPerformance.map((vendor, index) => (
                      <div key={vendor.name} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-[#f4d03f]/10 rounded-full flex items-center justify-center">
                            <Award className="h-4 w-4 text-[#f4d03f]" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{vendor.name}</h3>
                            <Badge variant="outline">{vendor.category}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="font-medium">₹{(vendor.revenue / 1000).toFixed(0)}K</p>
                            <p className="text-sm text-muted-foreground">Revenue</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{vendor.orders}</p>
                            <p className="text-sm text-muted-foreground">Orders</p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-current text-[#f4d03f]" />
                              <span className="font-medium">{vendor.rating}</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Rating</p>
                          </div>
                          <div className="text-right">
                            <div className={`flex items-center gap-1 ${vendor.growth > 0 ? 'text-[#f4d03f]' : 'text-[#800020]'}`}>
                              {vendor.growth > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                              <span className="font-medium">{vendor.growth > 0 ? '+' : ''}{vendor.growth}%</span>
                            </div>
                            <p className="text-sm text-muted-foreground">Growth</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.15) 0%, rgba(244, 208, 63, 0.15) 100%)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(30, 58, 138, 0.4)',
                borderRadius: '24px',
                boxShadow: '0 8px 32px rgba(30, 58, 138, 0.3)'
              }}>
                <CardHeader>
                  <CardTitle style={{
                    color: '#f4d03f',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    textShadow: '0 2px 4px rgba(244, 208, 63, 0.3)'
                  }}>📊 Vendor Revenue Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.vendorPerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, revenue }) => `${name}: ₹${(revenue / 1000).toFixed(0)}K`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                      >
                        {data.vendorPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`₹${(Number(value) / 1000).toFixed(0)}K`, 'Revenue']} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="mt-8">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card style={{
                  background: 'linear-gradient(135deg, rgba(128, 0, 32, 0.15) 0%, rgba(30, 58, 138, 0.15) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(244, 208, 63, 0.4)',
                  borderRadius: '24px',
                  boxShadow: '0 8px 32px rgba(128, 0, 32, 0.3)'
                }}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2" style={{
                      color: '#f4d03f',
                      fontSize: '1.5rem',
                      fontWeight: '800',
                      textShadow: '0 2px 4px rgba(244, 208, 63, 0.3)'
                    }}>
                      <Target className="h-5 w-5 text-[#f4d03f]" />
                      🎯 AI Predictions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Next Month Forecast</h4>
                      <p className="text-2xl font-bold text-[#800020]">
                        {data?.predictions?.nextMonthVisitors?.toLocaleString() || '2,300'} visitors
                      </p>
                      <p className="text-sm text-muted-foreground">
                        +15% increase expected
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Peak Season</h4>
                      <p className="text-foreground">{data?.predictions?.peakSeason || 'October-December'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Compass className="h-5 w-5 text-[#1e3a8a]" />
                      Emerging Destinations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(data?.predictions?.emergingDestinations || ['Palamau Fort', 'Rajrappa Temple', 'Lodh Falls']).map((destination, index) => (
                        <div key={destination} className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-[#f4d03f]" />
                          <span>{destination}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Risk Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(data?.predictions?.riskAreas || ['Transport connectivity', 'Accommodation quality', 'Language barriers']).map((area, index) => (
                        <div key={area} className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                          <span>{area}</span>
                          <Badge variant="destructive" className="ml-auto">Needs Attention</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5 text-purple-600" />
                      Recommended Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {(data?.predictions?.recommendedActions || [
                        'Improve transport infrastructure to remote destinations',
                        'Develop multilingual guide training programs', 
                        'Expand homestay capacity for peak season',
                        'Implement digital payment systems for vendors',
                        'Create emergency response protocols for tourist areas'
                      ]).map((action, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                          <span className="text-sm">{action}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>AI-Powered Insights Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-green-800">Growth Opportunity</h3>
                      <p className="text-sm text-green-700 mt-1">
                        Netarhat showing 22% growth potential for eco-tourism
                      </p>
                    </div>
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-yellow-800">Attention Needed</h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Service quality issues detected in 2 locations
                      </p>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold text-blue-800">Strategic Focus</h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Expand homestay capacity for upcoming peak season
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Performance Metrics */}
          <TabsContent value="ai-performance" className="mt-8">
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      AI Model Performance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Sentiment Analysis</span>
                          <span>94.2%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '94.2%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Voice Recognition</span>
                          <span>87.8%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '87.8%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Image Analysis</span>
                          <span>91.5%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{width: '91.5%'}}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-orange-600" />
                      Real-time Processing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Feedback Analyzed</span>
                        <Badge className="bg-green-100 text-green-800">1,247 today</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Voice Files</span>
                        <Badge className="bg-blue-100 text-blue-800">342 processed</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Images</span>
                        <Badge className="bg-purple-100 text-purple-800">156 analyzed</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Alerts Generated</span>
                        <Badge className="bg-red-100 text-red-800">3 critical</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-indigo-600" />
                      Prediction Accuracy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-600">89.3%</div>
                        <div className="text-sm text-muted-foreground">Overall Accuracy</div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Visitor Forecasting</span>
                          <span>92%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Revenue Prediction</span>
                          <span>88%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Risk Assessment</span>
                          <span>85%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* AI Insights Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    AI Sentiment Trend Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={[
                      { date: 'Jan', positive: 65, negative: 10, neutral: 25 },
                      { date: 'Feb', positive: 68, negative: 8, neutral: 24 },
                      { date: 'Mar', positive: 70, negative: 12, neutral: 18 },
                      { date: 'Apr', positive: 72, negative: 9, neutral: 19 },
                      { date: 'May', positive: 75, negative: 7, neutral: 18 },
                      { date: 'Jun', positive: 73, negative: 11, neutral: 16 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="positive" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="neutral" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="negative" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Sparkles className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-blue-800">AI-Powered Strategic Insights</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Based on advanced machine learning analysis of {data?.overview?.totalFeedbacks || 892} feedback entries
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">✅ Key Strengths Identified</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Natural beauty consistently praised (95% positive mentions)</li>
                      <li>• Local hospitality highly rated (4.6/5 average)</li>
                      <li>• Cultural experiences exceed expectations</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">⚠️ Areas for Improvement</h4>
                    <ul className="text-sm text-orange-700 space-y-1">
                      <li>• Transportation infrastructure (67% mention delays)</li>
                      <li>• Digital payment adoption needed (45% request)</li>
                      <li>• Language barrier concerns (23% of international visitors)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Database Tab */}
          <TabsContent value="database" className="mt-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-blue-600" />
                      Database Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Connection Status</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Records</span>
                        <span className="font-medium">{data?.overview.totalFeedbacks || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Storage Used</span>
                        <span className="font-medium">2.4 GB</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Last Backup</span>
                        <span className="font-medium">2 hours ago</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5 text-purple-600" />
                      AI Data Processing
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Processed Today</span>
                        <span className="font-medium">1,247 items</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Voice Analysis</span>
                        <Badge className="bg-blue-100 text-blue-800">342 files</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Image Recognition</span>
                        <Badge className="bg-green-100 text-green-800">156 images</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Sentiment Analysis</span>
                        <Badge className="bg-purple-100 text-purple-800">749 texts</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileSpreadsheet className="h-5 w-5 text-orange-600" />
                      Export Options
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button 
                        onClick={() => { setExportFormat('csv'); exportData(); }}
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as CSV
                      </Button>
                      <Button 
                        onClick={() => { setExportFormat('xlsx'); exportData(); }}
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-2" />
                        Export as Excel
                      </Button>
                      <Button 
                        onClick={() => { setExportFormat('pdf'); exportData(); }}
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Export as PDF Report
                      </Button>
                      <Button 
                        onClick={() => { setExportFormat('json'); exportData(); }}
                        variant="outline" 
                        className="w-full justify-start"
                      >
                        <Database className="h-4 w-4 mr-2" />
                        Export as JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Data Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent AI Analysis Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4 text-purple-600" />
                          <span className="text-sm">Sentiment Analysis</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">94.2% Accuracy</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">Voice Processing</span>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">87.8% Accuracy</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-green-600" />
                          <span className="text-sm">Image Recognition</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">91.5% Accuracy</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-orange-600" />
                          <span className="text-sm">Predictive Models</span>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800">89.3% Accuracy</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Database Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Query Performance</span>
                          <span>92%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '92%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Storage Efficiency</span>
                          <span>87%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{width: '87%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>AI Processing Speed</span>
                          <span>95%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-purple-500 h-2 rounded-full" style={{width: '95%'}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Data Integrity</span>
                          <span>99%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: '99%'}}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
