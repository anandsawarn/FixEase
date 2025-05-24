import UserQuery from "../models/UserQueryModels.js";

// Create new query
export const createQuery = async (req, res) => {
  try {
    const { name, phoneNumber, query } = req.body;
    const newQuery = await UserQuery.create({
      name,
      phoneNumber,
      query,
      status: "pending", // Explicitly set initial status
      attended: false, // Initial attended status
    });
    res.status(201).json(newQuery);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all queries
export const getAllQueries = async (req, res) => {
  try {
    const queries = await UserQuery.find().sort({ createdAt: -1 });
    res.status(200).json(queries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update query status
export const updateQueryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updateData = {
      status,
      attended: status === "resolved", // Map status to attended boolean
      updatedAt: new Date(),
    };

    if (status === "resolved") {
      updateData.resolvedAt = new Date();
    }

    const updatedQuery = await UserQuery.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedQuery) {
      return res.status(404).json({ error: "Query not found" });
    }

    res.status(200).json(updatedQuery);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};