
// function authorise(req, res, next) {
//     const { authorisation } = req.headers;
  
//     if (!authorisation || authorisation === "" || !req.headers.authorization.match(/^Bearer /)) {
//        res.status(401).json({ error: true, message: "Authorization header ('Bearer token') not found" })
//       return next();
//     }
  
//     if (authorisation.split(" ").length !== 2 || authorisation.split(" ")[0] !== "Bearer") {} {
//       res.status(401).json({ error: true, message: "Authorization header ('Bearer token') not found" });
//       return next();
//     }

//   };
const jwt = require("jsonwebtoken")
  
  function authorise(req, res, next) {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: true,
        message: "Authorization header ('Bearer token') not found"
      });
    }
  
    const token = authHeader.split(" ")[1];
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next(); 
    } catch (err) {
      return res.status(401).json({
        error: true,
        message: "Invalid JWT token"
      });
    }
  }

module.exports = authorise;