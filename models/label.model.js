const mongoose = require('mongoose');

const labelSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        color: {
            type: String,
            ewquired: true,
            default: "#"
        },
        icon: {
            type: String,
            required: true,
            default: "tag",
            trim: true,
        },
        workspaceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Workspace",
            default: null,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            daefault: null,
            index: true,
        },
        isDefault: {
            type: Boolean,
            default: false,
        }
    },
    { timestamps: true }
)

labelSchema.index({ name: 1, workspaceId: 1}, { unique: true });

module.exports = mongoose.model("Label", labelSchema);