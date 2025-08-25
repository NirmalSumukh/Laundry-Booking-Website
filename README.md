# Laundry Booking Website

Welcome to the **Laundry Booking Website**, a full-stack web application built with Node.js, Express.js, MongoDB, EJS templating, and integrated with Razorpay and Google OAuth 2.0 for payment and authentication respectively.

---

## Features

- **User Authentication** with Google OAuth 2.0
- **Role-based Access Control**: Separate customer and admin functionalities
- **Customer Dashboard**: Place laundry orders, track order status, and pay securely
- **Admin Dashboard**: Manage all orders, update statuses, and view analytics
- **Razorpay Integration**: Secure and smooth payment gateway
- **Email Notifications**: Automatic customer notifications on order updates
- **Responsive Design**: Mobile friendly with professional styling
- **MongoDB Database** with Mongoose for persistent storage

---

## Screenshots

![Landing Page](screenshots/landing-page.png)  
![Login Page](screenshots/login-page.png)  
![Customer Dashboard](screenshots/customer-dashboard.png)  
![Admin Dashboard](screenshots/admin-dashboard.png)

---

## Installation Setup

### Prerequisites

- Node.js (v16+)
- npm (comes with Node.js)
- MongoDB (local or atlas)
- Razorpay account
- Google Cloud Project with OAuth credentials

### Environment Variables

Create a `.env` in your project root with:

```

PORT=4000
MONGO_URI=mongodb://127.0.0.1:27017/laundry_booking

SESSION_SECRET=your_session_secret_here
JWT_SECRET=your_jwt_secret_here

GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback

RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here

EMAIL_SERVICE=gmail
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password
EMAIL_FROM=Your Laundry [your_email@example.com](mailto:your_email@example.com)

```

### Install and Run

```

git clone https://github.com/yourusername/laundry-booking.git
cd laundry-booking
npm install

# Start local MongoDB server or connect to Atlas

npm run dev

```

Open [http://localhost:4000](http://localhost:4000) in your browser.

---

## Project Structure

```

laundry-booking/
├── backend/
│   ├── controllers/        \# Auth, orders, payment business logic
│   ├── models/             \# Mongoose User and Order schemas
│   ├── routes/             \# API routes for auth, orders, payments
│   ├── middleware/         \# Auth and error handling middleware
│   ├── utils/              \# Email \& Razorpay helpers
│   ├── config/             \# DB \& OAuth config
│   ├── views/              \# EJS templates for frontend pages
│   ├── app.js              \# Express app setup and middleware
│   ├── server.js           \# Server bootstrap
│   └── .env                \# Environment config (excluded from repo)
├── frontend/               \# Static files if used in some setups (here EJS used)
├── package.json            \# Dependencies and scripts
└── README.md               \# This documentation

```

---

## User Roles and Admin Setup

| Role     | Description                                           |
| -------- | --------------------------------------------------- |
| Customer | Place orders, pay, track orders                      |
| Admin    | View & manage all orders, update status, analytics  |

### Setting up Admin User

- Use Google login with an email you specify in the backend config as admin (e.g., `your_email@example.com`).
- Alternatively, run admin user script or manually set `role: 'admin'` in MongoDB for your user.

---

## Technologies Used

| Layer        | Technologies                                 |
| ------------ | -------------------------------------------|
| Backend      | Node.js, Express.js, Passport.js            |
| Database     | MongoDB, Mongoose                           |
| Frontend     | EJS templating, Vanilla JavaScript          |
| Authentication | Google OAuth 2.0, JWT                       |
| Payments     | Razorpay payment gateway                    |
| Notifications| Nodemailer for Emails                       |
| Styling      | Responsive CSS                              |

---


```

---

## Contribution

Contributions and feature requests are welcome. Please open an issue or pull request.

---

*Built with AI-assisted prompt engineering. Enjoy developing and learning!*  
🚀  
```

