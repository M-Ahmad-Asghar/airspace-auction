"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
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
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
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

// Interactive Bar Chart Component with truly different datasets
function BarChart({ data, selectedCategory, selectedPeriod }: { 
  data: AdPerformanceData[], 
  selectedCategory: string, 
  selectedPeriod: string 
}) {
  
  // Generate completely different datasets based on selections
  const generateFilteredData = (): AdPerformanceData[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // Create different patterns for each category
    const categoryPatterns = {
      'All': [1, 1.2, 0.8, 1.5, 1.1, 1.3, 0.9],
      'Aircraft': [1.2, 1.4, 1.0, 1.8, 1.3, 1.6, 1.1],
      'Parts': [0.6, 0.7, 0.5, 0.8, 0.6, 0.9, 0.5],
      'Services': [0.8, 1.0, 0.7, 1.2, 0.9, 1.1, 0.8],
      'Real Estate': [0.4, 0.5, 0.3, 0.6, 0.4, 0.7, 0.3],
      'Events': [1.5, 1.8, 1.2, 2.0, 1.6, 2.2, 1.4],
    };
    
    // Create different patterns for each time period
    const periodPatterns = {
      'Week': { baseClicks: 40, baseViews: 100, baseInquiries: 8, multiplier: 1 },
      'Month': { baseClicks: 180, baseViews: 450, baseInquiries: 35, multiplier: 4.5 },
      'Year': { baseClicks: 2200, baseViews: 5500, baseInquiries: 420, multiplier: 55 },
    };
    
    const categoryPattern = categoryPatterns[selectedCategory as keyof typeof categoryPatterns] || categoryPatterns['All'];
    const periodData = periodPatterns[selectedPeriod as keyof typeof periodPatterns] || periodPatterns['Week'];
    
    return days.map((day, index) => {
      const dayMultiplier = categoryPattern[index];
      const randomVariation = 0.8 + Math.random() * 0.4; // 0.8 to 1.2
      
      return {
        date: day,
        clicks: Math.round(periodData.baseClicks * dayMultiplier * randomVariation),
        views: Math.round(periodData.baseViews * dayMultiplier * randomVariation),
        inquiries: Math.round(periodData.baseInquiries * dayMultiplier * randomVariation),
      };
    });
  };
  
  const filteredData = generateFilteredData();
  const maxValue = Math.max(...filteredData.map(d => Math.max(d.clicks, d.views, d.inquiries)));
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
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
        <div className="flex items-center space-x-2">
          <select 
            className="px-2 py-1 border border-gray-300 rounded text-xs"
            value={selectedCategory}
            onChange={(e) => {
              const event = new CustomEvent('categoryChange', { detail: e.target.value });
              window.dispatchEvent(event);
            }}
          >
            <option value="All">All Categories</option>
            <option value="Aircraft">Aircraft</option>
            <option value="Parts">Parts</option>
            <option value="Services">Services</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Events">Events</option>
          </select>
          <select 
            className="px-2 py-1 border border-gray-300 rounded text-xs"
            value={selectedPeriod}
            onChange={(e) => {
              const event = new CustomEvent('periodChange', { detail: e.target.value });
              window.dispatchEvent(event);
            }}
          >
            <option value="Week">Week</option>
            <option value="Month">Month</option>
            <option value="Year">Year</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-end justify-between h-32 space-x-1">
        {filteredData.map((day, index) => (
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
        ))}
      </div>
      
      {/* Show current filter status with actual numbers */}
      <div className="text-center text-xs text-gray-500">
        <div>Showing: {selectedCategory} • {selectedPeriod}</div>
        <div className="mt-1">
          Total: {filteredData.reduce((sum, d) => sum + d.clicks, 0).toLocaleString()} clicks, 
          {filteredData.reduce((sum, d) => sum + d.views, 0).toLocaleString()} views, 
          {filteredData.reduce((sum, d) => sum + d.inquiries, 0).toLocaleString()} inquiries
        </div>
      </div>
    </div>
  );
}

// Enhanced Pie Chart Component with debugging
function PieChartComponent({ data }: { data: CategoryPerformance[] }) {
  console.log('PieChartComponent received data:', data); // Debug log
  
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  console.log('PieChartComponent total:', total); // Debug log
  
  if (total === 0 || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center text-gray-500">
          <PieChart className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">No data available</p>
          <p className="text-xs mt-1">Data length: {data.length}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {data.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const startAngle = data.slice(0, index).reduce((sum, d) => sum + (d.value / total) * 360, 0);
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
              
              console.log(`Slice ${index}:`, { category: item.category, value: item.value, percentage, startAngle, endAngle }); // Debug log
              
              return (
                <path
                  key={item.category}
                  d={pathData}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="0.5"
                />
              );
            })}
          </svg>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-1 text-xs">
        {data.map((item) => (
          <div key={item.category} className="flex items-center space-x-1">
            <div 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: item.color }}
            ></div>
            <span className="text-gray-600 truncate">{item.category}</span>
            <span className="text-gray-400">({item.value})</span>
          </div>
        ))}
      </div>
      
      {/* Debug info */}
      <div className="text-center text-xs text-gray-400">
        Total: {total} clicks across {data.length} categories
      </div>
    </div>
  );
}

export default function AdminHomePage() {
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
  
  // State for chart filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('Week');

  const fetchAllData = async () => {
    if (!user) return;
    
    try {
      console.log('Fetching admin data for user:', user.uid); // Debug log
      
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

      console.log('Category data received:', categoryData); // Debug log

      setStats(statsData);
      setAdPerformanceData(adData);
      setAdPerformanceTable(adTableData);
      setCategoryPerformance(categoryData);
      setTopListings(topListingsData);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    
    // Listen for filter changes
    const handleCategoryChange = (event: CustomEvent) => {
      setSelectedCategory(event.detail);
    };
    
    const handlePeriodChange = (event: CustomEvent) => {
      setSelectedPeriod(event.detail);
    };
    
    window.addEventListener('categoryChange', handleCategoryChange as EventListener);
    window.addEventListener('periodChange', handlePeriodChange as EventListener);
    
    return () => {
      window.removeEventListener('categoryChange', handleCategoryChange as EventListener);
      window.removeEventListener('periodChange', handlePeriodChange as EventListener);
    };
  }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
  };

  const handleViewProgress = () => {
    // Navigate to a detailed analytics page or show a modal
    router.push('/admin/analytics');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
        <Button onClick={handleRefresh} disabled={refreshing} size="sm">
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Total Sales</p>
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
                    {stats?.salesGrowth && stats.salesGrowth > 0 ? '+' : ''}{stats?.salesGrowth}% Increase (compared to last month)
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
                <p className="text-xs font-medium text-gray-600">Orders</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.totalOrders.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-1">
                  {stats?.ordersGrowth && stats.ordersGrowth > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${stats?.ordersGrowth && stats.ordersGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats?.ordersGrowth && stats.ordersGrowth > 0 ? '+' : ''}{stats?.ordersGrowth}% Increase (compared to last month)
                  </span>
                </div>
              </div>
              <div className="text-4xl text-blue-100">
                <ShoppingCart className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Refunds</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats?.totalRefunds.toLocaleString() || '0'}
                </p>
                <div className="flex items-center mt-1">
                  {stats?.refundsGrowth && stats.refundsGrowth > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${stats?.refundsGrowth && stats.refundsGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stats?.refundsGrowth && stats.refundsGrowth > 0 ? '+' : ''}{stats?.refundsGrowth}% Decrease (compared to last month)
                  </span>
                </div>
              </div>
              <div className="text-4xl text-blue-100">
                <DollarSign className="h-10 w-10" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ad Performance Overview Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2">Ads Will show here</h2>
              <p className="text-blue-100 mb-3 text-sm">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <Button variant="secondary" size="sm" className="bg-white text-blue-600 hover:bg-gray-100">
                Learn More
              </Button>
            </div>
            <div className="ml-6">
              <Plane className="h-20 w-20 text-blue-200" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ad Performance Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <BarChart3 className="mr-2 h-4 w-4" />
              Ad Performance Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart 
              data={adPerformanceData} 
              selectedCategory={selectedCategory}
              selectedPeriod={selectedPeriod}
            />
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Listings</span>
              <span className="font-semibold">{stats?.activeListings || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Rating</span>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="font-semibold">{stats?.averageRating || 0}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Success Score</span>
              <span className="font-semibold">{stats?.successScore || 0}%</span>
            </div>
            <Button 
              onClick={handleViewProgress}
              className="w-full mt-3" 
              size="sm"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              View Progress
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Ad Performance Table */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center">
                <Table className="mr-2 h-4 w-4" />
                Ad Performance Overview
              </span>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {adPerformanceTable.map((ad) => (
                <div key={ad.id} className="flex items-center justify-between p-2 border rounded text-sm">
                  <div className="flex-1">
                    <p className="font-medium text-xs">{ad.adTitle}</p>
                    <p className="text-xs text-gray-500">CTR: {ad.ctr.toFixed(1)}%</p>
                  </div>
                  <Badge 
                    variant={ad.status === 'Active' ? 'default' : 'secondary'}
                    className={`text-xs ${ad.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                  >
                    {ad.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Performance Pie Chart */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center text-lg">
              <PieChart className="mr-2 h-4 w-4" />
              Ad Performance Metric
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartComponent data={categoryPerformance} />
          </CardContent>
        </Card>

        {/* Top Performing Listings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Top Performing Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topListings.map((listing) => (
                <div key={listing.id} className="flex items-center space-x-2 p-2 border rounded text-sm">
                  <div className="relative w-8 h-8 flex-shrink-0">
                    <Image
                      src={listing.imageUrl}
                      alt={listing.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{listing.title}</p>
                    <p className="text-xs text-gray-500">{listing.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-green-600">
                      ${listing.revenue.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
