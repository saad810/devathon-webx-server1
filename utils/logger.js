const fs = require("fs");
const path = require("path");

const logger = async (message, filename) => {
  try {
    const filePath = path.join(__dirname, filename);
    
    // Ensure the file exists by opening it in append mode ('a').
    await fs.promises.open(filePath, 'a');

    // Format the message with a timestamp (optional)
    const formattedMessage = `${new Date().toISOString()}: ${message}\n`;

    // Append the message to the file
    await fs.promises.appendFile(filePath, formattedMessage);
    
    console.log(`Message logged to ${filename}`);
  } catch (error) {
    console.error("Error writing to file:", error);
  }
};

module.exports = logger;
