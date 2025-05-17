const admin = require('firebase-admin');
const User = require('../Models/user.model');


console.log('Environment variables:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'Not set');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'Not set');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Set' : 'Not set');


let firebaseApp;
try {
  if (!admin.apps.length) {
   
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      console.error('Missing credentials:');
      console.error('projectId:', projectId);
      console.error('clientEmail:', clientEmail);
      console.error('privateKey:', privateKey ? 'Present' : 'Missing');
      throw new Error('Missing Firebase Admin SDK credentials in environment variables');
    }

    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    firebaseApp = admin.apps[0];
    console.log('Using existing Firebase Admin SDK instance');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1); 
}

const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: 'No token provided' });
    }

    console.log('Verifying token...');
    

    const decodedToken = await admin.auth().verifyIdToken(token);
    console.log('Decoded Firebase token:', {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name
    });

   
    let user = await User.findOne({ firebaseUid: decodedToken.uid });
    console.log('Existing user found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('Creating new user...');

      user = new User({
        firebaseUid: decodedToken.uid,
        name: decodedToken.name || 'User',
        email: decodedToken.email,
        password: 'firebase-auth', 
        type: 0
      });
      await user.save();
      console.log('New user created:', user);
    }

    if (!user._id) {
      console.error('User created but _id is missing:', user);
      return res.status(500).json({ message: 'Error creating user' });
    }


    req.user = {
      _id: user._id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      name: user.name,
      uid: decodedToken.uid
    };
    
    console.log('User attached to request:', {
      _id: req.user._id,
      firebaseUid: req.user.firebaseUid,
      email: req.user.email,
      uid: req.user.uid
    });
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      message: 'Invalid token',
      error: error.message
    });
  }
};

module.exports = { verifyToken }; 