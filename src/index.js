require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('AI Flight Booking Backend is Running ✅');
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

// const supabase = require('./utils/supabaseClient.js')

// async function testSupabase() {
//   const { data, error } = await supabase.from("users").select("*").limit(1);
//   if (error) {
//     console.error("Supabase error:", error.message);
//   } else {
//     console.log("✅ Supabase connected. Sample user data:", data);
//   }
// }
// testSupabase();
