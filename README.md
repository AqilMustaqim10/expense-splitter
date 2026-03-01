# SplitEase 💸

A modern, full-stack expense splitting web application that helps groups of people track shared expenses and automatically calculate who owes whom.

![SplitEase](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## ✨ Features

- 🔐 **JWT Authentication** — Secure register & login
- 👥 **Group Management** — Create groups, add/remove members
- 💸 **Expense Tracking** — Equal & custom splits
- 📊 **Balance Calculation** — Real-time net balances per member
- 🧮 **Smart Settlements** — Minimum transactions algorithm
- ✅ **Payment Confirmation** — Mark as paid, confirm received, cancel
- 📜 **Settlement History** — Full audit trail with status badges
- 🎨 **Polished UI** — Framer Motion animations, Lucide icons

---

## 🛠️ Tech Stack

### Frontend

| Tech             | Purpose       |
| ---------------- | ------------- |
| React + Vite     | UI framework  |
| Tailwind CSS v3  | Styling       |
| Framer Motion    | Animations    |
| Lucide React     | Icons         |
| React Router DOM | Navigation    |
| Axios            | HTTP requests |
| React Hot Toast  | Notifications |

### Backend

| Tech               | Purpose               |
| ------------------ | --------------------- |
| Node.js + Express  | REST API              |
| MongoDB + Mongoose | Database              |
| JWT                | Authentication        |
| bcryptjs           | Password hashing      |
| dotenv             | Environment config    |
| CORS               | Cross-origin requests |

---

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account
- Git

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/expense-splitter.git
cd expense-splitter
```

### 2. Setup the Backend

```bash
cd server
npm install
```

Create `server/.env`:

```env
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
```

Start the server:

```bash
npm run dev
```

### 3. Setup the Frontend

```bash
cd client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

### 4. Open the app

Visit `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
expense-splitter/
├── client/                     # React frontend
│   └── src/
│       ├── api/                # Axios API functions
│       ├── components/         # Reusable components
│       ├── context/            # Auth context
│       ├── hooks/              # Custom hooks
│       └── pages/              # Page components
│
└── server/                     # Express backend
    ├── controllers/            # Route logic
    ├── middleware/             # Auth middleware
    ├── models/                 # Mongoose models
    └── routes/                 # API routes
```

---

## 🔌 API Endpoints

### Auth

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login user        |
| GET    | `/api/auth/me`       | Get current user  |

### Groups

| Method | Endpoint                            | Description         |
| ------ | ----------------------------------- | ------------------- |
| GET    | `/api/groups`                       | Get all user groups |
| POST   | `/api/groups`                       | Create a group      |
| GET    | `/api/groups/:id`                   | Get single group    |
| DELETE | `/api/groups/:id`                   | Delete a group      |
| POST   | `/api/groups/:id/members`           | Add member by email |
| DELETE | `/api/groups/:id/members/:memberId` | Remove member       |

### Expenses

| Method | Endpoint                                   | Description      |
| ------ | ------------------------------------------ | ---------------- |
| GET    | `/api/groups/:groupId/expenses`            | Get all expenses |
| POST   | `/api/groups/:groupId/expenses`            | Add expense      |
| DELETE | `/api/groups/:groupId/expenses/:expenseId` | Delete expense   |
| GET    | `/api/groups/:groupId/expenses/balances`   | Get balances     |

### Settlements

| Method | Endpoint                                       | Description               |
| ------ | ---------------------------------------------- | ------------------------- |
| GET    | `/api/groups/:groupId/settlements`             | Get settlements + history |
| POST   | `/api/groups/:groupId/settlements`             | Mark as paid              |
| PATCH  | `/api/groups/:groupId/settlements/:id/confirm` | Confirm received          |
| PATCH  | `/api/groups/:groupId/settlements/:id/cancel`  | Cancel settlement         |

---

## 🧮 Settlement Algorithm

SplitEase uses a **greedy algorithm** to minimize the number of transactions needed to settle all debts:

1. Calculate each member's net balance (`paid - owed`)
2. Separate into creditors (net > 0) and debtors (net < 0)
3. Match largest debtor with largest creditor
4. Settle the minimum of the two amounts
5. Repeat until all balances are zero

This ensures the **fewest possible transactions** to clear all debts.

---

## 🔮 Planned Features

- [ ] Group invite via shareable link
- [ ] Edit expense after creation
- [ ] User profile page
- [ ] Dark / Light mode toggle
- [ ] Expense search & filter
- [ ] Email notifications

---

## 👨‍💻 Author

Built by Built by AqilMustaqim

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
