# UNC-Clash

<div align="center">
  <img src="https://i.imgur.com/9KTdQES.png" alt="UNC-Clash Logo" width="150">
  <h3>Gamify anonymous LinkedIn profile comparisons for UNC students</h3>
  
  [![Website](https://img.shields.io/badge/Website-uncclash.com-blue)](https://uncclash.com)
  [![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
  [![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
</div>

## 🚀 About UNC-Clash

UNC-Clash is a web application that gamifies comparing anonymous LinkedIn profiles from UNC students. Users can vote on which profile they find more impressive, with an Elo rating system tracking profile rankings over time. The platform creates a fun, interactive way to see how different career paths, experiences, and profiles stack up against each other.

## ✨ Features

- **Profile Battles**: Vote on pairs of anonymized LinkedIn profiles
- **Elo Rating System**: Profiles gain or lose points based on battle outcomes
- **Leaderboard**: See the highest-rated profiles
- **Battle History**: Track recent comparison results
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Works on mobile and desktop
- **Opt-In/Out**: Students can choose to remove their profile from the platform

## 🛠️ Tech Stack

### Frontend
- React.js
- React Router
- Context API for state management
- CSS with responsive design
- Hosted on Vercel

### Backend
- Node.js
- Express.js
- MongoDB (with Mongoose ORM)
- JWT Authentication
- RESTful API
- Hosted on Heroku

## 📋 Getting Started

### Prerequisites
- Node.js (v14.x or higher)
- npm or yarn
- MongoDB (local or Atlas)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/reddy-lalith/UNC-Clash.git
   cd UNC-Clash
   ```

2. Install server dependencies
   ```bash
   cd server
   npm install
   ```

3. Install client dependencies
   ```bash
   cd ../client
   npm install
   ```

4. Create a `.env` file in the server directory with the following variables:
   ```
   PORT=4000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   ADMIN_USERNAME=your_admin_username
   ADMIN_PASSWORD=your_admin_password
   FRONTEND_URL=http://localhost:3000
   ```

5. Start the development servers:
   
   Server:
   ```bash
   cd server
   npm run dev
   ```
   
   Client:
   ```bash
   cd client
   npm start
   ```

6. Open your browser and navigate to `http://localhost:3000`

## 🔍 How It Works

1. Users are presented with two anonymous LinkedIn profiles
2. They vote on which profile they find more impressive
3. Profiles gain or lose Elo points based on battle outcomes
4. The leaderboard shows the highest-rated profiles
5. Profiles can be opted-out at any time

## 📱 Screenshots

<div align="center">
  <img src="https://imgur.com/placeholder1.png" alt="Main Battle Screen" width="45%">
  <img src="https://imgur.com/placeholder2.png" alt="Leaderboard" width="45%">
</div>

## 📊 Roadmap

- [ ] Filter battles by industry or major
- [ ] Enhanced analytics for profile performance
- [ ] User accounts and saved preferences
- [ ] API for external applications
- [ ] Community features and discussions

## 🤝 Contributing

Contributions are welcome! If you have ideas for improvements or find any issues, please open an issue or submit a pull request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📬 Contact

For any questions or inquiries, please contact:
- Creator: Lalith Reddy
- LinkedIn: [linkedin.com/in/lalithreddy](https://www.linkedin.com/in/lalithreddy/)
- Email: lalith@unc.edu

---

<div align="center">
  <sub>Made with ❤️ at UNC Chapel Hill</sub>
</div>
