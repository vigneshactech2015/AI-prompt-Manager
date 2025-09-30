const Prompt =  require('../models/Prompt');

const getReport = async(req,res)=>{
    try{

        // fetch all prompt and do calculation for report
         const response = await Prompt.find()
         return res.status(200).json({data:response})
    }catch (err){
        console.log('Error in fetching report',err)
        return res.status(500).json({data:{message:'Unable to fetch the report'}})
        
    }
}


module.exports = {getReport}