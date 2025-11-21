// React and Hooks
import React, { useState, useEffect } from "react";
// Axios for API calls
import axios from "axios";
// Icons for UI
import { Star, MessageSquare, Loader } from "lucide-react";
// Chart.js imports
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// ✅ Define TypeScript interface for feedback data
interface Feedback {
  event_id: number;
  event_name: string;
  building: string;
  zone: string;
  comment: string | null;
  rating: number;
}

// 🧩 Main React component
const FeedbackWidget: React.FC = () => {
  // Store fetched feedback
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Stats for dashboard
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [histogram, setHistogram] = useState<{ [key: number]: number }>({});
  const [satisfactionRate, setSatisfactionRate] = useState<string>("0%");
  const [topEvents, setTopEvents] = useState<
    { event_name: string; average_rating: number }[]
  >([]);

  // Filter states
  const [sentiment, setSentiment] = useState<string>("");
  const [zone, setZone] = useState<string>("");
  const [building, setBuilding] = useState<string>("");

  // 🔹 Function to fetch all feedback (with optional filters)
  const fetchFeedback = async () => {
    setLoading(true); // show loading spinner
    try {
      let url = "http://localhost:5010/feedback"; // default endpoint

      // Add filters if any are selected
      const params = new URLSearchParams();
      if (sentiment) params.append("sentiment", sentiment);
      if (zone) params.append("zone", zone);
      if (building) params.append("building", building);

      // If there are filters, use /feedback/filter
      if (params.toString()) {
        url = `http://localhost:5010/feedback/filter?${params.toString()}`;
      }

      // Make API call
      const response = await axios.get(url);
      const data = response.data;

      // ✅ Handle valid data
      if (Array.isArray(data)) {
        setFeedback(data);
        setTotalReviews(data.length);

        // Calculate average rating
        const avg =
          data.length > 0
            ? data.reduce((sum, fb) => sum + fb.rating, 0) / data.length
            : 0;
        setAverageRating(avg);

        // Build histogram for ratings 1–5
        const hist: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        data.forEach((fb: Feedback) => {
          if (fb.rating >= 1 && fb.rating <= 5) hist[fb.rating]++;
        });
        setHistogram(hist);

        // Calculate satisfaction percentage (rating ≥ 4)
        const positive = data.filter((fb) => fb.rating >= 4).length;
        const satisfaction =
          data.length > 0
            ? ((positive / data.length) * 100).toFixed(2) + "%"
            : "0%";
        setSatisfactionRate(satisfaction);
      } else {
        // If no valid data
        setFeedback([]);
        setTotalReviews(0);
        setAverageRating(0);
        setHistogram({});
        setSatisfactionRate("0%");
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
    } finally {
      setLoading(false); // stop loading spinner
    }
  };

  // 🔹 Function to fetch top 3 rated events
  const fetchTopEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5010/feedback");
      const data: Feedback[] = response.data;

      // Group ratings by event name
      const eventMap: Record<string, number[]> = {};
      data.forEach((fb) => {
        if (!eventMap[fb.event_name]) eventMap[fb.event_name] = [];
        eventMap[fb.event_name].push(fb.rating);
      });

      // Calculate averages
      const averages = Object.entries(eventMap).map(([event_name, ratings]) => ({
        event_name,
        average_rating: ratings.reduce((a, b) => a + b, 0) / ratings.length,
      }));

      // Sort by average rating and take top 3
      const top3 = averages
        .sort((a, b) => b.average_rating - a.average_rating)
        .slice(0, 3);
      setTopEvents(top3);
    } catch (error) {
      console.error("Error fetching top events:", error);
    }
  };

  // 🪄 Load feedback & top events automatically when filters change
  useEffect(() => {
    fetchFeedback();
    fetchTopEvents();
  }, [sentiment, zone, building]);

  // 🎨 Decide background color based on rating
  const getSentimentColor = (rating: number) => {
    const colors: Record<number, string> = {
      1: "border-l-red-500 bg-red-50",
      2: "border-l-orange-500 bg-orange-50",
      3: "border-l-yellow-500 bg-yellow-50",
      4: "border-l-green-500 bg-green-50",
      5: "border-l-blue-500 bg-blue-50",
    };
    return colors[rating] ?? "border-l-gray-500 bg-gray-50";
  };

  // 📊 Chart.js bar chart configuration
  const barChartData = {
    labels: ["1", "2", "3", "4", "5"], // rating labels
    datasets: [
      {
        label: "Number of Ratings",
        data: [
          histogram[1] || 0,
          histogram[2] || 0,
          histogram[3] || 0,
          histogram[4] || 0,
          histogram[5] || 0,
        ],
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  // 🧱 UI layout
  return (
    <div className="space-y-6">
      {/* Load Data Button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={fetchFeedback}
          className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {loading ? <Loader size={16} className="animate-spin" /> : "Load Data"}
        </button>
      </div>

      {/* Filter Dropdowns */}
      <div className="flex space-x-4 mt-4">
        {/* Sentiment Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Sentiment</label>
          <select
            value={sentiment}
            onChange={(e) => setSentiment(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Sentiments</option>
            <option value="positive">Positive</option>
            <option value="neutral">Neutral</option>
            <option value="negative">Negative</option>
          </select>
        </div>

        {/* Zone Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Zone</label>
          <select
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Zones</option>
            <option value="North Wing">North Wing</option>
            <option value="South Wing">South Wing</option>
            <option value="East Wing">East Wing</option>
            <option value="West Wing">West Wing</option>
            <option value="Central Hall">Central Hall</option>
          </select>
        </div>

        {/* Building Filter */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Building</label>
          <select
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="">All Buildings</option>
            <option value="Innovation Center">Innovation Center</option>
            <option value="Robotics Lab">Robotics Lab</option>
            <option value="AI Pavilion">AI Pavilion</option>
            <option value="Electronics Hall">Electronics Hall</option>
            <option value="Main Auditorium">Main Auditorium</option>
          </select>
        </div>
      </div>

      {/* Chart and Stats Section */}
      <div className="flex items-start justify-between gap-8">
        {/* Bar Chart for rating distribution */}
        <div className="w-3/5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Distribution</h3>
          <div className="h-64">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
        </div>

        {/* Stats cards on right side */}
        <div className="w-2/5 space-y-6">
          {/* Average Rating Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Star size={24} className="text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}/5</p>
                <p className="text-sm text-gray-600">Overall Rating</p>
              </div>
            </div>
          </div>

          {/* Total Reviews Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <MessageSquare size={24} className="text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{totalReviews}</p>
                <p className="text-sm text-gray-600">Total Reviews</p>
              </div>
            </div>
          </div>

          {/* Satisfaction Rate Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center space-x-3">
              <Star size={24} className="text-green-500" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{satisfactionRate}</p>
                <p className="text-sm text-gray-600">Satisfaction Rate</p>
              </div>
            </div>
          </div>

          {/* Top 3 Events Card */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Top 3 Rated Events</h4>
            <ul className="text-gray-600 text-sm">
              {topEvents.length === 0 ? (
                <li>No data available</li>
              ) : (
                topEvents.map((e, idx) => (
                  <li key={idx}>
                    {idx + 1}. {e.event_name} — {e.average_rating.toFixed(1)}/5
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Feedback List */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Feedback</h3>
        <div className="space-y-4">
          {feedback.length === 0 ? (
            <p className="text-gray-500 text-sm">No feedback available.</p>
          ) : (
            feedback.map((fb, i) => (
              <div
                key={i}
                className={`border-l-4 p-4 rounded-lg ${getSentimentColor(fb.rating)}`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2 mb-2">
                    {/* Display stars for rating */}
                    <div className="flex space-x-1">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          size={16}
                          className={
                            idx < fb.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      Event: {fb.event_name}
                    </span>
                  </div>
                  <p className="text-gray-700">{fb.comment || "No comment provided."}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Building: {fb.building} | Zone: {fb.zone}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Export component
export default FeedbackWidget;
