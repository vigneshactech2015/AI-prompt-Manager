const express = require('express')
require('dotenv').config();
const mongoose = require('mongoose')

const promptRoutes = require('./routes/promptRoutes');

const app = express()
const PORT = process.env.PORT
const cors = require('cors');

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json())

app.use('/api/promptService', promptRoutes);

app.listen(PORT,()=>{
    console.log(`prompt service is listening on port number ${PORT}`)

    mongoose.connect(process.env.MONGODB_URI).then(()=>console.log('prompt service connected to database')).catch((err)=>
       { 
        console.log('Error in connecting prompt service to database',err)
        process.exit(1)
        }
)})

