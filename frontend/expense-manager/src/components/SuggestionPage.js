import React, { useEffect, useState } from "react";
import "./SuggestionPage.css";

const backendUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";

const SuggestionPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${backendUrl}/username`);
        const data = await response.json();
        if (data.status === "success") {
          setUsers(data.data);
        } else {
          console.error("Failed to fetch users");
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value);
  };

  const fetchSuggestion = async () => {
    if (!selectedUser) {
      alert("Please select a user first!");
      return;
    }

    setLoading(true);
    try {
      const suggestionResponse = await fetch(`${backendUrl}/suggestion?user_id=${selectedUser}`)

      const suggestionData = await suggestionResponse.json();
      console.log(suggestionData)
      if (suggestionData.status === "success") {
        setSuggestion(suggestionData.suggestion);
      } else {
        setSuggestion("Failed to generate suggestion.");
      }
    } catch (error) {
      console.error("Error fetching suggestion:", error);
      setSuggestion("Error fetching suggestion.");
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
      <h1 className="pageTitle">Suggestion</h1>
      <div className="form">
        <div className="formGroup">
        <label className="label">Select a user:</label>
        <select value={selectedUser} onChange={handleUserChange}>
          <option value="">-- Select User --</option>
          {users.map((user) => (
            <option key={user.user_id} value={user.user_id}>
              {user.user_name}
            </option>
          ))}
        </select>
        </div>
        
        <button className="button" onClick={fetchSuggestion} disabled={loading}>
          {loading ? "Loading..." : "Get Suggestion"}
        </button>
      </div>
      {loading ? <p>Loading suggestions...</p> : <pre>{suggestion && <pre>{JSON.stringify(suggestion, null, 2)}</pre>}</pre>}
    </div>
  );
};

export default SuggestionPage;
