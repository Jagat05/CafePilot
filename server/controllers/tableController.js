import Table from "../model/TableSchema.js";

// Create table
export const createTable = async (req, res) => {
  try {
    const { tableNumber, capacity } = req.body;

    const exists = await Table.findOne({
      tableNumber,
      owner: req.user._id,
    });

    if (exists) {
      return res.status(400).json({ message: "Table already exists" });
    }

    const table = await Table.create({
      tableNumber,
      capacity,
      owner: req.user._id,
    });

    res.status(201).json({ success: true, table });
  } catch (err) {
    res.status(500).json({ message: "Failed to create table" });
  }
};

// Get all tables
export const getTables = async (req, res) => {
  try {
    const tables = await Table.find({
      owner: req.user._id,
    }).sort("tableNumber");

    res.json({ success: true, tables });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tables" });
  }
};
