const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const getResponse = async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    // Get the generative model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Construct the prompt (you can include chat history if needed)
    const prompt = message; // or you can customize it further

    // Generate content based on the prompt
    const result = await model.generateContent(prompt);
    
    // Log the response for debugging
    console.log(result.response.text());

    // Send the response back to the client
    res.status(200).json({ message: result.response.text() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getResponse,
};
