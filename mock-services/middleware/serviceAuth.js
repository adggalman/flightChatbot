const serviceAuth = (req, res, next) => {

    const serviceAPIKey = process.env.SERVICE_API_KEY
    const incomingKey = req.headers['x-service-key']

    if (incomingKey !== serviceAPIKey) {
        return res.status(401).json({ error: 'Unauthorized Error' });
    }
    next();
}

module.exports = serviceAuth;