// server/app.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const pool = require("./db"); // PostgreSQL connection
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Submit review endpoint
app.post("/submit-review", async (req, res) => {
  const { productId, rating, review, username } = req.body;

  if (!productId || !username || (!rating && !review)) {
    return res.status(400).json({
      message: "Product ID, username, and at least rating or review are required",
    });
  }

  try {
    // Prevent duplicate reviews
    const { rows: existing } = await pool.query(
      "SELECT 1 FROM reviews WHERE product_id=$1 AND username=$2",
      [productId, username]
    );
    if (existing.length > 0) {
      return res.status(409).json({ message: "You already reviewed this product." });
    }

    const { rows } = await pool.query(
      "INSERT INTO reviews (product_id, rating, review, username) VALUES($1, $2, $3, $4) RETURNING *",
      [productId, rating || null, review || null, username]
    );
    res.status(201).json({ message: "Review submitted successfully", review: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Fetch reviews and average rating per product
app.get("/reviews/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    const { rows } = await pool.query(
      "SELECT rating, review, username, created_at FROM reviews WHERE product_id = $1 ORDER BY created_at DESC",
      [productId]
    );
    const ratings = rows.map(r => r.rating).filter(r => r !== null);
    const avgRating = ratings.length ? (ratings.reduce((a,b) => a + b)/ratings.length).toFixed(1) : null;
    res.json({ reviews: rows, averageRating: avgRating });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
