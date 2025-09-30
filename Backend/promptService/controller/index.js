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
        
        // Update the prompt and increment/decrement favorite count
        const prompt = await Prompt.findById(id);
        if (!prompt) {
            return res.status(404).json({data:{message:"Prompt not found"}});
        }
        
        let updateData = { isFavourite };
        
        // If marking as favorite, increment favoriteCount
        if (isFavourite && !prompt.isFavourite) {
            updateData.favoriteCount = prompt.favoriteCount + 1;
        }
        // If unmarking as favorite, decrement favoriteCount
        else if (!isFavourite && prompt.isFavourite) {
            updateData.favoriteCount = Math.max(0, prompt.favoriteCount - 1);
        }
        
        await Prompt.findByIdAndUpdate(id, updateData);
        return res.status(200).json({data:{message:"Prompt has been marked as favorite"}})
    }catch(err){
        console.log('Error in marking the favorite',err)
        return res.status(500).json({data:{message:'Error in marking the prompt as favorite'}})
    }
}

// Track when a prompt is viewed
const trackPromptView = async(req, res) => {
    try {
        const { id } = req.params;
        
        await Prompt.findByIdAndUpdate(id, {
            $inc: { viewCount: 1 },
        });
        
        return res.status(200).json({data:{message:"Prompt view tracked successfully"}});
    } catch(err) {
        console.log('Error in tracking prompt view', err);
        return res.status(500).json({data:{message:'Error in tracking prompt view'}});
    }
}

// Track when a prompt is copied
const trackPromptCopy = async(req, res) => {
    try {
        const { id } = req.params;
        
        await Prompt.findByIdAndUpdate(id, {
            $inc: { copyCount: 1 }
        });
        
        return res.status(200).json({data:{message:"Prompt copy tracked successfully"}});
    } catch(err) {
        console.log('Error in tracking prompt copy', err);
        return res.status(500).json({data:{message:'Error in tracking prompt copy'}});
    }
}

// Get single prompt with tracking
const getPromptById = async(req, res) => {
    try {
        const { id } = req.params;
        
        // Get the prompt and increment view count
        const prompt = await Prompt.findByIdAndUpdate(id, {
            $inc: { viewCount: 1 },
        }, { new: true });
        
        if (!prompt) {
            return res.status(404).json({data:{message:"Prompt not found"}});
        }
        
        return res.status(200).json({data: prompt});
    } catch(err) {
        console.log('Error in fetching prompt', err);
        return res.status(500).json({data:{message:'Error in fetching prompt'}});
    }
}

module.exports = {
    getPrompts,
    addPrompt,
    deletePrompt,
    updatePrompt,
    favouritePrompt,
    trackPromptView,
    trackPromptCopy,
    getPromptById
}