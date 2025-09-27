const express = require('express')
require('dotenv').config();
const mongoose = require('mongoose')

const app = express()
const PORT = process.env.PORT
const AUTHSERVICEURL = process.env.AUTHSERVICEURL
const cors = require('cors');
const Prompt =  require('./models/Prompt');

app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json())



// hit the auth service and check if token is valid or not
const getUserId = async (req,res,next) => {
    try{
        const response =  await axios.post(AUTHSERVICEURL,{},{
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer token'
            }
        })
        if(response.status == 200){
            next()
        }else {
           return res.send(401).json({data:{message:'Token is not valid'}})
        }
      
    }  catch(err){
        return res.send(401).json({data:{message:'Unable to hit the auth service'}})
    } 
}


app.get('/api/promptService/getPrompts',getUserId,async(req,res)=>{
    console.log('user Id from req',req.user.userId)
    // fetch the prompt from mongodb based on userId
    try{
         const response = await Prompt.find({userId:req.user.userName})
         return res.send(200).json({data:response})
    }catch (err){
        console.log('Error in fetching prompts',err)
        return res.send(500).json({data:{message:'Internal server Error'}})
        
    }
})

app.post('/api/promptService/addPrompt',getUserId,async(req,res)=>{
    console.log('user Id from req',req.user.userId)
    try{
        const {title,description,aiTool,isFavorite} = req.body;
        const newPrompt = new Prompt({title,description,aiTool,isFavorite,userId:req.user.userName}) 
        await newPrompt.save()
        res.send(201).json({data:{message:"Prompt has been added successfully"}})
    }catch(err){
        console.log('Error in adding prompt',err)
        return res.send(500).json({data:{message:'Adding prompt process failed'}})
    }
})

app.listen(PORT,()=>{
    console.log(`prompt service is listening on port number ${PORT}`)

    mongoose.connect(process.env.MONGODB_URI).then(()=>console.log('prompt service connected to database')).catch((err)=>
       { 
        console.log('Error in connecting prompt service to database',err)
        process.exit(1)
        }
)})

