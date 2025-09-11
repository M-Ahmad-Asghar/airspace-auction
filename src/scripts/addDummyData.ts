import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Firebase config - you'll need to replace with your actual config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dummyListings = [
  {
    userId: 'dummy-user-1',
    category: 'Aircraft',
    type: 'Piston Single',
    title: 'Cessna 172 Skyhawk',
    manufacturer: 'Cessna',
    model: '172',
    year: 2018,
    price: 285000,
    location: 'Phoenix, AZ',
    description: 'Excellent condition Cessna 172 with low hours and recent annual inspection.',
    registration: 'N123AB',
    totalAirframeTime: 1250,
    engineTimeMin: 1200,
    engineTimeMax: 1250,
    engineDetails: 'Lycoming O-320-D2J',
    propellerType: 'Fixed Pitch',
    propellerTimeMin: 1200,
    propellerTimeMax: 1250,
    propellerDetails: 'McCauley 1A175',
    propellerSerials: '123456',
    avionics: 'Garmin G1000',
    additional: 'GPS, Transponder, ADS-B',
    exteriorDetails: 'White with blue trim, excellent paint',
    interiorDetails: 'Leather seats, updated interior',
    inspectionStatus: 'Annual completed 2024',
    ifr: 'IFR Certified',
    imageUrls: [
      'https://placehold.co/600x400/3B82F6/FFFFFF?text=Cessna+172',
      'https://placehold.co/600x400/10B981/FFFFFF?text=Interior',
      'https://placehold.co/600x400/F59E0B/FFFFFF?text=Engine'
    ],
    createdAt: serverTimestamp(),
  },
  {
    userId: 'dummy-user-1',
    category: 'Aircraft',
    type: 'Turboprop',
    title: 'Pilatus PC-12',
    manufacturer: 'Pilatus',
    model: 'PC-12',
    year: 2020,
    price: 4500000,
    location: 'Denver, CO',
    description: 'Low-time Pilatus PC-12 with full glass cockpit and premium interior.',
    registration: 'N456CD',
    totalAirframeTime: 850,
    engineTimeMin: 800,
    engineTimeMax: 850,
    engineDetails: 'Pratt & Whitney PT6A-67B',
    propellerType: 'Hartzell 5-blade',
    propellerTimeMin: 800,
    propellerTimeMax: 850,
    propellerDetails: 'Hartzell HC-E5N-3D',
    propellerSerials: '789012',
    avionics: 'Honeywell Primus Apex',
    additional: 'Weather radar, TCAS, TAWS',
    exteriorDetails: 'White with gold trim',
    interiorDetails: 'Executive configuration, 8 seats',
    inspectionStatus: 'Annual completed 2024',
    ifr: 'IFR Certified',
    imageUrls: [
      'https://placehold.co/600x400/8B5CF6/FFFFFF?text=Pilatus+PC-12',
      'https://placehold.co/600x400/EC4899/FFFFFF?text=Cockpit'
    ],
    createdAt: serverTimestamp(),
  },
  {
    userId: 'dummy-user-1',
    category: 'Parts',
    title: 'Lycoming O-320 Engine',
    manufacturer: 'Lycoming',
    model: 'O-320-D2J',
    year: 2015,
    price: 45000,
    location: 'Miami, FL',
    description: 'Overhauled Lycoming O-320 engine with zero time since overhaul.',
    hours: 0,
    upgrade: true,
    imageUrls: [
      'https://placehold.co/600x400/EF4444/FFFFFF?text=Lycoming+Engine'
    ],
    createdAt: serverTimestamp(),
  },
  {
    userId: 'dummy-user-1',
    category: 'Services',
    title: 'Aircraft Maintenance Services',
    manufacturer: 'Professional Aviation',
    price: 150,
    location: 'Los Angeles, CA',
    description: 'Professional aircraft maintenance and inspection services.',
    upgrade: false,
    imageUrls: [
      'https://placehold.co/600x400/06B6D4/FFFFFF?text=Maintenance'
    ],
    createdAt: serverTimestamp(),
  },
  {
    userId: 'dummy-user-1',
    category: 'Real Estate',
    title: 'Hangar with Office Space',
    price: 750000,
    location: 'Austin, TX',
    description: 'Modern hangar with attached office space, perfect for aircraft storage and business operations.',
    beds: 0,
    baths: 2,
    hangerIncluded: 'Yes',
    upgrade: true,
    imageUrls: [
      'https://placehold.co/600x400/84CC16/FFFFFF?text=Hangar'
    ],
    createdAt: serverTimestamp(),
  },
  {
    userId: 'dummy-user-1',
    category: 'Events',
    title: 'Airshow 2024',
    price: 50,
    location: 'Oshkosh, WI',
    description: 'Annual airshow featuring vintage aircraft and aerobatic displays.',
    date: new Date('2024-07-29'),
    upgrade: false,
    imageUrls: [
      'https://placehold.co/600x400/F97316/FFFFFF?text=Airshow'
    ],
    createdAt: serverTimestamp(),
  },
  {
    userId: 'dummy-user-1',
    category: 'Aircraft',
    type: 'Jets',
    title: 'Cessna Citation CJ3',
    manufacturer: 'Cessna',
    model: 'Citation CJ3',
    year: 2019,
    price: 8500000,
    location: 'New York, NY',
    description: 'Low-time Citation CJ3 with full maintenance records.',
    registration: 'N789EF',
    totalAirframeTime: 1200,
    engineTimeMin: 1100,
    engineTimeMax: 1200,
    engineDetails: 'Williams FJ44-3A',
    propellerType: 'N/A',
    propellerTimeMin: 0,
    propellerTimeMax: 0,
    propellerDetails: 'N/A',
    propellerSerials: 'N/A',
    avionics: 'Garmin G3000',
    additional: 'Weather radar, TCAS',
    exteriorDetails: 'White with blue trim',
    interiorDetails: 'Executive configuration',
    inspectionStatus: 'Annual completed 2024',
    ifr: 'IFR Certified',
    imageUrls: [
      'https://placehold.co/600x400/6366F1/FFFFFF?text=Citation+CJ3'
    ],
    createdAt: serverTimestamp(),
  },
  {
    userId: 'dummy-user-1',
    category: 'Parts',
    title: 'Garmin G1000 System',
    manufacturer: 'Garmin',
    model: 'G1000',
    year: 2022,
    price: 85000,
    location: 'Seattle, WA',
    description: 'Complete Garmin G1000 glass cockpit system, removed from aircraft.',
    hours: 500,
    upgrade: true,
    imageUrls: [
      'https://placehold.co/600x400/14B8A6/FFFFFF?text=Garmin+G1000'
    ],
    createdAt: serverTimestamp(),
  }
];

async function addDummyData() {
  try {
    console.log('Adding dummy data to Firebase...');
    
    for (const listing of dummyListings) {
      const docRef = await addDoc(collection(db, 'listings'), listing);
      console.log(`Added listing with ID: ${docRef.id}`);
    }
    
    console.log('Successfully added all dummy listings!');
  } catch (error) {
    console.error('Error adding dummy data:', error);
  }
}

// Run the function
addDummyData();
