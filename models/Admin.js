const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
	if (this.isModified('password')) {
		this.password = await bcrypt.hash(this.password, 10);
	}
	next();
});

// Method to compare passwords
adminSchema.methods.comparePassword = async function(candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Admin', adminSchema);
