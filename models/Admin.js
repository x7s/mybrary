const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const adminSchema = new mongoose.Schema(
	{
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true },
	},
	// Добавя createdAt и updatedAt
	{ timestamps: true },
);

// Hash password before saving
adminSchema.pre('save', async function(next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 12);
	}
	next();
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function(candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
