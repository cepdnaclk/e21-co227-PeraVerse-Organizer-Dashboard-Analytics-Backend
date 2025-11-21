// Import required packages
const express = require("express");  // Web framework for building APIs
const axios = require("axios");      // For making HTTP requests
const pool = require("../../../db/db"); // Database connection (PostgreSQL)
const cors = require("cors");        // Allows frontend to connect from another origin
require("dotenv").config();          // Loads environment variables

const app = express();
const PORT = process.env.PORT || 5010; // Use .env port or default to 5010

// ✅ Allow React app (localhost:5173) to call this backend
app.use(
  cors({
    origin: "http://localhost:5173", // Allow frontend at this address
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
  })
);

// ✅ Allow Express to read JSON data from requests
app.use(express.json());

// Default route for testing server
app.get("/", (req, res) => {
  res.send("✅ Feedback service is running. Use /feedback endpoints.");
});


// ------------------------
// 🏢 Helper function
// ------------------------
// The function finds building and zone info using location name
async function getBuildingByLocation(location) {
  const query = `
    SELECT b.building_name, z.zone_name
    FROM Building b
    JOIN Zone z ON b.zone_ID = z.zone_ID
    WHERE b.building_name = $1
    LIMIT 1
  `;
  const result = await pool.query(query, [location]);
  // Return result or fallback if not found
  return (
    result.rows[0] || {
      building_name: "Unknown Building",
      zone_name: "Unknown Zone",
    }
  );
}


// ------------------------
// 🔹 1. /feedback - Get all feedbacks with details
// ------------------------
app.get("/feedback", async (req, res) => {
  try {
    // Get raw feedback data from the database
    const response = await axios.get("http://localhost:3000");
    const rows = response.data.sampleRows;

    // Add event, building, and zone details to each feedback
    const feedbackWithDetails = await Promise.all(
      rows.map(async (row) => {
        let comment = null;
        let rating = null;

        // Try to extract comment and rating from JSON text
        try {
          const parsed = JSON.parse(row.text_content);
          comment = parsed.comment || null;
          rating = parsed.rating || null;
        } catch (e) {}

        // Get event details (name and location) from database
        const eventQuery =
          "SELECT event_ID, event_name, location FROM Events WHERE event_ID = $1";
        const eventResult = await pool.query(eventQuery, [row.event_id]);
        const event =
          eventResult.rows[0] || { event_name: "Unknown Event", location: null };

        // Get building and zone info using location
        const buildingData = event.location
          ? await getBuildingByLocation(event.location)
          : { building_name: "Unknown Building", zone_name: "Unknown Zone" };

        // Return full feedback object
        return {
          event_id: row.event_id,
          event_name: event.event_name,
          building: buildingData.building_name,
          zone: buildingData.zone_name,
          comment,
          rating,
        };
      })
    );

    // Send final data to frontend
    res.json(feedbackWithDetails);
  } catch (err) {
    console.error("Error in /feedback:", err.message);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});


// ------------------------
// 🔹 2. /feedback/filter - Filter feedback by sentiment, zone, or building
// ------------------------
app.get("/feedback/filter", async (req, res) => {
  try {
    const { sentiment, zone, building } = req.query; // Get filters from URL
    const response = await axios.get("http://localhost:3000");
    const rows = response.data.sampleRows;

    const feedbackWithDetails = await Promise.all(
      rows.map(async (row) => {
        let comment = null;
        let rating = null;
        try {
          const parsed = JSON.parse(row.text_content);
          comment = parsed.comment || null;
          rating = parsed.rating || null;
        } catch (e) {}

        const eventQuery =
          "SELECT event_ID, event_name, location FROM Events WHERE event_ID = $1";
        const eventResult = await pool.query(eventQuery, [row.event_id]);
        const event =
          eventResult.rows[0] || { event_name: "Unknown Event", location: null };

        const buildingData = event.location
          ? await getBuildingByLocation(event.location)
          : { building_name: "Unknown Building", zone_name: "Unknown Zone" };

        return {
          event_id: row.event_id,
          event_name: event.event_name,
          building: buildingData.building_name,
          zone: buildingData.zone_name,
          comment,
          rating,
        };
      })
    );

    // 🔍 Apply filters
    let filtered = feedbackWithDetails;

    // Filter by sentiment (positive, neutral, negative)
    if (sentiment) {
      if (sentiment === "positive")
        filtered = filtered.filter((r) => r.rating >= 4);
      else if (sentiment === "neutral")
        filtered = filtered.filter((r) => r.rating === 3);
      else if (sentiment === "negative")
        filtered = filtered.filter((r) => r.rating <= 2);
    }

    // Filter by zone or building
    if (zone)
      filtered = filtered.filter(
        (r) => r.zone.toLowerCase() === zone.toLowerCase()
      );
    if (building)
      filtered = filtered.filter(
        (r) => r.building.toLowerCase() === building.toLowerCase()
      );

    res.json(filtered); // Send filtered results
  } catch (err) {
    console.error("Error in /feedback/filter:", err.message);
    res.status(500).json({ error: "Failed to filter feedback" });
  }
});


// ------------------------
// 🔹 3. /feedback/satisfaction - Get satisfaction for one event
// ------------------------
app.get("/feedback/satisfaction", async (req, res) => {
  try {
    const { event_id } = req.query; // Get event_id from URL
    if (!event_id) {
      return res.status(400).json({ error: "Missing event_id parameter" });
    }

    // Get feedback data
    const response = await axios.get("http://localhost:3000");
    // Only include feedback for this event
    const rows = response.data.sampleRows.filter(
      (r) => String(r.event_id) === String(event_id)
    );

    // If no feedback found
    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: `No feedback found for event_id ${event_id}` });
    }

    // Extract ratings only
    const ratings = [];
    for (const row of rows) {
      try {
        const parsed = JSON.parse(row.text_content);
        if (parsed.rating !== undefined && parsed.rating !== null) {
          ratings.push(parsed.rating);
        }
      } catch (e) {}
    }

    // Calculate satisfaction rate
    const total = ratings.length;
    const positive = ratings.filter((r) => r >= 4).length; // ratings 4 or 5
    const satisfactionRate = total > 0 ? (positive / total) * 100 : 0;

    // Get event info
    const eventQuery =
      "SELECT event_ID, event_name, location FROM Events WHERE event_ID = $1";
    const eventResult = await pool.query(eventQuery, [event_id]);
    const event =
      eventResult.rows[0] || { event_name: "Unknown Event", location: null };

    // Get building and zone info
    const buildingData = event.location
      ? await getBuildingByLocation(event.location)
      : { building_name: "Unknown Building", zone_name: "Unknown Zone" };

    // Send response
    res.json({
      event_id,
      event_name: event.event_name,
      building: buildingData.building_name,
      zone: buildingData.zone_name,
      satisfaction_rate: satisfactionRate.toFixed(2) + " %",
    });
  } catch (err) {
    console.error("Error in /feedback/satisfaction:", err.message);
    res.status(500).json({ error: "Failed to calculate satisfaction rate" });
  }
});


// ------------------------
// 🔹 4. /feedback/rank - Rank events by average rating
// ------------------------
app.get("/feedback/rank", async (req, res) => {
  try {
    const { rank } = req.query; // Get rank number from URL
    const rankNumber = parseInt(rank) || 1;

    const response = await axios.get("http://localhost:3000");
    const rows = response.data.sampleRows;

    // Group ratings by event ID
    const eventRatings = {};
    for (const row of rows) {
      try {
        const parsed = JSON.parse(row.text_content);
        const rating = parsed.rating;
        if (rating !== undefined && rating !== null) {
          if (!eventRatings[row.event_id]) eventRatings[row.event_id] = [];
          eventRatings[row.event_id].push(rating);
        }
      } catch (e) {}
    }

    // Calculate average rating for each event
    const eventAverages = [];
    for (const [event_id, ratings] of Object.entries(eventRatings)) {
      const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length;

      // Get event and location info
      const eventQuery =
        "SELECT event_ID, event_name, location FROM Events WHERE event_ID = $1";
      const eventResult = await pool.query(eventQuery, [event_id]);
      const event =
        eventResult.rows[0] || { event_name: "Unknown Event", location: null };

      // Get building info
      const buildingData = event.location
        ? await getBuildingByLocation(event.location)
        : { building_name: "Unknown Building", zone_name: "Unknown Zone" };

      eventAverages.push({
        event_id,
        event_name: event.event_name,
        building: buildingData.building_name,
        zone: buildingData.zone_name,
        average_rating: parseFloat(avg.toFixed(2)),
      });
    }

    // Sort by highest rating first
    eventAverages.sort((a, b) => b.average_rating - a.average_rating);

    // Assign rank numbers (ties get same rank)
    let currentRank = 1;
    let lastRating = null;
    eventAverages.forEach((event, index) => {
      if (lastRating === null) {
        event.rank = currentRank;
        lastRating = event.average_rating;
      } else if (event.average_rating < lastRating) {
        currentRank = index + 1;
        event.rank = currentRank;
        lastRating = event.average_rating;
      } else {
        event.rank = currentRank;
      }
    });

    // Find events matching requested rank
    const filtered = eventAverages.filter((e) => e.rank === rankNumber);
    if (filtered.length === 0) {
      return res
        .status(404)
        .json({ message: `No events found for rank ${rankNumber}` });
    }

    // Send ranked events
    res.json({ rank: rankNumber, events: filtered });
  } catch (err) {
    console.error("Error in /feedback/rank:", err.message);
    res.status(500).json({ error: "Failed to calculate event rankings" });
  }
});

// ------------------------
// 🔹 5. /feedback/average - Get average rating for one event
// ------------------------
app.get("/feedback/average", async (req, res) => {
  try {
    const { event_id } = req.query; 
    if (!event_id) {
      return res.status(400).json({ error: "Missing event_id parameter" });
    }

    const response = await axios.get("http://localhost:3000");
    const rows = response.data.sampleRows;

    const eventFeedback = rows.filter(
      (r) => String(r.event_id) === String(event_id)
    );

    if (eventFeedback.length === 0) {
      return res
        .status(404)
        .json({ message: `No feedback found for event_id ${event_id}` });
    }

    const ratings = [];
    for (const row of eventFeedback) {
      try {
        const parsed = JSON.parse(row.text_content);
        if (parsed.rating !== undefined && parsed.rating !== null) {
          ratings.push(parsed.rating);
        }
      } catch (e) {}
    }

    const avg =
      ratings.length > 0
        ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2))
        : null;

    const eventQuery =
      "SELECT event_ID, event_name, location FROM Events WHERE event_ID = $1";
    const eventResult = await pool.query(eventQuery, [event_id]);
    const event =
      eventResult.rows[0] || { event_name: "Unknown Event", location: null };

    const buildingData = event.location
      ? await getBuildingByLocation(event.location)
      : { building_name: "Unknown Building", zone_name: "Unknown Zone" };

    res.json({
      event_id,
      event_name: event.event_name,
      building: buildingData.building_name,
      zone: buildingData.zone_name,
      average_rating: avg,
    });
  } catch (err) {
    console.error("Error in /feedback/average:", err.message);
    res.status(500).json({ error: "Failed to calculate average rating" });
  }
});

// ✅ Export app for testing purposes
module.exports = app;

// ✅ Start the server if not running in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`🚀 Feedback service running on http://localhost:${PORT}`);
  });
}


