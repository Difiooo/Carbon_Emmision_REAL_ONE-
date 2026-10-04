# 🌱 Carbon Tracker

A simple full-stack web application for tracking daily carbon emissions from **transport, food, and energy activities**.

Carbon Tracker calculates the estimated CO₂e impact of each activity and displays your total emissions, category-wise emissions, recent activities, and weekly emissions.

---

## ✨ Features

- 🚗 Track transport emissions
- 🍴 Track food-related emissions
- ⚡ Track electricity consumption
- 🧮 Automatically calculate estimated CO₂e
- 📊 View total carbon emissions
- 📈 View weekly carbon emissions
- 📝 View recent activities
- 🗑️ Delete recorded activities
- 💾 Store activities using SQLite
- 🔌 React frontend connected to an Express API

---

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript
- CSS
- Chart.js

### Backend

- Node.js
- Express
- SQLite
- better-sqlite3
- CORS

---

## 📁 Project Structure

```text
CARBON-EMMISION/
│
├── ecotrack/
│   ├── public/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Dashboard.css
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── index.js
│   ├── package.json
│   └── data/
│       └── ecotrack.db
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/carbon-tracker.git
cd carbon-tracker
```

Replace `YOUR_USERNAME` with the GitHub username that owns the repository.

---

## 2. Start the Backend

Open a terminal in the project root:

```bash
cd server
npm install
npm start
```

The backend will run at:

```text
http://localhost:5000
```

You can test the API using:

```text
http://localhost:5000/api/health
```

Expected response:

```json
{
  "status": "ok",
  "message": "EcoTrack backend is running"
}
```

---

## 3. Start the Frontend

Open a **second terminal**:

```bash
cd ecotrack
npm install
npm run dev
```

Vite will provide a local URL, normally:

```text
http://localhost:5173
```

Open that URL in your browser.

---

## 🧮 Emission Factors

The application currently uses the following simplified emission factors:

| Activity | CO₂e Factor |
|---|---:|
| Car | 0.18 kg/unit |
| Bus | 0.08 kg/unit |
| Motorcycle | 0.10 kg/unit |
| Vegetarian food | 1.50 kg/unit |
| Meat | 3.00 kg/unit |
| Electricity | 0.70 kg/kWh |

For example:

```text
10 kWh × 0.70
= 7.00 kg CO₂e
```

> These factors are simplified estimates intended for demonstration and educational purposes. Actual carbon emissions can vary depending on location, energy source, vehicle efficiency, food production methods, and other factors.

---

## 🔌 API Endpoints

### Health Check

```http
GET /api/health
```

Checks whether the backend is running.

### Get Activities

```http
GET /api/activities
```

Returns all recorded activities.

### Add Activity

```http
POST /api/activities
```

Example request:

```json
{
  "category": "energy",
  "type": "electricity",
  "quantity": 10
}
```

### Delete Activity

```http
DELETE /api/activities/:id
```

Deletes an activity using its ID.

---

## 💾 Database

Carbon Tracker uses **SQLite** to store activity records.

The database is automatically created when the backend starts:

```text
server/data/ecotrack.db
```

You don't need to manually create the database.

---

## 🔒 Environment Variables

The current application does not require API keys or environment variables to run locally.

If environment variables are added in the future, keep them in a `.env` file and **never commit secrets to GitHub**.

---

## 🧪 Testing the Application

After starting both servers:

1. Open the frontend.
2. Select an activity category.
3. Select an activity.
4. Enter a quantity.
5. Click **Add Activity**.
6. Check the updated total CO₂e.
7. Check Recent Activities.
8. Refresh the page to verify stored data.
9. Test the History page.
10. Test deleting an activity if available.

---

## 🎯 Example

If you record:

```text
Electricity: 10 kWh
```

The application calculates:

```text
10 × 0.70 = 7.00 kg CO₂e
```

The dashboard then displays:

```text
Total CO₂e: 7.00 kg
Energy: 7.00 kg
```

---

## 📌 Current Scope

Carbon Tracker is designed as a lightweight educational/project application.

The current version focuses on:

- Activity tracking
- Carbon estimation
- Local SQLite storage
- Dashboard visualization
- Basic REST API integration

It is not intended to provide an official or scientifically precise carbon footprint assessment.

---

## 🤝 Contributing

Contributions are welcome.

To contribute:

1. Fork the repository.
2. Create a new branch.

```bash
git checkout -b feature/your-feature
```

3. Make your changes.
4. Test the application.
5. Commit your changes.

```bash
git add .
git commit -m "Add your feature"
```

6. Push your branch.

```bash
git push origin feature/your-feature
```

7. Open a Pull Request.

---

## 📄 License

This project is available for educational and personal use.

---

## 👨‍💻 Author

**Sidharth Kumar**

Computer Science Engineering Student

Built as a full-stack project to explore React, Express, SQLite, REST APIs, and data visualization.