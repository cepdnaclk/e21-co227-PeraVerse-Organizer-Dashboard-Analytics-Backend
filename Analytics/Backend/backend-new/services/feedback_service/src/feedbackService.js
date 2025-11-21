const supabase = require('./db');

async function getFeedbackWithDetails() {
  // Step 1: get all feedback
  const { data: feedbackData, error: feedbackError } = await supabase
    .from('feedback')
    .select('feedback_id, event_id, text_content, created_at');

  if (feedbackError) throw feedbackError;

  // Step 2: get all events
  const { data: eventData, error: eventError } = await supabase
    .from('events')
    .select('event_id, event_name, building_id');

  if (eventError) throw eventError;

  // Step 3: get all buildings
  const { data: buildingData, error: buildingError } = await supabase
    .from('buildings')
    .select('building_id, building_name');

  if (buildingError) throw buildingError;

  // Step 4: join manually
  const result = feedbackData.map(fb => {
    const parsed = JSON.parse(fb.text_content || '{}');
    const event = eventData.find(e => e.event_id === fb.event_id);
    const building = buildingData.find(b => b.building_id === event?.building_id);

    return {
      event_id: fb.event_id,
      event_name: event?.event_name || "Unknown Event",
      building_name: building?.building_name || "Unknown Building",
      comment: parsed.comment || null,
      rating: parsed.rating || null,
      created_at: fb.created_at,
    };
  });

  return result;
}

async function getAverageRating(eventId) {
  const { data: feedbackData, error: feedbackError } = await supabase
    .from('feedback')
    .select('text_content')
    .eq('event_id', eventId);

  if (feedbackError) throw feedbackError;

  if (!feedbackData || feedbackData.length === 0) {
    return { average: 0, count: 0 };
  }

  const ratings = feedbackData
    .map(fb => {
      const parsed = JSON.parse(fb.text_content || '{}');
      return parsed.rating;
    })
    .filter(rating => rating !== null && rating !== undefined);

  const sum = ratings.reduce((acc, curr) => acc + curr, 0);
  const average = ratings.length > 0 ? sum / ratings.length : 0;

  return {
    average: Number(average.toFixed(2)),
    count: ratings.length
  };
}

module.exports = {
  getFeedbackWithDetails,
  getAverageRating,
};
