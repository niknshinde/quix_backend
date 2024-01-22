const express = require("express");
const Users = require("../models/Users");
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const Jwt_SECRET = 'NIKHILSHInde$23214'
const router = express.Router();


//i need to delete below /createuser section 


router.post(
    "/createadmin",
    [
      body("name", "Enter a valid name").isLength({ min: 3 }),
      body("email", "Enter a valid email").isEmail(),
      body("password", "Password must be at least 5 characters").isLength({
        min: 5,
      }),
      body("currentLanguage", "Enter a valid current language").isString(),
    ],
    fetchuser,
    async (req, res) => {
      const result = validationResult(req);
  
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      } else {
        try {
          if (req.user.role !== "admin") {
            return res
              .status(403)
              .json({ error: "Access denied. Only admin can create new admin." });
          }
  
          const existingUser = await Users.findOne({ email: req.body.email });
  
          if (existingUser) {
            return res.status(400).json({
              error: "A user with this email already exists",
            });
          } else {
            const { name, email, password, currentLanguage } = req.body;

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
  

            const createdAdmin = new Users({
              name: name,
              email: email,
              password: passwordHash,
              scores: { [currentLanguage]: 0 },
              currentLanguage: currentLanguage,
              role: "admin",

            });
  
            const savedAdmin = await createdAdmin.save();
            console.log("admin saved successfully:", savedAdmin);
  
            const data = {
              user: {
                id: createdAdmin.id,
                role: "admin",
                currentLanguage:currentLanguage,
              },
            };
            const authToken = jwt.sign(data, Jwt_SECRET);
  
            res.json(authToken);
          }
        } catch (error) {
          console.error("Error saving admin:", error);
          res.status(500).json({ error: "Server Error" });
        }
      }
    }
  );


  router.post(
    "/createuser",
    [
      body("name", "Enter a valid name").isLength({ min: 3 }),
      body("email", "Enter a valid email").isEmail(),
      body("password", "Password must be at least 5 characters").isLength({
        min: 5,
      }),
      body("currentLanguage", "Enter a valid current language").isString(),
    ],
    async (req, res) => {
      const result = validationResult(req);
  
      if (!result.isEmpty()) {
        return res.status(400).json({ errors: result.array() });
      } else {
        try {
          const existingUser = await Users.findOne({ email: req.body.email });
  
          if (existingUser) {
            return res.status(400).json({
              error: "A user with this email already exists",
            });
          } else {
            const { name, email, password, currentLanguage } = req.body;
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);


            const createdUser = new Users({
              name: name,
              email: email,
              password: passwordHash,
              scores: { [currentLanguage]: 0 },
              currentLanguage: currentLanguage,
              role: "user",

            });
  
            const savedUser = await createdUser.save();
            console.log("User saved successfully:", savedUser);
  
            const data = {
              user: {
                id: createdUser.id,
                role: "user",
                currentLanguage:currentLanguage,
              },
            };
            const authToken = jwt.sign(data, Jwt_SECRET);
  
            res.json(authToken);
          }
        } catch (error) {
          console.error("Error saving user:", error);
          res.status(500).json({ error: "Server Error" });
        }
      }
    }
  );



//login route

router.post("/login", [

    body("email", "Enter a valid email").isEmail(),
    body("password", "password can't we blank").exists(),

  ], (req,res)=>{
   const result2 = validationResult(req);
    if (!result2.isEmpty()) {
        return res.send({ errors: result2.array() });
      } else {
        

        (async () => {
     
            const {email,password} = req.body;
            let success = false;
        
            try {
                //checking is user with give email is present in database if 
                //i) find user in with given email in database
                let user = await Users.findOne({email});


                //ii)if user not exist then 
                if(!user){
                  success = false;
                    return res.status(400).json({error:"please try to login using right credentials"})
                }

                //ones user is present in database check it password matches with password provide by user during login 

                const passwordCompare = await bcrypt.compare(password,user.password)

                //if password is wrong
                if(!passwordCompare){
                  success = false;
                    return res.status(400).json({error:"please try to login using right credentials"})

                }
                
                //if password is right then we send user authentication

                const data = {
                    user:{
                        id : user.id,
                        role: user.role,
                        currentLanguage:user.currentLanguage,


                    }
                }

                let role = user.role;
                const authtoken = jwt.sign(data , Jwt_SECRET);
                success = true;
                res.json({success,authtoken ,role })
    



            } catch (error) {
                console.error("Error during login user:", error);
                res.status(500).json({ error: "Internal server error" }); 
            }
        })();
  } }
  )

  


module.exports = router;
