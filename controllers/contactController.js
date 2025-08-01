import ContactMessage from "../models/ContactMessage.js";

export const createContactMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required." });
    }

    await ContactMessage.create({ name, email, subject, message });

    res.status(201).json({ message: "Message sent successfully ✅" });
  } catch (error) {
    res.status(500).json({ message: "Server error ❌", error: error.message });
  }
};
