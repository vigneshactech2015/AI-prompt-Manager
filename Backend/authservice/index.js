require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes')

const app = express();

const PORT = process.env.PORT;

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());

app.use('/api/authService',userRoutes)


app.listen(PORT,()=>{
    console.log(`auth service is listening on ${PORT}`)
    mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Auth service Connected to MongoDB Atlas'))
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
})
