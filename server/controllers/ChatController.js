export const handleChat = async (req, res) => {
  const { message } = req.body;

  try {
    let reply;

    if (/how many services/i.test(message)) {
      reply = "We offer 6 services.";
    } else if (/how (do|can) I book/i.test(message)) {
      reply =
        "You can book from the 'Services' section by clicking the 'Book Now' button.";
    } else {
      reply = "I'm still learning! Could you rephrase that?";
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({ reply: "Server error. Please try again later." });
  }
};
