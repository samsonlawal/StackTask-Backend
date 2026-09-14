const Comment = require("../models/comment.model");
const Task = require("../models/task.model");

const createComment = async (req, res) => {

    try {
        // get the all the content from the requst body and params
        // const { taskId } = req.body;
        const { taskId, content, parentCommentId, attachments } = req.body;
        const author = req.user.id;

        // validate the content
        if(!content || !content.trim()) {
            return res.status(400).json({
                message: "Content cannot be empty"
            })
        }

        console.log(req.body)

        // verify that the  task exists
        const task = await Task.findById(taskId);
        if(!task) {
            return res.status(404).json({
                message: "task not found"
            })
        }

        // if(parentCommentId) {
        //   const parentComment = await Comment.findById(parentCommentId);
        //     if(!parentComment) {
        //         return res.status(404).json({
        //             message: "Parent comment not found"
        //         })
        //     }
        // }

        // create the comment
        const comment = await Comment.create({
        taskId,
        author,
        content,
        parentCommentId: parentCommentId || null,
        attachments: attachments || [],
        })

        const populatedComment = await Comment.findById(comment._id).populate(
            "author",
            "fullname email username profileImage"
        )

        // send a response with
        return res.status(201).json({
            success: true,
            message: "Comment created Successfully",
            comment: populatedComment
        })


    // send an error
    } catch (error) {
        console.log("Error creating comment:", error);
        return res.status(500).json({
            message: "Server error",
            error: error.message
        })
    }
}


const getTaskComments = async (req, res) => {
  try {
    const { taskId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const totalComments = await Comment.countDocuments({ taskId });
    const comments = await Comment.find({ taskId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "fullname email username profileImage")
      .populate({
        path: "reactions.users",
        select: "fullname username profileImage",
      });
    const totalPages = Math.ceil(totalComments / limit);
    return res.status(200).json({
      success: true,
      comments,
    });
  } catch (error) {
    console.error("Error fetching comments:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Comment content cannot be empty" });
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Only the author can update their comment
    if (comment.author.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to update this comment" });
    }

    comment.content = content.trim();
    comment.edited = true;
    await comment.save();
    const updatedComment = await Comment.findById(id).populate(
      "author",
      "fullname username profileImage"
    );

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      comment: updatedComment,
    });


  } catch (error) {
    console.error("Error updating comment:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


const deleteComment = async (req, res) => {
  try {
    console.log(req.params)
    const { commentId } = req.params;
    const userId = req.user.id;
    const comment = await Comment.findById(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // you shouldnt even see delete if the comment is not yours
    // Authorization check: Author can delete
    // if (comment.author.toString() !== userId) {
    //   return res.status(403).json({ message: "Not authorized to delete this comment" });
    // }

    // Delete child replies if any
    // await Comment.deleteMany({ parentCommentId: id });


    // Delete the comment itself
    await Comment.findByIdAndDelete(commentId);
    return res.status(200).json({
      success: true,
      message: "Comment deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


const toggleReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;
    if (!emoji) {
      return res.status(400).json({ message: "Emoji is required" });
    }
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    // Find existing reaction for this emoji
    let reaction = comment.reactions.find((r) => r.emoji === emoji);
    if (reaction) {
      const userIndex = reaction.users.indexOf(userId);
      if (userIndex > -1) {
        // User already reacted -> remove reaction
        reaction.users.splice(userIndex, 1);
        if (reaction.users.length === 0) {
          // Remove emoji entry if no users left
          comment.reactions = comment.reactions.filter((r) => r.emoji !== emoji);
        }
      } else {
        // Add user to existing emoji reaction
        reaction.users.push(userId);
      }
    } else {
      // Add new emoji reaction with this user
      comment.reactions.push({
        emoji,
        users: [userId],
      });
    }
    await comment.save();
    const updatedComment = await Comment.findById(id)
      .populate("author", "fullname username profileImage")
      .populate({
        path: "reactions.users",
        select: "fullname username profileImage",
      });
    return res.status(200).json({
      success: true,
      comment: updatedComment,
    });
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


module.exports = {
  createComment,
  getTaskComments,
  updateComment,
  deleteComment,
  toggleReaction,
}