require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const connectDB = require('./config/db');

const seedAdmin = async () => {
	try {
		// Connect to the database
		await connectDB();

		// Check if an admin already exists
		const existingAdmin = await Admin.findOne({ username: 'admin' });
		if (existingAdmin) {
			console.log('Grand Administrator already exists');
			return;
		}

		// Create the Grand Administrator
		const admin = new Admin({
			username: 'admin',
			password: '123qwerty456asd',
		});
		await admin.save();
		console.log('Grand Administrator seeded successfully');
	}
	catch (err) {
		console.error('Error seeding admin:', err);
	}
	finally {
		// Close the database connection
		mongoose.connection.close();
	}
};

seedAdmin();