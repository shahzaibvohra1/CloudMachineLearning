const API_BASE_URL = "http://127.0.0.1:8000"; // Replace with your actual API URL

// Helper function to display results
function displayResult(data) {
    const resultElement = document.getElementById("result");
    resultElement.textContent = JSON.stringify(data, null, 2);
}

// Upload Receipt
document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const filename = document.getElementById("filename").value;
    const file = document.getElementById("filebytes").files[0];

    if (!filename || !file) {
        alert("Filename and file are required.");
        return;
    }

    // Convert file to Base64
    const reader = new FileReader();
    reader.onload = async () => {
        const base64File = reader.result.split(",")[1];

        try {
            const response = await fetch(`${API_BASE_URL}/upload`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename, filebytes: base64File }),
            });

            const data = await response.json();
            displayResult(data);
        } catch (error) {
            displayResult({ error: error.message });
        }
    };
    reader.readAsDataURL(file);
});

// Fetch by Expense ID
async function fetchByExpenseId() {
    const expenseId = document.getElementById("expenseId").value;

    if (!expenseId) {
        alert("Expense ID is required.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/fetch/by-expense-id?expense_id=${expenseId}`);
        const data = await response.json();
        displayResult(data);
    } catch (error) {
        displayResult({ error: error.message });
    }
}

// Fetch by Merchant Name
async function fetchByMerchantName() {
    const merchantName = document.getElementById("merchantName").value;

    if (!merchantName) {
        alert("Merchant Name is required.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/fetch/by-merchant-name?merchant_name=${merchantName}`);
        const data = await response.json();
        displayResult(data);
    } catch (error) {
        displayResult({ error: error.message });
    }
}

// Fetch by Date
async function fetchByDate() {
    const date = document.getElementById("date").value;

    if (!date) {
        alert("Date is required.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/fetch/by-date?date=${date}`);
        const data = await response.json();
        displayResult(data);
    } catch (error) {
        displayResult({ error: error.message });
    }
}

// Fetch All Data
async function fetchAll() {
    try {
        const response = await fetch(`${API_BASE_URL}/fetch/all`);
        const data = await response.json();
        displayResult(data);
        console.log(response)
    } catch (error) {
        displayResult({ error: error.message });
    }
}

// Fetch by Category
async function fetchByYearMonth() {
    const year = document.getElementById("year").value;
    // const month = document.getElementById("month").value;
    // if (!year || !month) {
    //     alert("Year and Month are required.");
    //     return;
    // }
    if (!year) {
        alert("Year is required.");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/fetch/get-total-of-category?year=${year}`);
        const data = await response.json();
        displayResult(data);
    }catch (error) {
        displayResult({ error: error.message });
    }
}