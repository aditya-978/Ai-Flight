const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabaseClient');

const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  const hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([{ name, email, password_hash: hash }]);

  if (error) return res.status(400).json({ error: error.message });

  res.status(201).json({ message: 'User registered successfully ✅' });
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) return res.status(400).json({ error: 'User not found' });

  const match = await bcrypt.compare(password, data.password_hash);

  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ userId: data.id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });

  res.status(200).json({ token });
};

module.exports = { registerUser, loginUser };
