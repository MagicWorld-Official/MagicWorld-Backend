// controllers/contactController.js
import Contact from "../models/Contact.js";

// PUBLIC: Submit contact message
export const submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const contact = new Contact({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    await contact.save();

    res.json({ success: true, message: "Message sent successfully! We'll reply soon." });
  } catch (err) {
    console.error("Contact submit error:", err);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

// ADMIN: Get all contact messages
export const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, contacts });
  } catch (err) {
    console.error("Get contacts error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
};

// ADMIN: Mark as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Contact.findByIdAndUpdate(id, { read: true }, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, contact: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

// ADMIN: Delete message
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Contact.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete" });
  }
};