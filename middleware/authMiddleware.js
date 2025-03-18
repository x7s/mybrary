const authAdmin = (req, res, next) => {
	if (!req.session.admin) {
		return res.redirect('/admin/login');
	}
	next();
};

const authPublisher = (req, res, next) => {
	if (!req.session.publisher) {
		return res.redirect('/publishers/login');
	}
	next();
};

module.exports = { authAdmin, authPublisher };
