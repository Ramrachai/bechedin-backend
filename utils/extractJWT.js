const jwt = require('jsonwebtoken');

function extractJWT(req, property) {
  try {
    const { token } = req.cookies.token;
    const decoded = jwt.decode(token, process.env.SECRET);
    return decoded[property];
  } catch (error) {
    console.log('Error decoding JWT token');
  }
}

module.exports = extractJWT;

// how to user it ==========
// in any route handler paste the following code to get username:
// let resut = extractJWT(req, 'userName');

// == currently this function accepts following values as property:
//
//     userId: mongodb _id,
//     userName: name,
//     useEmail: email,
//     role: admin, moderator , user ,
//     loggedIn: true/false,
