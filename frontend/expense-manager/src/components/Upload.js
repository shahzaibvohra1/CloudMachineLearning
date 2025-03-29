import React, { useState } from "react";

// Replace with your actual API endpoint
const API_BASE_URL = "http://127.0.0.1:8000";

function Upload() {
  const [filename, setFilename] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState("");

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

        const response = await fetch(`${API_BASE_URL}/upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename,
            filebytes: base64File
          }),
        });

        const data = await response.json();
        setResult(JSON.stringify(data, null, 2));
      } catch (error) {
        setResult(JSON.stringify({ error: error.message }, null, 2));
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

        <button type="submit" className="upload-button">
          Upload Receipt
        </button>
      </form>

      {/* Display server response */}
      {result && (
        <div className="results-container">
          <h4>Results</h4>
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}

export default Upload;
