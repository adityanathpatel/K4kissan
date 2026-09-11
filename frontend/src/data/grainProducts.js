export const grainProducts = [
  // --- RICE VARIETIES ---
  {
    id: 'g-rice-1',
    name: '1121 Extra Long Raw Basmati Rice',
    variety: 'Basmati 1121',
    category: 'rice',
    price: 120,
    unit: 'kg',
    image: '/images/basmati_rice.jpg',
    images: [
      '/images/basmati_rice.jpg',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'
    ],
    video_url: '/videos/splash.mp4',
    rating: 4.9,
    reviewCount: 184,
    organic: true,
    harvestDate: 'August 2026',
    description: 'Aged 2 years for aromatic extra-long grains that stay fluffy after cooking.',
    farmer: {
      id: 'f-101',
      name: 'Sardar Gurpreet Singh',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      location: 'Karnal, Haryana',
      rating: 4.95,
      ratingCount: 312,
      experience: '22 Years Organic Farming',
      farmSize: '18 Acres Organic Farm',
      verified: true,
      badge: 'Master Rice Grower',
      totalSales: '420,000+ kg Sold',
      bio: 'Pioneer in organic basmati rice farming in Karnal belt. Cultivated using natural jeevamrut and canal irrigation without synthetic pesticides.',
      qualityRating: '5.0',
      deliveryRating: '4.9',
      purityTrust: '5.0'
    }
  },
  {
    id: 'g-rice-2',
    name: 'Organic Whole Grain Brown Rice',
    variety: 'Unpolished Brown Rice',
    category: 'rice',
    price: 95,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&q=80&w=800',
      '/images/basmati_rice.jpg'
    ],
    video_url: '',
    rating: 4.7,
    reviewCount: 92,
    organic: true,
    harvestDate: 'July 2026',
    description: 'High-fiber, unpolished brown rice rich in natural minerals and bran nutrients.',
    farmer: {
      id: 'f-102',
      name: 'Channappa Gowda',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
      location: 'Mandya, Karnataka',
      rating: 4.85,
      ratingCount: 145,
      experience: '15 Years Sustainable Farming',
      farmSize: '12 Acres Traditional Farm',
      verified: true,
      badge: 'Certified Organic',
      totalSales: '180,000+ kg Sold',
      bio: 'Third-generation paddy farmer from Mandya specializing in nutrient-dense unpolished grain varieties.',
      qualityRating: '4.8',
      deliveryRating: '4.9',
      purityTrust: '4.9'
    }
  },

  // --- WHEAT VARIETIES ---
  {
    id: 'g-wheat-1',
    name: 'MP Sharbati Golden Wheat Grain',
    variety: 'Sharbati Gold',
    category: 'wheat',
    price: 65,
    unit: 'kg',
    image: '/images/sharbati_wheat.jpg',
    images: [
      '/images/sharbati_wheat.jpg',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'
    ],
    video_url: '/videos/splash.mp4',
    rating: 4.9,
    reviewCount: 210,
    organic: true,
    harvestDate: 'August 2026',
    description: 'Naturally sweet, golden Sharbati wheat grains from the fertile Narmada valley.',
    farmer: {
      id: 'f-103',
      name: 'Rameshwar Patel',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
      location: 'Sehore, Madhya Pradesh',
      rating: 4.92,
      ratingCount: 420,
      experience: '20 Years Wheat Farming',
      farmSize: '25 Acres Sharbati Belt',
      verified: true,
      badge: 'Sharbati Specialist',
      totalSales: '550,000+ kg Sold',
      bio: 'Dedicated to growing authentic rain-fed Sharbati wheat that produces soft, sweet rotis naturally.',
      qualityRating: '4.9',
      deliveryRating: '4.9',
      purityTrust: '5.0'
    }
  },
  {
    id: 'g-wheat-2',
    name: 'Khapli Emmer Ancient Wheat Grain',
    variety: 'Emmer / Khapli',
    category: 'wheat',
    price: 85,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
      '/images/sharbati_wheat.jpg',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'
    ],
    video_url: '',
    rating: 4.8,
    reviewCount: 78,
    organic: true,
    harvestDate: 'June 2026',
    description: 'Low-gluten diabetic-friendly ancient heirloom wheat rich in dietary fiber.',
    farmer: {
      id: 'f-104',
      name: 'Sunita Devi',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
      location: 'Solapur, Maharashtra',
      rating: 4.88,
      ratingCount: 160,
      experience: '12 Years Heirloom Grain Farming',
      farmSize: '10 Acres Bio-diverse Farm',
      verified: true,
      badge: 'Heirloom Grain Preserver',
      totalSales: '120,000+ kg Sold',
      bio: 'Preserving ancient indigenous Khapli wheat varieties using zero-budget natural farming techniques.',
      qualityRating: '4.9',
      deliveryRating: '4.8',
      purityTrust: '4.9'
    }
  },

  // --- MAIZE VARIETIES ---
  {
    id: 'g-maize-1',
    name: 'Desi Golden Yellow Maize Corn Grains',
    variety: 'Yellow Flint Corn',
    category: 'maize',
    price: 45,
    unit: 'kg',
    image: '/images/yellow_maize.jpg',
    images: [
      '/images/yellow_maize.jpg',
      'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'
    ],
    video_url: '/videos/splash.mp4',
    rating: 4.8,
    reviewCount: 134,
    organic: true,
    harvestDate: 'July 2026',
    description: 'Sun-dried high protein yellow corn grains ideal for poultry feed or corn flour.',
    farmer: {
      id: 'f-105',
      name: 'Rajendra Singh Gurjar',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200',
      location: 'Chhindwara, Madhya Pradesh',
      rating: 4.87,
      ratingCount: 215,
      experience: '16 Years Crop Cultivation',
      farmSize: '20 Acres Corn Belt',
      verified: true,
      badge: 'Corn Producer of the Year',
      totalSales: '380,000+ kg Sold',
      bio: 'Specializing in non-GMO yellow corn varieties harvested at optimal moisture content.',
      qualityRating: '4.8',
      deliveryRating: '4.9',
      purityTrust: '4.8'
    }
  },

  // --- SORGHUM VARIETIES ---
  {
    id: 'g-sorghum-1',
    name: 'Maldandi White Jowar Grain (Sorghum)',
    variety: 'Maldandi White Jowar',
    category: 'sorghum',
    price: 75,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'
    ],
    video_url: '/videos/splash.mp4',
    rating: 4.9,
    reviewCount: 165,
    organic: true,
    harvestDate: 'August 2026',
    description: 'Premium white Maldandi Jowar, naturally gluten-free and packed with calcium & iron.',
    farmer: {
      id: 'f-106',
      name: 'Babu Rao Deshmukh',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
      location: 'Latur, Maharashtra',
      rating: 4.93,
      ratingCount: 290,
      experience: '25 Years Millet Cultivation',
      farmSize: '15 Acres Dryland Farming',
      verified: true,
      badge: 'Millet Pioneer',
      totalSales: '290,000+ kg Sold',
      bio: 'Growing drought-resilient organic Maldandi Jowar in the Marathwada region with natural compost.',
      qualityRating: '5.0',
      deliveryRating: '4.8',
      purityTrust: '5.0'
    }
  },

  // --- PEARL MILLET VARIETIES ---
  {
    id: 'g-pearl-millet-1',
    name: 'Desi Organic Pearl Millet (Bajra)',
    variety: 'Desi Bajra Grain',
    category: 'pearl-millet',
    price: 55,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
      '/images/yellow_maize.jpg'
    ],
    video_url: '',
    rating: 4.8,
    reviewCount: 112,
    organic: true,
    harvestDate: 'August 2026',
    description: 'Iron-rich organic Bajra grains ideal for winter rotis and wholesome khichdi.',
    farmer: {
      id: 'f-107',
      name: 'Vikram Singh Shekhawat',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
      location: 'Nagaur, Rajasthan',
      rating: 4.89,
      ratingCount: 180,
      experience: '14 Years Arid Land Farming',
      farmSize: '22 Acres Organic Bajra',
      verified: true,
      badge: 'Desert Millet Expert',
      totalSales: '210,000+ kg Sold',
      bio: 'Harvesting traditional desert Bajra rich in natural protein without any chemical fertilizers.',
      qualityRating: '4.9',
      deliveryRating: '4.8',
      purityTrust: '4.9'
    }
  },

  // --- FINGER MILLET VARIETIES ---
  {
    id: 'g-finger-millet-1',
    name: 'Organically Grown Red Ragi Grains',
    variety: 'Red Finger Millet',
    category: 'finger-millet',
    price: 68,
    unit: 'kg',
    image: '/images/organic_ragi.jpg',
    images: [
      '/images/organic_ragi.jpg',
      'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'
    ],
    video_url: '/videos/splash.mp4',
    rating: 4.9,
    reviewCount: 230,
    organic: true,
    harvestDate: 'July 2026',
    description: 'Calcium-rich red Ragi grains ideal for porridge, Dosa, and healthy baby food.',
    farmer: {
      id: 'f-108',
      name: 'Kavita Sharma',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
      location: 'Hassan, Karnataka',
      rating: 4.96,
      ratingCount: 340,
      experience: '17 Years Women Farmer Collective',
      farmSize: '14 Acres Certified Organic',
      verified: true,
      badge: 'Superfood Innovator',
      totalSales: '310,000+ kg Sold',
      bio: 'Leading a women organic farming cooperative producing ultra-clean, stone-free Ragi grains.',
      qualityRating: '5.0',
      deliveryRating: '4.9',
      purityTrust: '5.0'
    }
  },

  // --- BARLEY VARIETIES ---
  {
    id: 'g-barley-1',
    name: 'Natural Hulled Organic Barley Grain (Jau)',
    variety: 'Hulled Jau Grain',
    category: 'barley',
    price: 50,
    unit: 'kg',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=600',
    images: [
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
      '/images/sharbati_wheat.jpg',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&q=80&w=800'
    ],
    video_url: '/videos/splash.mp4',
    rating: 4.7,
    reviewCount: 88,
    organic: true,
    harvestDate: 'August 2026',
    description: 'Cleaned barley grains known for cooling digestive water, soups, and multigrain flour.',
    farmer: {
      id: 'f-109',
      name: 'Harish Kumar Saini',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200',
      location: 'Bhiwani, Haryana',
      rating: 4.84,
      ratingCount: 128,
      experience: '11 Years Cereal Farming',
      farmSize: '16 Acres Grain Farm',
      verified: true,
      badge: 'Quality Assured',
      totalSales: '140,000+ kg Sold',
      bio: 'Cultivating pure Jau barley grains using sustainable ground water conservation methods.',
      qualityRating: '4.8',
      deliveryRating: '4.8',
      purityTrust: '4.8'
    }
  }
];
