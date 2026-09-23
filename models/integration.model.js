const mongoose = require("mongoose");

const integrationSchema = new mongoose.Schema(
  {},
  {
    timestamps: true,
  }
);

integrationSchema.index({ task: 1, createdAt: -1 });

module.exports = mongoose.model("Integration", integrationSchema);