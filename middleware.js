const jwt = require('jsonwebtoken');
var fs = require('fs');
const path = require("path");

const withAuth = function(req, res, next) {
  const token =
    req.cookies.auth;
  if (!token) {
     res.redirect('/login');
  } else {
    var verifyOptions = {
     expiresIn:  "12h",
     algorithms:  "RS256"
    };

    // PUBLIC key
    var publicKey  = fs.readFileSync(path.resolve(__dirname, './keys/jwt_converted_key.pub'), 'utf8');

    try {
      var verified = jwt.verify(token, publicKey, verifyOptions);
    }catch(err) {
      res.redirect('login');
    }
    next();
  }
}
module.exports = withAuth;