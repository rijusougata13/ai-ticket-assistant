# AI Task Assistant - Frontend

A React-based frontend for the AI Task Assistant application that provides automatic task assignment and analysis.

## Features

- **User Authentication**: Login and signup with skills management
- **Ticket Management**: Create, view, and track tickets
- **AI Analysis**: View AI-generated analysis and skill matching for tickets
- **Admin Panel**: Manage users and their roles (for admin users)
- **Responsive Design**: Built with Tailwind CSS and DaisyUI

## Prerequisites

- Node.js 20.x
- Backend API server running on port 3000

## Setup

1. **Switch to Node.js 20** (if using nvm):

   ```bash
   nvm use 20
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Environment Variables**:
   The `.env` file should contain:
   ```
   VITE_SERVER_URL=http://localhost:3000
   ```

## Running the Application

1. **Development mode**:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

2. **Production build**:
   ```bash
   npm run build
   npm run preview
   ```

## Usage

1. **Sign Up**: Create an account with your email, password, and skills
2. **Login**: Access your account
3. **Create Tickets**: Submit new tickets with title and description
4. **View Tickets**: See all your tickets with AI analysis results
5. **Admin Features**: If you're an admin, access user management

## API Integration

The frontend connects to the backend at:

- `POST /api/user/signup` - User registration
- `POST /api/user/login` - User authentication
- `GET /api/tickets` - Fetch user tickets
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets/:id` - Get ticket details

## Technologies Used

- **React 19** - Frontend framework
- **Vite** - Build tool
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling framework
- **DaisyUI** - UI component library
- **React Markdown** - Markdown rendering

## Project Structure

```
src/
├── components/
│   ├── check-auth.jsx     # Authentication wrapper
│   └── navbar.jsx         # Navigation component
├── pages/
│   ├── admin.jsx          # Admin user management
│   ├── login.jsx          # Login page
│   ├── signup.jsx         # Registration page
│   ├── ticket.jsx         # Individual ticket view
│   └── tickets.jsx        # Ticket listing and creation
├── App.jsx                # Main app component with routing
└── main.jsx              # Application entry point
```
