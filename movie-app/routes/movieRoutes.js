const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Movie = require("../models/Movie");
const fs = require('fs');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage: storage });

// Home Page
router.get("/", async (req, res) => {
  const movies = await Movie.find().sort({ _id: -1 });
  res.render("index", { movies });
});

// Add Movie Form
router.get("/add", (req, res) => {
  res.render("add");
});



router.post("/add", upload.single("image"), async (req, res) => {
  const { name, releaseDate, type, description, rating, review, cast } =
    req.body;
  const image = req.file.filename;
  const genre = Array.isArray(req.body.genre)
    ? req.body.genre.join(", ")
    : req.body.genre;

  const movie = new Movie({
    name,
    releaseDate,
    image,
    genre,
    description,
    rating,
    review,
    cast,
  });

  await movie.save();
  res.redirect("/");
});

router.post('/delete/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (movie) {
    const imagePath = path.join(__dirname, '..', 'uploads', movie.image);
    
    // Delete file from uploads
    fs.unlink(imagePath, (err) => {
      if (err) {
        console.error("Error deleting file:", err);
      }
    });

    await Movie.findByIdAndDelete(req.params.id);
  }
  res.redirect('/');
});


// Movie Detail Page
router.get("/movie/:id", async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  res.render("detail", { movie });
});

module.exports = router;
