# 🏀 UPA Summer Championship - Live Draft Board

A real-time draft board application for the UPA Summer Championship basketball event, featuring a $15,000 prize pool. This interactive tool allows administrators to manage the draft process in real-time while providing an engaging experience for participants and viewers.

## ✨ Features

- **Real-time Updates**: Live synchronization of draft picks across all connected clients
- **Interactive Controls**: Start, pause, and resume the draft as needed
- **Player Selection**: Submit picks with optional trade notes
- **Team Tracking**: Automatic generation of team-specific draft pages
- **Countdown Timer**: Visual countdown for each team's selection window
- **Trade Management**: Toggle pick status to indicate trades
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Supabase account with database setup

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/live-draft-board.git
   cd live-draft-board
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up your Supabase project:
   - Create a new project on [Supabase](https://supabase.com/)
   - Set up a `draft_picks` table with the required schema
   - Configure Row Level Security (RLS) as needed

4. Update the Supabase configuration in `index.html` and `generate-team-pages.js` with your project credentials

## 🛠 Usage

### Starting the Draft

1. Open `index.html` in a web browser
2. Click "Start Draft" to begin the draft process
3. The system will automatically advance through teams based on the draft order

### Submitting Picks

1. Enter the drafted player's name in the input field
2. Add any trade notes if applicable
3. Click "Submit Pick" to record the selection

### Managing the Draft

- **Pause**: Temporarily stop the draft timer
- **Resume**: Continue the draft from where it was paused
- **Toggle Traded**: Mark a pick as traded

### Generating Team Pages

Run the team page generator to create individual team draft pages:

```bash
node generate-team-pages.js
```

## 🏗 Project Structure

```text
live-draft-board/
├── index.html          # Main application interface
├── generate-team-pages.js  # Script to generate team-specific pages
├── logos/              # Team logos and assets
├── templates/          # HTML templates for generated pages
└── teams/              # Output directory for generated team pages
```

## 🔧 Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL, Realtime API)
- **Styling**: Custom CSS with responsive design
- **Build Tools**: npm (Node Package Manager)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- UPA for organizing the Summer Championship
- All participating teams and players
- The open-source community for valuable tools and libraries

## Supabase Schema
Create table `draft_picks`:
```
id SERIAL PRIMARY KEY,
pick INTEGER,
round INTEGER,
team TEXT,
team_slug TEXT,
player TEXT,
notes TEXT,
traded BOOLEAN DEFAULT FALSE
```
Enable RLS for auth users on updates.

## Sample Players.json
```json
["Player1", "Player2", "Player3"]
```

## Environment Variables
Create `.env` with:
```
SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-key
```

## Screenshots
- Main Board: [Screenshot description or link]
- Team Page: [Screenshot description or link]