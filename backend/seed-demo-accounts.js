const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword } = require('firebase/auth');
const { getDatabase, ref, set } = require('firebase/database');
const fs = require('fs');
const path = require('path');

async function seed() {
    try {
        const envPath = path.join(__dirname, '../frontend/.env');
        const envContent = fs.readFileSync(envPath, 'utf-8');
        
        const config = {};
        envContent.split('\n').forEach(line => {
            if (line.includes('=')) {
                const [key, val] = line.split('=');
                config[key.trim()] = val.trim().replace(/['"]/g, '');
            }
        });

        const firebaseConfig = {
            apiKey: config.VITE_FIREBASE_API_KEY,
            authDomain: config.VITE_FIREBASE_AUTH_DOMAIN,
            databaseURL: config.VITE_FIREBASE_DATABASE_URL,
            projectId: config.VITE_FIREBASE_PROJECT_ID,
            storageBucket: config.VITE_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: config.VITE_FIREBASE_MESSAGING_SENDER_ID,
            appId: config.VITE_FIREBASE_APP_ID
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getDatabase(app);

        const demos = [
            {
                email: 'farmer_demo@test.com',
                password: 'Password123',
                role: 'Farmer',
                name: 'Demo Farmer Ramesh',
                phone: '9876543210',
                kyc: {
                    farmer_name: 'Demo Farmer Ramesh',
                    mobile_number_: '9876543210',
                    aadhaar_number_: '123456789012',
                    farmer_category_: 'Marginal / Small Farmer (< 2 Hectares)',
                    state: 'Madhya Pradesh',
                    district: 'Sehore',
                    tehsil: 'Ashta',
                    village: 'Kothri',
                    khatauni_account_no_: 'KHT-2026/0942',
                    khasra_plot_no_: '142/1',
                    bank_account_number_: '9876543210123',
                    ifsc_code_: 'SBIN0001234'
                }
            },
            {
                email: 'buyer_demo@test.com',
                password: 'Password123',
                role: 'Buyer',
                name: 'Demo Buyer Rajesh',
                phone: '9988776655',
                kyc: {
                    full_legal_name_: 'Demo Buyer Rajesh',
                    mobile_number_: '9988776655',
                    address: 'Flat 101, Business Park',
                    state: 'Madhya Pradesh',
                    district: 'Bhopal',
                    pin_code_: '462001'
                }
            },
            {
                email: 'transporter_demo@test.com',
                password: 'Password123',
                role: 'Transporter',
                name: 'Demo Transporter Singh',
                phone: '9123456789',
                kyc: {
                    driver_name: 'Demo Transporter Singh',
                    phone: '9123456789',
                    vehicle_number: 'MP04 AB 1234',
                    vehicle_type: 'Truck (6-Wheeler)',
                    capacity: '9000 kg',
                    driving_license_number: 'MP04 20150000000'
                }
            }
        ];

        for (const demo of demos) {
            console.log(`Processing ${demo.email}...`);
            let user;
            try {
                const cred = await createUserWithEmailAndPassword(auth, demo.email, demo.password);
                user = cred.user;
                console.log(`Created ${demo.email}`);
            } catch (e) {
                if (e.code === 'auth/email-already-in-use') {
                    console.log(`${demo.email} already exists, signing in...`);
                    const cred = await signInWithEmailAndPassword(auth, demo.email, demo.password);
                    user = cred.user;
                } else {
                    console.error('Error creating user:', e);
                    continue;
                }
            }

            await updateProfile(user, { displayName: demo.name });

            const payload = {
                role: demo.role,
                full_name: demo.name,
                phone: demo.phone,
                email: demo.email,
                kycCompleted: true,
                kyc: demo.kyc,
                updatedAt: new Date().toISOString()
            };

            await set(ref(db, `users/${user.uid}`), payload);
            await set(ref(db, `${demo.role.toLowerCase()}s/${user.uid}`), {
                uid: user.uid,
                email: demo.email,
                role: demo.role,
                full_name: demo.name,
                phone: demo.phone,
                kyc: demo.kyc,
                createdAt: new Date().toISOString()
            });

            console.log(`Seeded DB for ${demo.email}`);
        }

        console.log('Finished seeding demo accounts.');
        process.exit(0);

    } catch (e) {
        console.error('Seeding failed:', e);
        process.exit(1);
    }
}

seed();
