require('dotenv').config();
// Local router DNS doesn't support SRV records — use Google DNS for Atlas connection
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/cities', require('./routes/cities'));
app.use('/api/hospitals', require('./routes/hospitals'));
app.use('/api/tokens', require('./routes/tokens'));
app.use('/api/queue', require('./routes/queue'));
app.use('/api/prescriptions', require('./routes/prescriptions'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/waitlist', require('./routes/waitlist'));
app.use('/api/admin', require('./routes/admin'));

app.get('/health', (_, res) => res.json({ status: 'ok' }));

mongoose
  .connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 60000,
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    family: 4,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
