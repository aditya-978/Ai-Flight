const supabase = require("../utils/supabaseClient.js");
const axios = require('axios');

const searchFlights = async (req, res) => {
  try {
    const { source, destination, date } = req.body;

    // 1. Fetch all flights from DB
    const { data: flights, error } = await supabase
      .from("flights")
      .select("*")
      .eq("departure_airport", source)
      .eq("arrival_airport", destination);

    if (error) throw error;

    // 2. Ask Groq (AI) to rank/choose flights by IDs
    const aiResponse = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama3-8b-8192", // ✅ latest supported model
        messages: [
          {
            role: "system",
            content:
              "You are a flight recommendation engine. Return only flight IDs in order of preference."
          },
          {
            role: "user",
            content: `Here are the available flights:\n${JSON.stringify(
              flights,
              null,
              2
            )}`
          }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    // 3. Extract AI flight IDs
    let aiChoice = [];
    try {
      aiChoice = JSON.parse(aiResponse.data.choices[0].message.content);
    } catch (err) {
      console.warn("AI response parsing failed:", err);
    }

    // 4. Map IDs to DB flights
    const recommended = aiChoice
      .map((id) => flights.find((f) => f.id === id))
      .filter(Boolean);

    // 5. Send clean separation
    res.json({
      aiChoice,       // just IDs from Groq
      dbFlights: flights,  // all flights from your DB
      recommended     // full records Groq actually picked
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {searchFlights}