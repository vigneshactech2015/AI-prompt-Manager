const express = require('express')
require('dotenv').config();
const mongoose = require('mongoose');

const app = express()
const PORT = process.env.PORT
const cors = require('cors');

const analyticRoutes = require('./routes/analyticRoutes')

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json())

app.use('/api/analyticService',analyticRoutes)

app.listen(PORT,()=>{
    console.log(`analytic service is listening on port number ${PORT}`)

    mongoose.connect(process.env.MONGODB_URI).then(()=>console.log('analytic service connected to database')).catch((err)=>{
        console.log('Error in connecting analytic service to database',err)
        process.exit(1)
    })
})