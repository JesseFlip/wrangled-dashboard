# Triple Birthday Bash Dashboard 🎂🎂🎂

A premium, local-first web dashboard to coordinate planning, RSVPs, and day-of logistics for a triple birthday celebration.

## ✨ Features

- **Trio Design System**: A warm, celebratory aesthetic using Warm Coral, Deep Teal, and Mustard Gold.
- **Local-First Persistence**: All data is saved to `localStorage` for privacy and offline resilience.
- **7 specialized planning hubs**:
  - **Overview**: Real-time countdown and quick event stats.
  - **Guest List**: RSVP tracking with invite message generator.
  - **Schedule**: Visual timeline of the day's events.
  - **Decorations**: Organized board for setup ideas and print tracking.
  - **Shopping List**: Budget-aware list grouped by category.
  - **Prep Tasks**: Kanban-style checklist for hosts.
  - **Honoree Details**: Personalized cards for the birthday trio.
- **Keyboard Shortcuts**: Navigate like a pro with `g` then `[o|g|s|d|l|t|h]`.
- **Print Optimization**: Clean, ink-saving stylesheets for Shopping and Schedule lists.
- **Data Mobility**: Export and Import JSON for backups or device sharing.

## 🚀 Tech Stack

- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🛠️ Getting Started

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
```

The production bundle will be in the `dist/` directory.

## ☁️ Deployment

This project is configured for **Netlify**. 

1. Push your code to a GitHub repository.
2. Link the repository to Netlify.
3. Use the following build settings:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
4. The included `netlify.toml` handles SPA routing automatically.

## 🔮 Future Enhancements

- **Supabase Integration**: Move from `localStorage` to a real-time database by updating the `src/context/DataContext.tsx` hook.
- **Photo Uploads**: Integrate with Cloudinary or S3 for decoration and guest photos.
- **iCal Export**: Generate calendar files for the event schedule.
- **Email/SMS Automation**: Connect to Twilio or SendGrid for automated reminders.

---

Built with ❤️ for Jesse, Dorys, and the Birthday Trio.
