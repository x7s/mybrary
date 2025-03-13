module.exports = (req, res, next) => {
	if (!req.session.admin) {
		return res.redirect('/admin/login');
	}
	next();
};

module.exports = (req, res, next) => {
	if (!req.session.publisher) {
	  return res.redirect('/publishers/login');
	}
	next();
};