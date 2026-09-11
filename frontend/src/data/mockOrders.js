export const mockOrders = [
  {
    id: 'ORD-9821',
    created_at: '2026-09-07T14:30:00Z',
    status: 'pending',
    total_amount: 6000,
    shipping_address: 'Flat 402, Green Valley Apartments, Indiranagar, Bengaluru - 560038',
    payment_status: 'Pending on Delivery',
    payment_method: 'Cash on Delivery / UPI',
    estimated_delivery: 'Sept 10, 2026',
    farmer: {
      name: 'Sardar Gurpreet Singh',
      location: 'Karnal, Haryana',
      phone: '+91 98765 43210'
    },
    buyer: {
      full_name: 'Ananya Deshmukh',
      location: 'Bengaluru, Karnataka',
      phone: '+91 98201 45678',
      email: 'ananya.deshmukh@example.com'
    },
    order_items: [
      {
        id: 'item-1',
        name: '1121 Extra Long Raw Basmati Rice',
        quantity: 50,
        price_per_unit: 120,
        price: 120,
        unit: 'kg',
        product: {
          name: '1121 Extra Long Raw Basmati Rice',
          image_url: '/images/basmati_rice.jpg',
          category: 'Rice'
        }
      }
    ]
  },
  {
    id: 'ORD-9822',
    created_at: '2026-09-07T10:15:00Z',
    status: 'confirmed',
    total_amount: 6500,
    shipping_address: 'Plot 12, APMC Market Yard, Pune - 411037',
    payment_status: 'Paid Online',
    payment_method: 'UPI Direct (K4kissan Escrow)',
    estimated_delivery: 'Sept 09, 2026',
    farmer: {
      name: 'Rameshwar Patel',
      location: 'Sehore, Madhya Pradesh',
      phone: '+91 98123 76543'
    },
    buyer: {
      full_name: 'Rajesh Aggarwal',
      location: 'Pune, Maharashtra',
      phone: '+91 98111 22334',
      email: 'rajesh.grain@aggarwaltraders.in'
    },
    order_items: [
      {
        id: 'item-2',
        name: 'MP Sharbati Golden Wheat Grain',
        quantity: 100,
        price_per_unit: 65,
        price: 65,
        unit: 'kg',
        product: {
          name: 'MP Sharbati Golden Wheat Grain',
          image_url: '/images/sharbati_wheat.jpg',
          category: 'Wheat'
        }
      }
    ]
  },
  {
    id: 'ORD-8710',
    created_at: '2026-09-02T16:00:00Z',
    status: 'delivered',
    total_amount: 1700,
    shipping_address: 'House #45, Koramangala 4th Block, Bengaluru - 560034',
    payment_status: 'Paid',
    payment_method: 'UPI / Online',
    delivered_at: '2026-09-04T12:00:00Z',
    farmer: {
      name: 'Kavita Sharma',
      location: 'Hassan, Karnataka',
      phone: '+91 94480 11223'
    },
    buyer: {
      full_name: 'Meera Krishnan',
      location: 'Bengaluru, Karnataka',
      phone: '+91 94481 99887',
      email: 'meera.krishnan@example.com'
    },
    order_items: [
      {
        id: 'item-3',
        name: 'Organically Grown Red Ragi Grains',
        quantity: 25,
        price_per_unit: 68,
        price: 68,
        unit: 'kg',
        product: {
          name: 'Organically Grown Red Ragi Grains',
          image_url: '/images/organic_ragi.jpg',
          category: 'Finger Millet'
        }
      }
    ]
  },
  {
    id: 'ORD-8650',
    created_at: '2026-08-28T11:20:00Z',
    status: 'delivered',
    total_amount: 9000,
    shipping_address: 'Shop #8, Grain Merchant Lane, Dadar Market, Mumbai - 400028',
    payment_status: 'Paid',
    payment_method: 'Bank Transfer',
    delivered_at: '2026-08-30T15:30:00Z',
    farmer: {
      name: 'Rajendra Singh Gurjar',
      location: 'Chhindwara, Madhya Pradesh',
      phone: '+91 97555 88990'
    },
    buyer: {
      full_name: 'Vikramaditya Wholesale Traders',
      location: 'Mumbai, Maharashtra',
      phone: '+91 97222 33445',
      email: 'vikram.wholesale@dadarmarket.com'
    },
    order_items: [
      {
        id: 'item-4',
        name: 'Desi Golden Yellow Maize Corn Grains',
        quantity: 200,
        price_per_unit: 45,
        price: 45,
        unit: 'kg',
        product: {
          name: 'Desi Golden Yellow Maize Corn Grains',
          image_url: '/images/yellow_maize.jpg',
          category: 'Maize'
        }
      }
    ]
  }
];
