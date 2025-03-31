import React, { useEffect, useState } from "react";
import "./Expenses.css";

function Expenses() {
  const [expenseData, setExpensesData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const API_BASE_URL = "http://127.0.0.1:8000";

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/fetch/all`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setExpensesData(data.data);
        setFilteredData(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  useEffect(() => {
    const filterExpenses = () => {
      let results = expenseData.filter(expense => {
        const matchesSearch = expense.MerchantName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory ? expense.Category === selectedCategory : true;
        
        // Date filtering logic
        const expenseDate = new Date(expense.Date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        const matchesStart = start ? expenseDate >= start : true;
        const matchesEnd = end ? expenseDate <= end : true;

        return matchesSearch && matchesCategory && matchesStart && matchesEnd;
      });
      
      setFilteredData(results);
    };

    filterExpenses();
  }, [searchTerm, selectedCategory, startDate, endDate, expenseData]);

  const categories = [...new Set(expenseData.map(expense => expense.Category))];

  if (loading) {
    return <div className="loading">Loading expenses...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="expenses-container">
      <header className="page-header">
        <h1>Recent Expenses</h1>
        <p className="page-description">View and manage your recent expenses</p>
      </header>

      <div className="filters-container">
        <div className="filter-group">
          <div className="date-filters">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
              placeholder="Start Date"
            />
            <span className="date-separator">–</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
              placeholder="End Date"
            />
          </div>
{/* 
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="category-select"
          >
            <option value="">All Categories</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select> */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search merchant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        </div>
      </div>
    
      <div className="expenses-table-wrapper">
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Merchant</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Category</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr className="no-results">
                <td colSpan="4">No matching records found</td>
              </tr>
            ) : (
              filteredData.map((expense) => (
                <tr key={expense.ExpenseId}>
                  <td>{expense.MerchantName}</td>
                  <td>{new Date(expense.Date).toLocaleDateString()}</td>
                  <td>${expense.TotalAmount.toFixed(2)}</td>
                  <td>
                    <span className="category-tag">
                      {expense.Category}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Expenses;