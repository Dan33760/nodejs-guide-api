const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.get('Authorization').split(' ')[1];
    console.log(req.get('Authorization'))
    let decodedToken;
    try{
        decodedToken = jwt.verify(token, 'somesupersecretsecretsecret');
    }
    catch (err) {
        err.statusCode = 500;
        throw err;
    }

    if(!decodedToken) {
        const error = new Error('Not authenticated');
        error.statusCode = 401;
        throw error;
    }
    res.userId = decodedToken.userId;
    next();
}