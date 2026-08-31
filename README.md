# 📦 Inventory Management System

A full-stack **Inventory Management System** built with **Flask, MySQL, and React/Vite** for managing products, inventory, purchases, orders, suppliers, supplier issues, reports, and staff.

## 🚀 Features

* 📊 Dashboard & reports
* 📦 Product & category management
* 📈 Inventory & stock tracking
* 🛒 Purchase & order management
* 🏢 Supplier management
* ⚠️ Supplier issue tracking
* 📝 Audit logs
* 🔐 JWT authentication & role-based access
* 👁️ Read-only user access
* 🌍 Global timezone & localization
* ⚡ Password hashing, query indexing & caching

## 🛠️ Tech Stack

* 🐍 **Backend:** Python, Flask, PyMySQL
* ⚛️ **Frontend:** React, Vite, Tailwind CSS
* 🗄️ **Database:** MySQL
* 🔐 **Security:** JWT, bcrypt
* 📊 **Charts:** Recharts
* 🌐 **API:** REST API

## 👥 User Roles

| Role          | Access                         |
| ------------- | ------------------------------ |
| 👑 Admin      | Full access                    |
| 🧑‍💼 Manager | Application + staff management |
| 👨‍💻 Staff   | Inventory operations           |
| 👁️ Read Only | View-only access               |

## 🌍 Timezone & Localization

* 🌎 Admin can set the application's global timezone.
* 🕐 Current date/time changes according to the selected timezone.
* 🔄 Timezone changes are reflected across all modules.
* 🗺️ Uses standard IANA timezones.
* 🌐 Supports a localization-ready structure for multiple languages.

## ⚡ Performance

* 🔐 Optimized bcrypt password hashing
* 🗂️ Database indexing for frequently queried fields
* ⚡ Caching for frequently requested data
* 🔄 Cache invalidation after relevant data changes

## 🔗 Live Demo

🌐 **Deployed Application:**
https://inventory-management-system-theta-flame.vercel.app/login

### 👁️ Read-Only Demo

A **Read Only** credential has been created for exploring the deployed application without modifying data.

🔑 **Demo credentials:** Available separately.


## 📁 Project Structure

```text
IMS/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.py
│   └── schema.sql
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── services/
│
└── README.md
```

## ⚙️ Setup

### 🗄️ Database

```bash
mysql -u root -p < backend/schema.sql
```

### 🐍 Backend

```bash
cd backend
python -m venv .venv
pip install -r requirements.txt
python app.py
```

### ⚛️ Frontend

```bash
cd frontend
npm install
npm run dev
```

