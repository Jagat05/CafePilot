import Menu from "../model/MenuSchema.js";

export const getMenuItems = async (req, res) => {
    try {
        const menuItems = await Menu.find({ owner: req.user._id });
        res.json({ success: true, menuItems });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch menu items" });
    }
};

export const createMenuItem = async (req, res) => {
    try {
        const { name, category, price, description, available } = req.body;

        if (!name || !category || !price) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const menuItem = await Menu.create({
            name,
            category,
            price,
            description,
            available,
            owner: req.user._id,
        });

        res.status(201).json({ success: true, menuItem });
    } catch (err) {
        res.status(500).json({ message: "Failed to create menu item" });
    }
};

export const updateMenuItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, description, available } = req.body;

        const menuItem = await Menu.findOneAndUpdate(
            { _id: id, owner: req.user._id },
            { name, category, price, description, available },
            { new: true }
        );

        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        res.json({ success: true, menuItem });
    } catch (err) {
        res.status(500).json({ message: "Failed to update menu item" });
    }
};

export const deleteMenuItem = async (req, res) => {
    try {
        const { id } = req.params;

        const menuItem = await Menu.findOneAndDelete({
            _id: id,
            owner: req.user._id,
        });

        if (!menuItem) {
            return res.status(404).json({ message: "Menu item not found" });
        }

        res.json({ success: true, message: "Menu item deleted" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete menu item" });
    }
};
