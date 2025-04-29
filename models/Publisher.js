const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const publisherSchema = new mongoose.Schema(
	{
		avatar: {
			type: String,
			default: '/images/default-avatar.png',
		},
		name: {
			type: String,
			required: [true, 'Името е задължително'],
		},
		username: {
			type: String,
			required: [true, 'Потребителското име е задължително'],
			unique: true,
			lowercase: true,
			trim: true,
			minlength: [3, 'Потребителското име трябва да е поне 3 символа'],
		},
		email: {
			type: String,
			required: [true, 'Имейл адресът е задължително'],
			unique: true,
			lowercase: true,
			trim: true,
			match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Моля въведете валиден email'],
		},
		password: {
			type: String,
			required: [true, 'Паролата е задължителна'],
			minlength: [6, 'Паролата трябва да е поне 6 символа'],
		},
		bio: {
			type: String,
			default: '',
			maxlength: [500, 'Биографията не трябва да надвишава 500 символа'],
		},
		phone: {
			type: String,
			required: false,
			validate: {
				validator: function(v) {
					// Skip validation if empty, otherwise check format
					return !v || /^[0-9]{10,15}$/.test(v);
				},
				message: 'Телефонът трябва да съдържа между 10 и 15 цифри',
			},
		},
		address: {
			street: { type: String, trim: true },
			city: { type: String, trim: true },
			postalCode: { type: String, trim: true },
			country: { type: String, trim: true },
		},
		website: {
			type: String,
			match: [/^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/, 'Моля въведете валиден URL'],
		},
		isAdmin: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		toJSON: {
			transform: function(doc, ret) {
				delete ret.password;
				return ret;
			},
		},
	},
);

// Hash password before saving
publisherSchema.pre('save', async function(next) {
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

// Method to compare passwords
publisherSchema.methods.comparePassword = async function(candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Publisher', publisherSchema);