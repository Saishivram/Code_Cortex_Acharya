import React, { useState } from "react";
import axios from "axios";

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  // Handle user input
  const handleChange = (e) => {
    setInput(e.target.value);
  };

  // Submit message to AI bot
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/chatbot/query",
        { query: input },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setResponse(res.data.answer);
      setInput("");
    } catch (error) {
      console.error(error);
      setResponse("Error connecting to chatbot.");
    }
  };

  return (
    <div className="chatbot-container">
      <h2>AI Medical Assistant</h2>
      <div className="chat-window">
        <p><strong>Bot:</strong> {response || "How can I assist you today?"}</p>
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Ask about patient history, conditions, etc."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chatbot;
