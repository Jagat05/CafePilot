import Staff from "../model/StaffSchema.js";

export const getStaff = async (req, res) => {
  try {
    const staffList = await Staff.find({ owner: req.user._id }).sort({
      createdAt: -1,
    });

    // Prepend logged-in owner as admin in the staff list
    const ownerAsAdmin = {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: "",
      role: "admin",
      status: req.user.status === "approved" ? "active" : "inactive",
      hireDate: req.user.createdAt,
      owner: req.user._id,
      isOwner: true,
    };

    const staff = [ownerAsAdmin, ...staffList.map((s) => s.toObject())];
    res.json({ success: true, staff });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch staff" });
  }
};

export const createStaff = async (req, res) => {
  try {
    const { name, email, phone, role, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const existing = await Staff.findOne({
      email: email.toLowerCase(),
      owner: req.user._id,
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: "A staff member with this email already exists" });
    }

    const member = await Staff.create({
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      role: role || "barista",
      status: status || "active",
      owner: req.user._id,
    });

    res.status(201).json({ success: true, staff: member });
  } catch (err) {
    res.status(500).json({ message: "Failed to create staff member" });
  }
};

export const updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status } = req.body;

    const member = await Staff.findOneAndUpdate(
      { _id: id, owner: req.user._id },
      { name, email, phone, role, status },
      { new: true }
    );

    if (!member) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.json({ success: true, staff: member });
  } catch (err) {
    res.status(500).json({ message: "Failed to update staff member" });
  }
};

export const deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Staff.findOneAndDelete({
      _id: id,
      owner: req.user._id,
    });

    if (!member) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    res.json({ success: true, message: "Staff member removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete staff member" });
  }
};

export const toggleStaffStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const member = await Staff.findOne({ _id: id, owner: req.user._id });
    if (!member) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    member.status = member.status === "active" ? "inactive" : "active";
    await member.save();

    res.json({ success: true, staff: member });
  } catch (err) {
    res.status(500).json({ message: "Failed to update status" });
  }
};
