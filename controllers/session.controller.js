const Session = require("../models/session.model");

const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({userId: req.user.id})
    console.log(req.user.id);

    console.log(sessions);

    res.status(200).json(sessions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

const deleteSession = async(req,res) => {
    try {
        const { id } = req.params
        const session = await Session.findOneAndDelete({_id: id, userid: req.user.id})
        if(!session) {
            return res.status(404).json({
                message: "Session not found or you don't have access to it."
            })
        }

        res.status(200).json({
            success: true,
            message: "Session deleted successfully",
            deletedSession: session
        })
    } catch(error) {
        console.log(error);
        res.status(500).json({message: error.message});
    }
}

module.exports = {getSessions, deleteSession}