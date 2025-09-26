# User Management Backend API

A robust RESTful API built with Node.js, Express, and MongoDB to power the User Management Dashboard with more than 10 lakh users.

## 🚀 Features

- Complete CRUD operations with validation and error handling  
- Paginated user retrieval for large datasets  
- Bulk user creation with duplicate email checks  
- Data seeding (up to 1,00,000 sample users)  
- MongoDB integration with Mongoose ORM  
- Input validation using Joi  
- CORS support for frontend integration  
- Environment configuration with `.env`  
- Comprehensive error responses  

## 🛠 Tech Stack

- **Runtime:** Node.js  
- **Framework:** Express.js  
- **Database:** MongoDB with Mongoose  
- **Validation:** Joi  
- **Environment Management:** dotenv  
- **Dependencies:** express, mongoose, dotenv, cors, joi  

## 📋 Prerequisites

- Node.js v14+  
- MongoDB instance (local or Atlas)  
- npm or yarn  
- MongoDB URI  

## ⚙️ Installation & Setup

1. Clone the repository  
   https://github.com/Shivek-cmd/Node-Assignment_server.git
   cd server

2. Install dependencies
   npm install

3. Configure environment
   Create a .env file in the root directory with:
   PORT=8000
   MONGO_URI=mongodb+srv://185524_db_user:wRf4x2YOJsX5jQAP@cluster0.ey1pw8g.mongodb.net/


4. Run the backend
   npm run dev