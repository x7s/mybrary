const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const publisherSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		username: { type: String, required: true, unique: true },
		password: { type: String, required: true },
		bio: { type: String, default: '' },
	},
	// Добавя createdAt и updatedAt
	{ timestamps: true },
);

// Hash password before saving
publisherSchema.pre('save', async function(next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 12);
	}
	next();
});

// Method to compare passwords
publisherSchema.methods.comparePassword = async function(candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Publisher', publisherSchema);
