// Importing necessary modules and middleware
const express = require("express");
const Exercise = require("../models/Exercise");
const Users = require("../models/Users");

// Middleware to fetch user information from the request
const fetchuser = require("../middleware/fetchuser");
const { body, validationResult } = require("express-validator");
const router = express.Router();

// POST endpoint to create a new quiz question
router.post(
  "/creatquizquestion",
  [
    // Validating request body parameters
    body("language", "Enter a valid language").isLength({ min: 3 }),
    body("difficulty", "Enter a valid difficulty").isIn(['easy', 'medium', 'hard']),
    body("question", "Enter a valid question").isLength({ min: 3 }),
    body("options.*.text", "Enter a valid option text").isLength({ min: 1 }),
    body("options.*.isCorrect", "Specify if the option is correct").isBoolean(),
  ],
  // Middleware to fetch user information
  fetchuser,
  async (req, res) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() });
    } else {
      try {
        // Check if the user has admin privileges
        if (req.user.role !== "admin") {
          return res.status(403).json({ error: "Access denied. Only admins are allowed to post quiz questions." });
        }
        const { language, difficulty, question, options } = req.body;

        // Create a new exercise instance
        const exercise = new Exercise({
          language,
          difficulty,
          question,
          options,
        });

        // Save the exercise to the database
        const savedExercise = await exercise.save();
        console.log("Exercise saved successfully:", savedExercise);

        res.json({ success: true, exercise: savedExercise });
      } catch (error) {
        console.error("Error saving quiz question:", error);
        res.status(500).json({ error: "Server Error" });
      }
    }
  }
);

// POST endpoint to get a quiz based on difficulty and user's current language
router.post('/getQuiz', fetchuser, async (req, res) => {
  try {
    const { difficulty } = req.body;
    let doc = await Users.findById(req.user.id);
    let language = doc.currentLanguage;

    // Aggregate query to get a random quiz based on difficulty and language
    const quiz = await Exercise.aggregate([
      { $match: { difficulty, language } },
      { $sample: { size: 10 } }, // You can adjust the size as needed
    ]);

    res.json(quiz);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal server error");
  }
});

// PUT endpoint to update user scores for a specific language
router.put('/updateScores', fetchuser, async(req, res) => {
  let { score } = req.body;

  // If score is null, set it to 0
  if (score == null) {
    score = 0;
  }

  let doc = await Users.findById(req.user.id);
  let language = doc.currentLanguage;

  try {
    // Update user scores for the specified language
    doc.scores.set(language, score);
    doc.currentLanguage = language; // Corrected line
    let updatedDoc = await doc.save();
    res.status(200).json(updatedDoc);
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// GET endpoint to retrieve user scores for the current language
router.get('/getScores', fetchuser, async (req, res) => {
  try {
    let doc = await Users.findById(req.user.id);

    // Check if user exists
    if (!doc) {
      return res.status(500).json({ error: 'User not found' });
    }

    let language = doc.currentLanguage;
    let scores = doc.scores.get(language);

    res.status(200).json({ values: scores });
  } catch (err) {
    console.error('Error fetching user scores:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET endpoint to retrieve user's current language
router.get('/getCurrentLanguage', fetchuser, async (req, res) => {
  try {
    let doc = await Users.findById(req.user.id);

    // Check if user exists
    if (!doc) {
      return res.status(500).json({ error: 'User not found' });
    }

    let language = doc.currentLanguage;

    res.status(200).json({ language: language });
  } catch (err) {
    console.error('Error fetching user scores:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Exporting the router module
module.exports = router;
