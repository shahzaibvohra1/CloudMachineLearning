import React, { useState } from "react";
import "./HomePage.css";
const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const HomePage = () => {
  const [textInput, setTextInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTextChange = (e) => {
    setTextInput(e.target.value);
  };

  // upload image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  // submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Please upload an image first!");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("username", textInput);

    try {
      // Send image to FastAPI OCR endpoint
      const ocrResponse = await fetch(`${backendUrl}/ocr`, {
        method: "POST",
        body: formData,
      });

      const ocrData = await ocrResponse.json();
      console.log("OCR Response Data:", ocrData);

      if (ocrData.status === "success" && ocrData.data) {
        setOcrResult(ocrData.data);
        console.log("Data being sent to /save:", ocrData.data);

        // "/save"
        const saveResponse = await fetch(`${backendUrl}/save`, {
          method: "POST",
          body: JSON.stringify(ocrData.data),
        });

        const saveData = await saveResponse.json();
        console.log("Save response:", saveData);
        alert("Data saved successfully!");
      } else {
        console.error("OCR analysis failed or returned empty data:", ocrData);
        alert("OCR analysis failed or returned empty data.");
      }
    } catch (error) {
      console.error("Error during OCR request:", error);
      alert("Submit Failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading... Please wait.</p>
        </div>
      )}
      <h1 className="pageTitle">Upload Image</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="formGroup">
          <label htmlFor="textInput" className="label">
            Your name:
          </label>
          <input
            type="text"
            id="textInput"
            value={textInput}
            onChange={handleTextChange}
            className="input"
            required
            disabled={loading}
          />
        </div>

        <div className="formGroup">
          <label htmlFor="imageInput" className="label">
            Upload Receipt:
          </label>
          <input
            type="file"
            id="imageInput"
            accept="image/*"
            onChange={handleImageChange}
            className="input"
            required
            disabled={loading}
          />
        </div>

        <button type="submit" className="button" disabled={loading}>
          Submit
        </button>
      </form>

      {loading && <p>Loading... Please wait.</p>}

      {ocrResult && (
        <div className="ocrResult">
          <h3>OCR Result:</h3>
          <div>
            <strong>Merchant Name:</strong> {ocrResult.merchant_name}
          </div>
          <div>
            <strong>Date:</strong> {ocrResult.date}
          </div>
          <div>
            <strong>Total Amount:</strong> ${ocrResult.total_amount.toFixed(2)}
          </div>
          <div>
            <strong>Category:</strong> {ocrResult.category}
          </div>

          <h4>File Details:</h4>
          <div>
            <strong>File Key:</strong> {ocrResult.file_key.file_key}
          </div>
          <div>
            <strong>File URL:</strong> <a href={ocrResult.file_key.file_url} target="_blank" rel="noopener noreferrer">View File</a>
          </div>

          <h4>Save Status:</h4>
          <div>
            <strong>Status:</strong> {ocrResult.dynamodb_response.status}
          </div>
          <div>
            <strong>Message:</strong> {ocrResult.dynamodb_response.message}
          </div>
          <div>
            <strong>Expense ID:</strong> {ocrResult.dynamodb_response.ExpenseID}
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
