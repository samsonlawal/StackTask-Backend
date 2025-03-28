const Workspace = require("../models/workspace.model");

const getWorkspaces = async (req, res) => {
  try {
    const workspace = await Workspace.find({});
    res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await Workspace.findById(id);

    if (!workspace) {
      return res.status(404).json({ message: "workspace not found" });
    }
    res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.create(req.body);
    res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await Workspace.findByIdAndUpdate(id);

    if (!workspace) {
      return res.status(404).json({ message: "workspace not found" });
    }
    res.status(200).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWorkspace = async (req, res) => {
  try {
    const { id } = req.params;
    const workspace = await Workspace.findByIdAndDelete(id);

    if (!workspace) {
      return res.status(404).json({ message: "workspace not found" });
    }
    res.status(200).json({ message: "Workspace deleted successfully!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getWorkspaces,
  getSingleWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
};
