const jwt = require("jsonwebtoken")
  
  // Middleware to verify that requests include a valid JWT before allowing access
  function authorise(req, res, next) {
    const authHeader = req.headers.authorization;
  
    // Checks that the authorisation header exists and follows the Bearer token format
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: true,
        message: "Authorization header ('Bearer token') not found"
      });
    }
  
    // Extracts the JWT from the authorisation header
    const token = authHeader.split(" ")[1];
  
    try {
      // Verifies the JWT using the application's secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Stores the decoded user information for use in protected routes
      req.user = decoded;

      next(); 
    } catch (err) {
      // Returns an error if the token is invalid or has expired
      return res.status(401).json({
        error: true,
        message: "Invalid JWT token"
      });
    }
  }

module.exports = authorise;