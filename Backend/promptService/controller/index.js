const Prompt =  require('../models/Prompt');

const getPrompts = async(req,res)=>{
    // fetch the prompt from mongodb based on userId
    try{
         const response = await Prompt.find({userId:req.userId})
         return res.status(200).json({data:response})
    }catch (err){
        console.log('Error in fetching prompts',err)
        return res.status(500).json({data:{message:'Unable to fetch the prompts'}})
        
    }
}

const addPrompt = async(req,res)=>{
    try{
        const {title,description,aiTool,isFavorite} = req.body;
        const newPrompt = new Prompt({title,description,aiTool,isFavorite,userId:req.userId}) 
        await newPrompt.save()
        return res.status(201).json({data:{message:"Prompt has been added successfully"}})
    }catch(err){
        console.log('Error in adding prompt',err)
        return res.status(500).json({data:{message:'Adding prompt process failed'}})
    }
}

const deletePrompt = async(req,res)=>{
    try{
        await Prompt.findOneAndDelete({_id:req.body.id})
        return res.status(200).json({data:{message:"Prompt has been deleted successfully"}})
    }catch(err){
        console.log('Error in deleting prompts',err)
        return res.status(500).json({data:{message:'Prompt not deleted'}})
    }
}

const updatePrompt = async(req,res)=>{
    try{
        const {title,description,aiTool,isFavourite,id} = req.body
        await Prompt.findByIdAndUpdate(id, {title,description,aiTool,isFavourite})
        return res.status(200).json({data:{message:"Prompt has been updated successfully"}})
    }catch(err){
        console.log('Error in updating Prompt',err)
        return res.status(500).json({data:{message:'Prompt not updated'}})
    }
}

const favouritePrompt = async(req,res)=>{
    try{
        const {isFavourite,id} = req.body
        await Prompt.findByIdAndUpdate(id,{isFavourite})
        return res.status(200).json({data:{message:"Prompt has been marked as favorite"}})
    }catch(err){
        console.log('Error in marking the favorite',err)
        return res.status(500).json({data:{message:'Error in marking the prompt as favorite'}})
    }
}

module.exports = {getPrompts,addPrompt,deletePrompt,updatePrompt,favouritePrompt}