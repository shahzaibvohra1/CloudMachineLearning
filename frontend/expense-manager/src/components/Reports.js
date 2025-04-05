import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the required components for Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const API_BASE_URL = "http://127.0.0.1:8000";

function Reports() {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!month || !year) {
        setChartData([]);
        return;
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/fetch/get-total-of-category?year=${year}`
        );

        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const data = await response.json();
          if (response.ok && data.data) {
            setChartData(data.data);
          } else {
            console.error("API error:", data);
            setChartData([]);
          }
        } else {
          const text = await response.text();
          console.error("Expected JSON but received:", text);
          throw new Error("Non-JSON response received from API.");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setChartData([]);
      }
    };

    fetchData();
  }, [year]);

  // Prepare chart data using the keys from your backend ("Category" and "TotalAmount")
  const dataForChart = {
    labels: chartData.map((item) => item.Category),
    datasets: [
      {
        label: "Total Amount",
        data: chartData.map((item) => item.TotalAmount),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
      },
    ],
  };

  return (
    <div className="reports-container">
      <h2>Expense Reports</h2>
      <p>View your monthly expense reports.</p>

      <div className="select-month-year">
        <label style={{ margin: "0 8px" }}>Select Year</label>
        <select value={year} onChange={(e) => setYear(e.target.value)}>
          <option value="">--Select--</option>
          <option value="2022">2022</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>
      </div>

      <div style={{ width: "600px", marginTop: "20px" }}>
        {chartData.length > 0 ? (
          <Bar
            data={dataForChart}
            options={{
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: "Total Amount",
                  },
                },
                x: {
                  title: {
                    display: true,
                    text: "Category",
                  },
                },
              },
            }}
          />
        ) : (
          <p>No data found for the selected month and year.</p>
        )}
      </div>
    </div>
  );
}

export default Reports;