const jwt = require('jsonwebtoken');
var fs = require('fs');
const path = require("path");

const withAuth = function(req, res, next) {
  let token = req.headers['x-access-token'] || req.headers['authorization'] || req.cookies.auth;  
  if (!token) {
     res.status(401).json({message: "Un-Authorized."})    
  } else {
    if (token.startsWith('Bearer ')) {
      token = token.slice(7, token.length);
    }
    var verifyOptions = {
     expiresIn:  "24h",
     algorithms:  "RS256"
    };

    // PUBLIC key
    var publicKey  = fs.readFileSync(path.resolve(__dirname, './keys/'+process.env["PUBLIC_KEY_NAME"]), 'utf8');

    try {
      var verified = jwt.verify(token, publicKey, verifyOptions);
    }catch(err) {
      return res.status(401).json({message: "Un-Authorized."})    
    }
    next();
  }
}
module.exports = withAuth;