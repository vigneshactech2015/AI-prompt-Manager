const express = require('express')
require('dotenv').config();
const mongoose = require('mongoose')
const axios = require('axios')

const app = express()
const PORT = process.env.PORT
const AUTHSERVICEURL = `${process.env.AUTHSERVICEURL}`
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
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1]; 

        const response =  await axios.post(AUTHSERVICEURL,{},{
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
        if(response.status == 200){
            req.userId = response.data.data.user.userId
            next()
        }else {
           return res.status(401).json({data:{message:'Token is not valid'}})
        }
      
    }  catch(err){
        console.log('unable to hit auth service',err)
        return res.status(401).json({data:{message:'Unable to hit the auth service'}})
    } 
}


app.get('/api/promptService/getPrompts',getUserId,async(req,res)=>{
    // fetch the prompt from mongodb based on userId
    try{
         const response = await Prompt.find({userId:req.userId})
         return res.status(200).json({data:response})
    }catch (err){
        console.log('Error in fetching prompts',err)
        return res.status(500).json({data:{message:'Unable to fetch the prompts'}})
        
    }
})

app.post('/api/promptService/addPrompt',getUserId,async(req,res)=>{
    try{
        const {title,description,aiTool,isFavorite} = req.body;
        const newPrompt = new Prompt({title,description,aiTool,isFavorite,userId:req.userId}) 
        await newPrompt.save()
        return res.status(201).json({data:{message:"Prompt has been added successfully"}})
    }catch(err){
        console.log('Error in adding prompt',err)
        return res.status(500).json({data:{message:'Adding prompt process failed'}})
    }
})

app.delete('/api/promptService/deletePrompt',getUserId,async(req,res)=>{
    try{
        await Prompt.findOneAndDelete({_id:req.body.id})
        return res.status(200).json({data:{message:"Prompt has been deleted successfully"}})
    }catch(err){
        console.log('Error in deleting prompts',err)
        return res.status(500).json({data:{message:'Prompt not deleted'}})
    }
})

app.patch('/api/promptService/updatePrompt',getUserId,async(req,res)=>{
    try{
        const {title,description,aiTool,isFavourite,id} = req.body
        await Prompt.findByIdAndUpdate(id, {title,description,aiTool,isFavourite})
        return res.status(200).json({data:{message:"Prompt has been updated successfully"}})
    }catch(err){
        console.log('Error in updating Prompt',err)
        return res.status(500).json({data:{message:'Prompt not updated'}})
    }
})

app.patch('/api/promptService/favoritePrompt',getUserId,async(req,res)=>{
    try{
        const {isFavourite,id} = req.body
        await Prompt.findByIdAndUpdate(id,{isFavourite})
        return res.status(200).json({data:{message:"Prompt has been marked as favorite"}})
    }catch(err){
        console.log('Error in marking the favorite',err)
        return res.status(500).json({data:{message:'Error in marking the prompt as favorite'}})
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

