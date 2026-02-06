import Order from "../model/OrderSchema.js";
import Table from "../model/TableSchema.js";

export const getActiveOrder = async (req, res) => {
  try {
    const { tableId } = req.params;

    const order = await Order.findOne({
      table: tableId,
      status: "active",
      owner: req.user._id,
    });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { tableId } = req.body;

    let order = await Order.findOne({
      table: tableId,
      status: "active",
      owner: req.user._id,
    });

    if (order) return res.json({ success: true, order });

    order = await Order.create({
      table: tableId,
      owner: req.user._id,
    });

    await Table.findByIdAndUpdate(tableId, {
      status: "occupied",
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: "Failed to create order" });
  }
};

export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, totalAmount } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: id, owner: req.user._id, status: "active" },
      { items, totalAmount },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: "Failed to update order" });
  }
};

export const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findOneAndUpdate(
      { _id: id, owner: req.user._id, status: "active" },
      { status: "completed" },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update table status to available
    await Table.findByIdAndUpdate(order.table, {
      status: "available",
    });

    res.json({ success: true, order, message: "Table cleared successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to complete order" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({ owner: req.user._id })
      .populate("table", "tableNumber")
      .sort({ createdAt: -1 });

    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};
