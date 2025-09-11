"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft,
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  RefreshCw,
  Star,
  CheckCircle,
  Plane,
  BarChart3,
  PieChart,
  Table,
  Download,
  Calendar,
  Target,
  Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { 
  getAdminStats, 
  getAdPerformanceData, 
  getAdPerformanceTable, 
  getCategoryPerformance, 
  getTopPerformingListings,
  type AdminStats,
  type AdPerformanceData,
  type AdPerformanceTable,
  type CategoryPerformance,
  type TopPerformingListing
} from '@/services/adminService';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // State for all data
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [adPerformanceData, setAdPerformanceData] = useState<AdPerformanceData[]>([]);
  const [adPerformanceTable, setAdPerformanceTable] = useState<AdPerformanceTable[]>([]);
  const [categoryPerformance, setCategoryPerformance] = useState<CategoryPerformance[]>([]);
  const [topListings, setTopListings] = useState<TopPerformingListing[]>([]);

  const fetchAllData = async () => {
    if (!user) return;
    
    try {
      const [
        statsData,
        adData,
        adTableData,
        categoryData,
        topListingsData
      ] = await Promise.all([
        getAdminStats(user.uid),
        getAdPerformanceData(user.uid),
        getAdPerformanceTable(user.uid),
        getCategoryPerformance(user.uid),
        getTopPerformingListings(user.uid)
      ]);

      setStats(statsData);
      setAdPerformanceData(adData);
      setAdPerformanceTable(adTableData);
      setCategoryPerformance(categoryData);
      setTopListings(topListingsData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
  };

  const handleBackToDashboard = () => {
    router.push('/admin');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Detailed Analytics</h1>
          <Button disabled size="sm">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Loading...
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            onClick={handleBackToDashboard}
            variant="ghost" 
            size="sm"
            className="flex items-center"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Detailed Analytics</h1>
        </div>
        <Button onClick={handleRefresh} disabled={refreshing} size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats?.totalSales.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-1">
                  {stats?.salesGrowth && stats.salesGrowth > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${stats?.salesGrowth && stats.salesGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats?.salesGrowth && stats.salesGrowth > 0 ? '+' : ''}{stats?.salesGrowth}%
                  </span>
                </div>
              </div>
              <div className="text-4xl text-blue-100">
                <DollarSign className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Active Listings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.activeListings || 0}
                </p>
                <div className="flex items-center mt-1">
                  <Target className="h-3 w-3 text-blue-500 mr-1" />
                  <span className="text-xs text-blue-600">
                    {stats?.activeListings || 0} items
                  </span>
                </div>
              </div>
              <div className="text-4xl text-blue-100">
                <Plane className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Success Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.successScore || 0}%
                </p>
                <div className="flex items-center mt-1">
                  <Award className="h-3 w-3 text-yellow-500 mr-1" />
                  <span className="text-xs text-yellow-600">
                    Excellent Performance
                  </span>
                </div>
              </div>
              <div className="text-4xl text-blue-100">
                <Star className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.averageRating || 0}
                </p>
                <div className="flex items-center mt-1">
                  <Star className="h-3 w-3 text-yellow-500 mr-1" />
                  <span className="text-xs text-yellow-600">
                    Customer Satisfaction
                  </span>
                </div>
              </div>
              <div className="text-4xl text-blue-100">
                <CheckCircle className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Performance Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="mr-2 h-4 w-4" />
              Weekly Performance Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-xs text-gray-600">Clicks</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-xs text-gray-600">Views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-700 rounded-full"></div>
                  <span className="text-xs text-gray-600">Inquiries</span>
                </div>
              </div>
              
              <div className="flex items-end justify-between h-32 space-x-1">
                {adPerformanceData.map((day, index) => {
                  const maxValue = Math.max(...adPerformanceData.map(d => Math.max(d.clicks, d.views, d.inquiries)));
                  return (
                    <div key={day.date} className="flex flex-col items-center space-y-1 flex-1">
                      <div className="flex items-end space-x-0.5 h-24">
                        <div 
                          className="w-4 bg-blue-500 rounded-t transition-all duration-300"
                          style={{ height: `${Math.max(2, (day.clicks / maxValue) * 100)}%` }}
                          title={`Clicks: ${day.clicks.toLocaleString()}`}
                        ></div>
                        <div 
                          className="w-4 bg-gray-400 rounded-t transition-all duration-300"
                          style={{ height: `${Math.max(2, (day.views / maxValue) * 100)}%` }}
                          title={`Views: ${day.views.toLocaleString()}`}
                        ></div>
                        <div 
                          className="w-4 bg-blue-700 rounded-t transition-all duration-300"
                          style={{ height: `${Math.max(2, (day.inquiries / maxValue) * 100)}%` }}
                          title={`Inquiries: ${day.inquiries.toLocaleString()}`}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-600">{day.date}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="text-center text-xs text-gray-500">
                Total: {adPerformanceData.reduce((sum, d) => sum + d.clicks, 0).toLocaleString()} clicks, 
                {adPerformanceData.reduce((sum, d) => sum + d.views, 0).toLocaleString()} views, 
                {adPerformanceData.reduce((sum, d) => sum + d.inquiries, 0).toLocaleString()} inquiries
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <PieChart className="mr-2 h-4 w-4" />
              Category Performance Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {categoryPerformance.map((item, index) => {
                      const total = categoryPerformance.reduce((sum, d) => sum + d.value, 0);
                      const percentage = (item.value / total) * 100;
                      const startAngle = categoryPerformance.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0);
                      const endAngle = startAngle + (item.value / total) * 360;
                      
                      const startAngleRad = (startAngle * Math.PI) / 180;
                      const endAngleRad = (endAngle * Math.PI) / 180;
                      
                      const x1 = 50 + 40 * Math.cos(startAngleRad);
                      const y1 = 50 + 40 * Math.sin(startAngleRad);
                      const x2 = 50 + 40 * Math.cos(endAngleRad);
                      const y2 = 50 + 40 * Math.sin(endAngleRad);
                      
                      const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
                      
                      const pathData = [
                        `M 50 50`,
                        `L ${x1} ${y1}`,
                        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                        'Z'
                      ].join(' ');
                      
                      return (
                        <path
                          key={item.category}
                          d={pathData}
                          fill={item.color}
                          stroke="white"
                          strokeWidth="1"
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                {categoryPerformance.map((item) => (
                  <div key={item.category} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-gray-600 truncate">{item.category}</span>
                    <span className="text-gray-400 font-medium">({item.value})</span>
                  </div>
                ))}
              </div>
              
              <div className="text-center text-xs text-gray-400">
                Total: {categoryPerformance.reduce((sum, d) => sum + d.value, 0)} clicks across {categoryPerformance.length} categories
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <span className="flex items-center">
              <Table className="mr-2 h-4 w-4" />
              Detailed Performance Analysis
            </span>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adPerformanceTable.map((ad) => (
              <div key={ad.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{ad.adTitle}</p>
                  <p className="text-sm text-gray-500">CTR: {ad.ctr.toFixed(1)}%</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge 
                    variant={ad.status === 'Active' ? 'default' : 'secondary'}
                    className={`text-sm ${ad.status === 'Active' ? 'bg-green-100 text-green-800' : ad.status === 'Featured' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    {ad.status}
                  </Badge>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Top Performing Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topListings.map((listing, index) => (
              <div key={listing.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{listing.title}</p>
                  <p className="text-xs text-gray-500">{listing.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-green-600">
                    ${listing.revenue.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
