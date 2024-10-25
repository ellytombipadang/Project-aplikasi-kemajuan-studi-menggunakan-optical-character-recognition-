const verifytoken = require("../scripts/verifytoken");

const checkAuth = (req, res, next) => {
    const authorization = req.headers.authorization
    verifytoken(authorization).then(dataAuth => {
        if (dataAuth?.payload && dataAuth?.protectedHeader) {
            next();
        } else {
            console.log('authorization failed');
            res.send(dataAuth);
        }
    })
}

module.exports = { checkAuth };