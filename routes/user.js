var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authorization = require("../middleware/Authorization.js");

const db = require("../knexfile.js");

// User Registration Endpoint
router.post('/register', function (req, res, next) {
  const email = req.body.email;
  const password = req.body.password;

  // Checks if the email and password body fields are empty
  if (!email || !password) {
    res.status(400).json({
      error: true,
      message: "Request body incomplete - email and password needed"
    });
    return;
  }

  // Checks if the input email already exists in the database when registering
  const queryUsers = db.from("users").select("*").where("email", "=", email);
  queryUsers.then(users => {
    if (users.length > 0) {
       res.status(400).json({ success: false, message: "User exists" });
    } else {

   // Hashes the user's password before storing it in the database
   const saltRounds = 10;
   const emailHash = {
    email: email,
    hash: bcrypt.hashSync(password, saltRounds),
  };

    // Creates a new user account in the database
    db("users").insert(emailHash)
      .then(() => res.status(201).json({ 
        success: true, 
        message: "User created" 
        })
      )
      .catch(() =>    
        res.status(500).json({
          success: false,
          message: "Internal server error"
        })
      );  
    }
  });
});

// User Login Endpoint for logging into the application
router.post("/login", async (req, res, next) => {
  
  const email = req.body.email;
  const password = req.body.password;
 
   //  Checks if the email or password fields are empty
   if (!email || !password) {
     res.status(400).json({
       error: true,
       message: "Request body incomplete - email and password needed"
     });
     return;
   }
 try {
  
    // Checks whether the email address is already registered
    users = await db("users").select("*").where("email", "=", email);
    let user = users[0];

    // Checks whether the user account exists
    if (!user) {
        res.status(401).json({ 
          success: false, 
          message: "User does not exist" 
        });
     } else {
  
          // Verifies the supplied password against the stored password hash
          const match = await bcrypt.compare(password, user.hash);
        
          if (match) {
            // Generates JWT bearer and refresh tokens for the authenticated user
            const bt = parseInt(process.env.bearerExpiresInSeconds);
            const rt = parseInt(process.env.refreshExpiresInSeconds);
            
            const refreshToken = jwt.sign(
              { email: user.email },
              process.env.JWT_SECRET,
              { expiresIn: rt });

            const bearerToken = jwt.sign(
              { email: user.email },
              process.env.JWT_SECRET,
              { expiresIn: bt });
        
            // Returns the generated authenticated tokens
            return res.status(200).json({
                    bearerToken: {
                      token: bearerToken,
                      token_type: "Bearer",
                      expires_in: bt
                    },
                    refreshToken: {
                      token: refreshToken,
                      token_type: "Refresh",
                      expires_in: rt
                    }
                  });
          } else {
              // Returns an error when the supplied password is incorrect
              return res.status(401).json({
                    error: true,
                    message: "Incorrect email or password"
              });
          }
       
       
       }
     } catch (error) {
     
         res.status(500).json({
           success: false,
           message: "Internal server error"
         })
       }});

// Validates that the supplied date is a real past date in YYYY-MM-DD format
const isValidDate = (dateOfBirth) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
    return false;
  }
  
  const [year, month, day] = dateOfBirth.split("-").map(Number)
  const date = new Date(`${dateOfBirth}T00:00:00Z`);
  const today = new Date();

  return (
    !isNaN(date.getTime()) &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day && 
    date < today
  );
};

// Updates the authenticated user's profile information
router.post("/update", authorization, async function(req, res) {
  const { userEmail, dateofBirth } = req.body;
  const authorizedEmail = req.user.email;

  // Checks if the email or date of birth fields are empty
  if (!userEmail || !dateofBirth) {
    return res.status(400).json({ error: true, message: 'Missing required fields' });
  }

  // Ensures the authenticated user can only update their own profile
  if (userEmail !== authorizedEmail) {
    return res.status(403).json({ error: true, message: "Unauthorized to update profile" });
  }

  // Validates the supplied date of birth before updating the profile
  if (!isValidDate(dateofBirth)) {
    return res.status(400).json({
      error: true,
      message: "Date format must be in YYYY-MM-DD"
    });
  }

  try {
    // Updates the user's date of birth in the database
    const rows = await db("users")
      .where("email", "=", userEmail)
      .update({ dob: dateofBirth });

    if (rows === 0) {
      return res.status(404).json({ error: true, message: 'User not found' });
    }

    return res.status(200).json({ error: false, message: "Update Success" });
  } catch (err) {
    return res.status(500).json({ error: true, message: "Error executing query" });
  }
});

// Get user email profile endpoint
router.get("/:email/profile", authorization, async function (req, res) {
  const requestedEmail = req.params.email;
  const requesterEmail = req.user?.email;

  try {
    const user = await db("users")
      .where("email", "=", requestedEmail)
      .first();

    // Checks if the user is not found
    if (!user) {
      return res.status(404).json({
        error: true,
        message: "User not found"
      });
    }

    // Builds the public profile returned for all users
    const userProfile = {
      email: user.email,
      firstName: user.firstName || null,
      lastName: user.lastName || null
    };

    // Includes private profile fields when users view their own profile
    if (requesterEmail === user.email) {
      userProfile.dob = user.dob || null;
      userProfile.address = user.address || null;
    }
    return res.status(200).json({ error: false, data: userProfile });

  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Query Error"
    });
  }
});

// Updates an authenticated user's profile
router.put("/:email/profile", authorization, async function (req, res) {
  const { requestedEmail } = req.params;
  const { requesterEmail } = req.user;

  if (requesterEmail !== requestedEmail) {
    return res.status(403).json({ error: true, message: "Forbidden." });
  }

  const { firstName, lastName, dateofBirth, address } = req.body;

  // Ensures all required profile fields are provided
  if (!firstName || !lastName || !dateofBirth || !address) {
    return res.status(400).json({
      error: true,
      message: "Request body incomplete: firstName, lastName, dob and address are required."
    });
  }

  // Validates the profile fields are strings
  if ( typeof firstName !== "string" || typeof lastName !== "string" || typeof address !== "string"
  ) {
    return res.status(400).json({
      error: true,
      message: "Request body invalid: firstName, lastName and address must be strings only."
    });
  }

  // Validates the date format (YYYY-MM-DD)
  const regexYYYY_MM_DD = /^\d{4}-\d{2}-\d{2}$/;
  if (!regexYYYY_MM_DD.test(dateofBirth)) {
    return res.status(400).json({
      error: true,
      message: "Invalid input: dob must be in real date in format YYYY-MM-DD."
    });
  }

  // Ensures the supplied date is a valid calender date
  const [year, month, day] = dateofBirth.split("-").map(Number);
  const parsedDate = new Date(dateofBirth);
  if (parsedDate.getFullYear() !== year || parsedDate.getMonth() + 1 !== month || parsedDate.getDate() !== day
  ) {
    return res.status(400).json({
      error: true,
      message: "Invalid input. Date of birth must be in real date format of YYYY-MM-DD."
    });
  }

  try {
    // Retrieves the user's existing profile
    const user = await db("users")
      .where("email", "=", requestedEmail)
      .first();

    // Checks if the user is in the database
    if (!user) {
      return res.status(404).json({ error: true, message: "User not found" });
    }

    // Updates the user's profile information
    await db("users")
      .where("email", "=", requestedEmail)
      .update({ firstName, lastName, dob: dateofBirth, address });

    return res.status(200).json({
      email: requestedEmail,
      firstName,
      lastName,
      dob: dateofBirth,
      address
    });
  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Error executing MySql query"
    });
  }
});

module.exports = router;