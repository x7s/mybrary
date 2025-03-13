module.exports = (req, res, next) => {
	if (!req.session.publisher) {
	  return res.redirect('/publishers/login');
	}
	next();
};