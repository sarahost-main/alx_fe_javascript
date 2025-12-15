// Local data
let quotes = JSON.parse(localStorage.getItem("quotes")) || [];
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter = document.getElementById("categoryFilter");
const syncStatus = document.getElementById("syncStatus");

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";

// Save locally
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Populate categories
function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  const saved = localStorage.getItem("selectedCategory");
  if (saved) categoryFilter.value = saved;
}

// Display quote
function showRandomQuote() {
  const selected = categoryFilter.value;
  const pool = selected === "all"
    ? quotes
    : quotes.filter(q => q.category === selected);

  if (pool.length === 0) {
    quoteDisplay.innerHTML = "No quotes available.";
    return;
  }

  const quote = pool[Math.floor(Math.random() * pool.length)];
  quoteDisplay.innerHTML = `"${quote.text}" — <strong>${quote.category}</strong>`;
  sessionStorage.setItem("lastQuote", JSON.stringify(quote));
}

// Filter
function filterQuotes() {
  localStorage.setItem("selectedCategory", categoryFilter.value);
  showRandomQuote();
}

// Add quote
function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return;

  quotes.push({ text, category });
  saveQuotes();
  populateCategories();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
}

// Create form
function createAddQuoteForm() {
  const div = document.createElement("div");
  div.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote">
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category">
    <button id="addQuoteBtn">Add Quote</button>
  `;
  document.body.appendChild(div);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

// Export
function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = e => {
    const imported = JSON.parse(e.target.result);
    quotes.push(...imported);
    saveQuotes();
    populateCategories();
  };
  reader.readAsText(event.target.files[0]);
}

// ---------------- SERVER SYNC ----------------

// Fetch server quotes (server wins)
async function syncWithServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    // Simulated server quotes
    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server"
    }));

    quotes = serverQuotes; // server precedence
    saveQuotes();
    populateCategories();

    syncStatus.innerHTML = "Quotes synced with server (server data applied).";
  } catch {
    syncStatus.innerHTML = "Server sync failed.";
  }
}

// Periodic sync
setInterval(syncWithServer, 30000);

// Events
document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("exportBtn").addEventListener("click", exportToJson);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);

// Init
populateCategories();
createAddQuoteForm();
syncWithServer();
