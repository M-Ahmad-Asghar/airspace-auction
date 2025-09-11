const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc } = require('firebase/firestore');

// Firebase configuration - replace with your actual config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-project.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-project.appspot.com",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dummy ad performance data
const adPerformanceData = [
  {
    userId: 'demo-user-1',
    adId: 'ad-001',
    adTitle: 'Cessna 172 Skyhawk - Excellent Condition',
    category: 'Aircraft',
    date: '2025-01-15',
    clicks: 45,
    views: 120,
    inquiries: 8,
    impressions: 500,
    ctr: 9.0,
    conversionRate: 6.7,
    cost: 150.00,
    revenue: 285000,
    status: 'Active'
  },
  {
    userId: 'demo-user-1',
    adId: 'ad-002',
    adTitle: 'Pilatus PC-12 Turboprop',
    category: 'Aircraft',
    date: '2025-01-15',
    clicks: 52,
    views: 135,
    inquiries: 12,
    impressions: 600,
    ctr: 8.7,
    conversionRate: 23.1,
    cost: 200.00,
    revenue: 4500000,
    status: 'Featured'
  },
  {
    userId: 'demo-user-1',
    adId: 'ad-003',
    adTitle: 'Lycoming O-320 Engine',
    category: 'Parts',
    date: '2025-01-15',
    clicks: 38,
    views: 98,
    inquiries: 6,
    impressions: 400,
    ctr: 9.5,
    conversionRate: 15.8,
    cost: 100.00,
    revenue: 45000,
    status: 'Active'
  },
  {
    userId: 'demo-user-1',
    adId: 'ad-004',
    adTitle: 'Aircraft Maintenance Services',
    category: 'Services',
    date: '2025-01-15',
    clicks: 61,
    views: 156,
    inquiries: 15,
    impressions: 700,
    ctr: 8.7,
    conversionRate: 24.6,
    cost: 80.00,
    revenue: 2250,
    status: 'Active'
  },
  {
    userId: 'demo-user-1',
    adId: 'ad-005',
    adTitle: 'Hangar with Office Space',
    category: 'Real Estate',
    date: '2025-01-15',
    clicks: 48,
    views: 142,
    inquiries: 9,
    impressions: 550,
    ctr: 8.7,
    conversionRate: 18.8,
    cost: 300.00,
    revenue: 750000,
    status: 'Paused'
  },
  {
    userId: 'demo-user-1',
    adId: 'ad-006',
    adTitle: 'Airshow 2024 Tickets',
    category: 'Events',
    date: '2025-01-15',
    clicks: 55,
    views: 168,
    inquiries: 18,
    impressions: 800,
    ctr: 6.9,
    conversionRate: 32.7,
    cost: 50.00,
    revenue: 900,
    status: 'Active'
  }
];

// Weekly performance data for the last 7 days
const weeklyPerformanceData = [
  { date: '2025-01-09', clicks: 42, views: 125, inquiries: 7, impressions: 580 },
  { date: '2025-01-10', clicks: 48, views: 142, inquiries: 9, impressions: 650 },
  { date: '2025-01-11', clicks: 35, views: 95, inquiries: 5, impressions: 480 },
  { date: '2025-01-12', clicks: 58, views: 165, inquiries: 16, impressions: 720 },
  { date: '2025-01-13', clicks: 45, views: 128, inquiries: 8, impressions: 590 },
  { date: '2025-01-14', clicks: 52, views: 148, inquiries: 11, impressions: 680 },
  { date: '2025-01-15', clicks: 61, views: 156, inquiries: 15, impressions: 700 }
];

// Category performance data
const categoryPerformanceData = [
  { category: 'Aircraft', totalClicks: 97, totalViews: 255, totalInquiries: 20, totalRevenue: 4785000 },
  { category: 'Parts', totalClicks: 38, totalViews: 98, totalInquiries: 6, totalRevenue: 45000 },
  { category: 'Services', totalClicks: 61, totalViews: 156, totalInquiries: 15, totalRevenue: 2250 },
  { category: 'Real Estate', totalClicks: 48, totalViews: 142, totalInquiries: 9, totalRevenue: 750000 },
  { category: 'Events', totalClicks: 55, totalViews: 168, totalInquiries: 18, totalRevenue: 900 },
  { category: 'Places', totalClicks: 25, totalViews: 78, totalInquiries: 4, totalRevenue: 1200 }
];

async function addAdPerformanceData() {
  try {
    console.log('🚀 Starting to add ad performance data...');

    // Add individual ad performance records
    for (const adData of adPerformanceData) {
      await addDoc(collection(db, 'adPerformance'), {
        ...adData,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log(`✅ Added ad performance data for: ${adData.adTitle}`);
    }

    // Add weekly performance summary
    await setDoc(doc(db, 'performanceSummary', 'weekly'), {
      userId: 'demo-user-1',
      period: 'weekly',
      data: weeklyPerformanceData,
      totalClicks: weeklyPerformanceData.reduce((sum, day) => sum + day.clicks, 0),
      totalViews: weeklyPerformanceData.reduce((sum, day) => sum + day.views, 0),
      totalInquiries: weeklyPerformanceData.reduce((sum, day) => sum + day.inquiries, 0),
      totalImpressions: weeklyPerformanceData.reduce((sum, day) => sum + day.impressions, 0),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Added weekly performance summary');

    // Add category performance summary
    await setDoc(doc(db, 'performanceSummary', 'category'), {
      userId: 'demo-user-1',
      period: 'category',
      data: categoryPerformanceData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✅ Added category performance summary');

    // Add user analytics summary
    await setDoc(doc(db, 'userAnalytics', 'demo-user-1'), {
      userId: 'demo-user-1',
      totalAds: adPerformanceData.length,
      totalClicks: adPerformanceData.reduce((sum, ad) => sum + ad.clicks, 0),
      totalViews: adPerformanceData.reduce((sum, ad) => sum + ad.views, 0),
      totalInquiries: adPerformanceData.reduce((sum, ad) => sum + ad.inquiries, 0),
      totalRevenue: adPerformanceData.reduce((sum, ad) => sum + ad.revenue, 0),
      totalCost: adPerformanceData.reduce((sum, ad) => sum + ad.cost, 0),
      averageCTR: adPerformanceData.reduce((sum, ad) => sum + ad.ctr, 0) / adPerformanceData.length,
      averageConversionRate: adPerformanceData.reduce((sum, ad) => sum + ad.conversionRate, 0) / adPerformanceData.length,
      lastUpdated: new Date(),
      createdAt: new Date()
    });
    console.log('✅ Added user analytics summary');

    console.log('🎉 Successfully added all ad performance data!');
    console.log(`📊 Added ${adPerformanceData.length} ad performance records`);
    console.log('📈 Added weekly performance summary');
    console.log('📊 Added category performance summary');
    console.log('👤 Added user analytics summary');

  } catch (error) {
    console.error('❌ Error adding ad performance data:', error);
  }
}

// Run the script
addAdPerformanceData().then(() => {
  console.log('✅ Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
