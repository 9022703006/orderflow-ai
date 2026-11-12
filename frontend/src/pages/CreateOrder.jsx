
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { API_BASE_URL } from "../config";

function CreateOrder() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [aiText, setAiText] = useState("");
  const [messages, setMessages] = useState([]);

  const total = quantity * price;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !customerEmail || !product || !quantity || !price) {
      alert("Please fill in all order details");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please log in to create orders");
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          customerName: name,
          customerEmail: customerEmail,
          product: product,
          quantity: Number(quantity),
          price: Number(price)
        })
      });

      if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userEmail");
        alert("Session expired. Please log in again.");
        navigate("/login");
        return;
      }

      const data = await response.json();

      if (response.ok) {
        const n8nResponse = await fetch(
          "http://localhost:5678/webhook-test/orderflow-order",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
          }
        );

        if (!n8nResponse.ok) {
          alert("Order created, but Google Sheets sync failed");
          return;
        }

        alert("Order created and added to Google Sheets");

        setName("");
        setCustomerEmail("");
        setProduct("");
        setQuantity("");
        setPrice("");
      } else {
        alert("Order creation failed");
      }
    } catch (error) {
      console.error(error);
      alert("Unable to connect to backend");
    }
  };

  const handleAiProcess = async () => {
    if (!aiText.trim()) {
      return;
    }

    const question = aiText;

    setMessages((oldMessages) => [
      ...oldMessages,
      {
        sender: "user",
        text: question
      }
    ]);

    setAiText("");

    try {
      const response = await fetch(
        "http://localhost:5678/webhook-test/orderflow-ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            message: question,
            sessionId: "demo-user"
          })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessages((oldMessages) => [
          ...oldMessages,
          {
            sender: "ai",
            text: data.message
          }
        ]);
      } else {
        setMessages((oldMessages) => [
          ...oldMessages,
          {
            sender: "ai",
            text: "AI request failed."
          }
        ]);
      }
    } catch (error) {
      console.error(error);

      setMessages((oldMessages) => [
        ...oldMessages,
        {
          sender: "ai",
          text: "Unable to connect to n8n."
        }
      ]);
    }
  };

  // Convert simple Markdown from Gemini into readable HTML
  const formatAiMessage = (text) => {
    if (!text) {
      return "";
    }

    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/^### (.*)$/gm, "<h4>$1</h4>")
      .replace(/^- (.*)$/gm, "• $1")
      .replace(/\n/g, "<br />");
  };

  return (
    <div className="page-container">

      <Navbar />

      <main className="content-container form-page-container">

        <div className="card order-card">

          <h2>Create Order</h2>

          <p className="section-subtitle">
            Enter order details manually
          </p>

          <form onSubmit={handleSubmit} className="order-form">

            <div className="form-group">

              <label>Customer Name</label>

              <input
                type="text"
                placeholder="e.g. Prathmesh Patil"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

            </div>

            <div className="form-group">

              <label>Customer Email</label>

              <input
                type="email"
                placeholder="e.g. prathmeshp426@gmail.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />

            </div>

            <div className="form-group">

              <label>Product</label>

              <input
                type="text"
                placeholder="e.g. Tractor"
                value={product}
                onChange={(e) => setProduct(e.target.value)}
              />

            </div>

            <div className="form-row">

              <div className="form-group col-half">

                <label>Quantity</label>

                <input
                  type="number"
                  placeholder="e.g. 2"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />

              </div>

              <div className="form-group col-half">

                <label>Price (₹)</label>

                <input
                  type="number"
                  placeholder="e.g. 450000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />

              </div>

            </div>

            <div className="total-display-box">

              <span className="total-label">
                Total Amount:
              </span>

              <span className="total-value">
                ₹{total ? total.toLocaleString("en-IN") : 0}
              </span>

            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
            >
              Create Order
            </button>

          </form>

          <hr className="divider" />

          <div className="ai-section">

            <div className="ai-header">

              <span className="ai-badge">
                AI Assistant
              </span>

              <h3>
                Ask OrderFlow AI
              </h3>

            </div>

            <p className="ai-description">
              Ask questions about orders and sales.
            </p>

            <div className="ai-chat">

              {messages.map((message, index) => (

                <div
                  key={index}
                  className={
                    message.sender === "user"
                      ? "chat-message user-message"
                      : "chat-message ai-message"
                  }
                >

                  <div className="chat-label">

                    {message.sender === "user"
                      ? "You"
                      : "🤖 OrderFlow AI"}

                  </div>

                  <div className="chat-box">

                    {message.sender === "ai" ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: formatAiMessage(message.text)
                        }}
                      />
                    ) : (
                      message.text
                    )}

                  </div>

                </div>

              ))}

            </div>

            <textarea
              className="ai-textarea"
              rows="2"
              placeholder="Ask OrderFlow AI..."
              value={aiText}
              onChange={(e) => setAiText(e.target.value)}
            />

            <button
              type="button"
              onClick={handleAiProcess}
              className="btn btn-ai btn-block"
            >
              Send
            </button>

          </div>

        </div>

      </main>

    </div>
  );
}

export default CreateOrder;