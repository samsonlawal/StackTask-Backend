const Activity = require('../models/activity.model')

exports.getTaskActivities = async(req, res) => {
    const {taskId} = req.params

    console.log(taskId)


    if (!taskId) {
        return res.status(500).json({
            success: false,
            error: "Task ID is required"
        })
    }

    

   try {
     const activities = await Activity.find({taskId})
     .populate("actor", "fullname username email profileImage")
     .sort({ createdAt: -1})
    
    return res.status(200).json({
            success: true,
            activities
        })
   } catch (error) {
    console.log(error)
     return res.status(500).json({
            success: false,
            message: "Failed to get activities",
            error: error.message
        })
   }
    
}