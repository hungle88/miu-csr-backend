const jwtManager = require('../jwt/jwtManager');

class Authorization {

    checkToken(req, res, next) {
        if (req.url === '/api/v1/authenticate/login' || req.url === '/api/v1/authenticate/signup') {
            next();
            return;
        }
        const token = req.headers.authorization;
        if (!token) {
            return res.json({ status: 'authorization_error1' });
        } else {
            const data = jwtManager.verify(token);
            if (!data) {
                return res.json({ status: 'authorization_error2' });
            }

            req._id = data._id;
            next();
        }
    }
}

module.exports = new Authorization();