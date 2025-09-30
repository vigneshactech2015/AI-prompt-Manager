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
    },
    // Analytics fields
    viewCount:{
        type:Number,
        default:0
    },
    copyCount:{
        type:Number,
        default:0
    },
    favoriteCount:{
        type:Number,
        default:0
    }
})

module.exports = mongoose.model('Prompt',promptSchema)