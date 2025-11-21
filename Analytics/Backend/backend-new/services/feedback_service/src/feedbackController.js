const { getFeedbackWithDetails, getAverageRating } = require('./feedbackService');

async function fetchFeedback(req, res) {
  try {
    const data = await getFeedbackWithDetails();
    res.json({
      message: "✅ Feedback fetched with event + building details",
      feedback: data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

async function getEventAverageRating(req, res) {
  try {
    const eventId = parseInt(req.query.event_id);
    
    if (!eventId) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const data = await getAverageRating(eventId);
    res.json({
      message: "✅ Average rating fetched successfully",
      event_id: eventId,
      ...data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  fetchFeedback,
  getEventAverageRating,
};
