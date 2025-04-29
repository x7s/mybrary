const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema(
	{
		username: {
			type: String,
			required: [true, 'Username is required'],
			unique: true,
			trim: true,
			lowercase: true,
			minlength: [3, 'Username must be at least 3 characters'],
		},
		password: {
			type: String,
			required: [true, 'Password is required'],
			minlength: [6, 'Password must be at least 6 characters'],
		},
		name: {
			type: String,
			required: [true, 'Name is required'],
			trim: true,
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			trim: true,
			lowercase: true,
			match: [/.+@.+\..+/, 'Please enter a valid email address'],
		},
		lastLogin: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: function(doc, ret) {
				delete ret.password;
				delete ret.__v;
				return ret;
			},
		},
	},
);

// Hash password before saving
adminSchema.pre('save', async function(next) {
	// Only hash if password was modified
	if (!this.isModified('password')) return next();

	try {
		const salt = await bcrypt.genSalt(12);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	}
	catch (err) {
		next(err);
	}
});

// Password comparison method
adminSchema.methods.comparePassword = async function(candidatePassword) {
	try {
		return await bcrypt.compare(candidatePassword, this.password);
	}
	catch (err) {
		console.error('Password comparison error:', err);
		return false;
	}
};

// Add profile information method
adminSchema.methods.toProfileJSON = function() {
	return {
		id: this._id,
		username: this.username,
		name: this.name,
		email: this.email,
		createdAt: this.createdAt,
		lastLogin: this.lastLogin,
	};
};

module.exports = mongoose.model('Admin', adminSchema);