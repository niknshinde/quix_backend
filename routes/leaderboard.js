const express = require("express");
const Users = require("../models/Users");
const Exercise = require("../models/Exercise");
const fetchuser = require("../middleware/fetchuser");
const router = express.Router();




router.post('/getleaderboard',fetchuser, async (req, res) => {
    let sco = await Users.findById(req.user.id);

    if(!sco){
      res.status(500).send("User not found");
    }
  
    try {


        let doc = await Users.findById(req.user.id);
        let language = doc.currentLanguage; // Corrected line

      const users = await Users.find({ [`scores.${language}`]: { $exists: true } })
        .sort({ [`scores.${language}`]: -1 }) // sort in descending order
        .select(`name scores.${language}`); // select name and score of the language
  
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });




  router.get('/defultLeaderboard', async (req, res) => {
    
    try {


        let language = "english";

      const users = await Users.find({ [`scores.${language}`]: { $exists: true } })
        .sort({ [`scores.${language}`]: -1 }) // sort in descending order
        .select(`name scores.${language}`); // select name and score of the language
  
      res.json(users);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });


module.exports = router;

