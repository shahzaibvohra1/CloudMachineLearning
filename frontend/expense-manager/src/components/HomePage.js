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
      // setOcrResult(ocrData.data);
      // setEditedData(ocrData.data);

      if (ocrData.status === "success" && ocrData.data) {
        setOcrResult(ocrData.data);
        // setEditedData(ocrData.data);
        console.log("Data being sent to /save:", ocrData.data);

        // "/save"
        const saveResponse = await fetch(`${backendUrl}/save`, {
          method: "POST",
          // headers: { "Content-Type": "application/json" },
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

  // const handleInputChange = (e, field, index = null) => {
  //   const newData = { ...editedData };

  //   if (index !== null) {
  //     newData.items[index][field] = e.target.value;
  //   } else {
  //     newData[field] = e.target.value;
  //   }

  //   setEditedData(newData);
  // };

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
          <pre>{JSON.stringify(ocrResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default HomePage;
