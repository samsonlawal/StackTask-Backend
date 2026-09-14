const mongoose = require("mongoose");

const integrationSchema = new mongoose.Schema(
    {



   
    }, 
    { 
        timestamp: true
    }

)

integrationSchema.index({task: 1, createdAt: -1})

module.exports = mongoose.Schema({"Integration", integrationSchema})