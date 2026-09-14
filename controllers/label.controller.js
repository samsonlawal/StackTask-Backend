const label = require("../models/label.model")

const DEFAULT_LABELS = [
  { name: "Bug", icon: "bug", color: "#EF4444", isDefault: true },
  { name: "Feature", icon: "sparkles", color: "#3B82F6", isDefault: true },
  { name: "Enhancement", icon: "trending-up", color: "#10B981", isDefault: true },
  { name: "Design", icon: "palette", color: "#EC4899", isDefault: true },
  { name: "Documentation", icon: "file-text", color: "#8B5CF6", isDefault: true },
  { name: "Urgent", icon: "flame", color: "#F97316", isDefault: true },
];

const createLabel = async (req, res) => {
    const { name, color, icon} = req.body
    const { workspaceId } = req.params
    const author = req.user.id

    if(!name.trim() || !name) {
        return res.status(400).json({ message: "Label name is required" })
    }

    const existing = await label.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, "i") },
        $or: [{ workspaceId }, { isDefault: true }]
    })

    if(existing) {
        return res.status(400).json({ message: "Label already exists" })
    }

    try {
        const newLabel = await label.create({
            name: name.trim(),
            color: color,
            icon: icon,
            workspaceId: workspaceId,
            isDefault: false,
            createdBy: author
        })

        return res.status(200).json({
            success: true,
            message: "Label created successfully",
            label: newLabel
        })
    } catch(error) {
        res.status(500).json({message:"Server error", error: error.message})
    }
}

const getLabels = async (req, res) => {
    
    const { workspaceId } = req.params

    try {
        const labels = await label.find({
            $or: [
                { workspaceId: workspaceId },
                { isDefault: true, workspaceId: null }
            ]
        })

        return res.status(200).json({
            success: true,
            message: "Label fetched successfully",
            label: labels   
        })
    } catch(error) {
res.status(500).json({ success: false, message: "Failed to fetch labels", error: error.message });
    }
}


module.exports = {
    createLabel,
    getLabels,
}