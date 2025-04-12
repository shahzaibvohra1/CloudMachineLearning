import React, { useState } from "react";

// Replace with your actual API endpoint
const API_BASE_URL = "http://127.0.0.1:8000";

function Upload() {
  const [filename, setFilename] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!filename || !selectedFile) {
      alert("Filename and file are required.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        // Strip off "data:image/...;base64," part
        const base64File = reader.result.split(",")[1];

        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename,
            filebytes: base64File
          }),
        });

        const data = await response.json();
        console.log("---------------")
        console.log(data)
        setLoading(false);

        if (data.dynamodb_response.status === "success" && data) {
          setOcrResult(data);
        } else {
          alert("OCR analysis failed or returned empty data.");
        }
      } catch (error) {
        setLoading(false);
        setOcrResult({ error: error.message });
      }
    };

    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="content-container">
      <h2 className="upload-header">Upload Receipt</h2>
      <p className="upload-subtext">
        Upload a receipt image to automatically extract and categorize expense information.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="filename">Filename:</label>
          <input
            type="text"
            id="filename"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="filebytes">Choose File:</label>
          <input
            type="file"
            id="filebytes"
            accept="image/jpeg, image/png"
            onChange={handleFileChange}
            required
          />
        </div>

        <button type="submit" className="upload-button" disabled={loading}>
          {loading ? "Uploading..." : "Upload Receipt"}
        </button>
      </form>

      {/* Display server response */}
      {ocrResult && !ocrResult.error && (
        <div className="results-container">
          <h4>OCR Result:</h4>
          <div><strong>Merchant Name:</strong> {ocrResult.extracted_data.merchant_name}</div>
          <div><strong>Date:</strong> {ocrResult.extracted_data.date}</div>
          <div><strong>Total Amount:</strong> ${ocrResult.extracted_data.total_amount}</div>
          <div><strong>Category:</strong> {ocrResult.extracted_data.category}</div>

          <h4>File Details:</h4>
          <div><strong>File Key:</strong> {ocrResult.file_key.file_key}</div>
          <div>
            <strong>File URL:</strong>{" "}
            <a href={ocrResult.file_key.file_url} target="_blank" rel="noopener noreferrer">View File</a>
          </div>

          <h4>Save Status:</h4>
          <div><strong>Status:</strong> {ocrResult.dynamodb_response.status}</div>
          <div><strong>Message:</strong> {ocrResult.dynamodb_response.message}</div>
          <div><strong>Expense ID:</strong> {ocrResult.dynamodb_response.ExpenseID}</div>
        </div>
      )}

      {ocrResult?.error && (
        <div className="error-container">
          <h4>Error:</h4>
          <div>{ocrResult.error}</div>
        </div>
      )}
    </div>
  );
}

export default Upload;
