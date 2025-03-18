const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${err.message}`);

    if (process.env.NODE_ENV === 'production') {
        return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.status(500).json({ error: err.message });
};

module.exports = errorHandler;
