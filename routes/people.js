var express = require('express');
const authorization = require('../middleware/Authorization');
var router = express.Router();

const db = require("../knexfile.js");

function parseCharacters(characters) {

  if (!characters || characters === "\\N") {
    return [];
  }

  try {
    return JSON.parse(characters);

  } catch (error) {

    return [characters];
  }

}

// Specific person endpoint when logged in
router.get("/:id", authorization, async function (req, res) {
  const personID = req.params.id;

  if (Object.keys(req.query).length > 0) {
    return res.status(400).json({
      error: true,
      message: "Query parameters are not permitted."
    });
  }

  try {
    const person = await db("names")
      .select("*")
      .where("nconst", personID)
      .first();

    if (!person) {
      return res.status(404).json({
        error: true,
        message: "Person not found"
      });
    }

    const roles = await db("principals")
      .select("*")
      .where("nconst", personID);

    const tconsts = roles.map(role => role.tconst);

    const movies = await db("basics")
      .select("tconst", "primaryTitle", "imdbRating")
      .whereIn("tconst", tconsts);

    const movieMap = {};
    movies.forEach(movie => {
      movieMap[movie.tconst] = {
        title: movie.primaryTitle,
        imdbRating: movie.imdbRating
      };
    });
    
    const formattedRoles = roles.map(role => ({
      movieId: role.tconst,
      movieName: movieMap[role.tconst]?.title || null,
      category: role.category,
      imdbRating: movieMap[role.tconst]?.imdbRating || null,
      characters: parseCharacters(role.characters)
    }));

    return res.status(200).json({
      name: person.primaryName,
      birthYear: person.birthYear,
      deathYear: person.deathYear || null,
      roles: formattedRoles
    });

  } catch (error) {
    console.error("People endpoint error:", error);
    return res.status(500).json({
      error: true,
      message: "Internal server error"
    });
  }
});
  
module.exports = router;