const express = require('express');
const consul = require('consul')({ host: 'consul' });
const cors = require('cors');

const app = express();

const serviceName = 'auth-service';
const serviceId = 'auth-service';
const PORT = 3002;

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());



app.get('/health', (req, res) => res.send('OK'));

app.post('/register',(req,res)=>{
    const {userName,password} = req.body;
     if(!userName || !password){
        return res.status(400).json({data:{message : "Username / password cannot be empty"}})
    }
    // if user is already present
    const ifUserExists = false;
    if(ifUserExists) {
        return res.status(409).json({data:{message:"This username already exists . please use the valid credentials to login"}})
    }
    // save the details in database and return the response
    return res.status(201).json({data:{message:"user created successfully"}})

})

app.post('/logout',(req,res)=>{
    const {token} = req.body
    if(token){
        // clear the token
        return res.status(201).json({data:{message:"User logout successfully"}})
    }

})

app.post('/login',(req,res)=>{
    const {userName,password} = req.body;
    if(!userName || !password){
        return res.status(400).json({data:{message : "Username / password cannot be empty"}})
    }
    if(userName === "vignesh" && password === "password"){
        return res.status(201).json({data:{token : "token"}})
    }
   return res.status(401).json({data:{message : "invalid credentials"}})
})


app.listen(PORT,()=>{
    console.log(`auth service is listening on ${PORT}`)
})
