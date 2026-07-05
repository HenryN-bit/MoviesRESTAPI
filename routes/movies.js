var express = require('express');
var router = express.Router();

const db = require("../knexfile.js");

// Movies search endpoint
router.get("/search", async function (req, res, next) {
  const pageNumber = parseInt(req.query.page);
  const perPage = 100;
  const currentPage = pageNumber || 1;
  const offset = (currentPage - 1) * perPage;
  const queryPage = req.query.page;

  const {
    title,
    id,
    year,
    metaCriticRate,
    rottentomatoesRating
  } = req.query;

  if (queryPage && (isNaN(pageNumber) || pageNumber < 1)) {
    return res.status(400).json({
      error: true,
      message: "Invalid page format. page must be a number."
    });
  }

  if (year && !/^\d{4}$/.test(year)) {
    return res.status(400).json({
      error: true,
      message: "Invalid year format. Format must be yyyy."
    });
  }

  try {
    let query = db.from("basics");

    // Checks if a year was selected
    if (year) {
      query = query.where("year", "=", year);
    }

    // Checks the movie's id
    if (id) {
      query = query.where("id", "=", id);
    }

    // Checks the movie's title
    if (title) {
      query = query.where("primaryTitle", "like", `%${title}%`);
    }

    // Checks the movie's rottentomatoes rating
    if (rottentomatoesRating) {
      query = query.where("rottentomatoesRating", "=", rottentomatoesRating);
    }

    // Checks the movie's metacritic rating
    if (metaCriticRate) {
      query = query.where("metacriticRating", "=", metaCriticRate);
    }

    // Clone the query to calculate pagination details without modifying the original query
    const countResult = await query.clone().count("id as count");
    const total = parseInt(countResult[0].count);
    const lastPage = Math.ceil(total / perPage);
    const prevPage = currentPage > 1 ? currentPage - 1 : null;
    const nextPage = currentPage < lastPage ? currentPage + 1 : null;

    const rows = await query.select("*").limit(perPage).offset(offset);

    // Maps the movie data into the table
    const mapped = rows.map(movie => ({
      imdbID: movie.tconst,
      title: movie.primaryTitle,
      year: movie.year,
      runtime: movie.runtimeMinutes,
      imdbRating: parseFloat(movie.imdbRating),
      metacriticRating: parseInt(movie.metacriticRating),
      rottenTomatoesRating: parseInt(movie.rottentomatoesRating),
      classification: movie.rated
    }));

    return res.status(200).json({
      error: false,
      data: mapped,
      pagination: {
        total,
        perPage,
        currentPage,
        lastPage,
        prevPage,
        nextPage,
        from: offset + 0,
        to: offset + rows.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: "Failed to retrieve movies search"
    });
  }
});

// Retrieve selected movie data ID endpoint
router.get("/data/:id", async function (req, res, next) {
  const movieID = req.params.id;

  // If the movieID is invalid
  if (!/^tt\d+$/.test(movieID)) {
    return res.status(404).json({
      error: true,
      message: "Invalid movie ID"
    });
  }

  if (Object.keys(req.query).length > 0) {
    return res.status(400).json({
      error: true,
      message: "Query parameters are not permitted."
    });
  }

  try {
    const movie = await db("basics")
      .select("*")
      .where("tconst", movieID)
      .first();

    // Checks if the searched movie is invalid
    if (!movie) {
      return res.status(404).json({
        error: true,
        message: "Movie not found"
      });
    }

    const genres = movie.genres ? movie.genres.split(",").map((genre) => genre.trim()) : [];

    const ratings = [];
    if (movie.imdbRating != null) {
      ratings.push({
        source: "Internet Movie Database",
        value: parseFloat(movie.imdbRating)
      });
    }
    if (movie.rottentomatoesRating != null) {
      ratings.push({
        source: "Rotten Tomatoes",
        value: parseInt(movie.rottentomatoesRating)
      });
    }
    if (movie.metacriticRating != null) {
      ratings.push({
        source: "Metacritic",
        value: parseInt(movie.metacriticRating)
      });
    }

    const principals = await req.db("principals")
      .select("*")
      .where("tconst", movie.tconst);

    const principalsFormatted = principals.map((principal) => ({
      id: principal.nconst,
      category: principal.category,
      name: principal.name,
      characters: (principal.characters && principal.characters !== "\\N")
        ? JSON.parse(principal.characters)
        : []
    }));

    // Movie details response in json format
    const movieResponse = {
      imdbID: movie.tconst,
      title: movie.primaryTitle,
      year: movie.year,
      runtime: movie.runtimeMinutes,
      genres: genres,
      plot: movie.plot,
      boxoffice: movie.boxoffice,
      poster: movie.poster,
      classification: movie.rated,
      ratings: ratings,
      principals: principalsFormatted
    };

    return res.status(200).json(movieResponse);

  } catch (err) {
    return res.status(500).json({
      error: true,
      message: "Failed to retrieve movie data"
    });
  }
});

module.exports = router;