/**
 * Purpose: Seeds the required faculty accounts into MongoDB.
 */

const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const User = require('./models/User');

dotenv.config();

const facultyUsers = [
  {
    name: 'Mr. Akash Pundir',
    email: 'Akashsmart@gmail.com',
    password: '@9670',
    role: 'faculty'
  },
  {
    name: 'Mr. Surya Singh',
    email: 'suryaboss@gmail.com',
    password: '@9670',
    role: 'faculty'
  }
];

const seedFaculty = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  for (const faculty of facultyUsers) {
    const hashedPassword = await bcrypt.hash(faculty.password, 10);

    await User.findOneAndUpdate(
      { email: faculty.email.toLowerCase() },
      {
        name: faculty.name,
        email: faculty.email.toLowerCase(),
        password: hashedPassword,
        role: faculty.role
      },
      {
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );
  }

  console.log('Faculty seed completed');
};

seedFaculty()
  .catch((error) => {
    console.error('Faculty seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
