const mongoose = require('mongoose');

const promptSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    aiTool:{
        type:String,
        required:true
    },
    isFavourite:{
        type:Boolean,
        default:false
    },
    userId:{
        type:String,
        required:true
    }
})

module.exports = mongoose.model('Prompt',promptSchema)