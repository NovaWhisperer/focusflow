# FocusFlow

FocusFlow is a lightweight, mobile-first productivity dashboard that combines live weather, a task board, a day planner, daily inspiration, and a Pomodoro-style focus timer in one interface. It uses vanilla HTML, SCSS, and JavaScript, with no framework or runtime dependency.

Live demo: https://focusflow-psi-tawny.vercel.app

## Quick Facts

- Full-screen cards open into dedicated workspace panels
- Weather-aware header imagery and theme color
- Tasks, planner entries, and quote content are handled without a backend
- Designed and tested for mobile, tablet, and desktop layouts

## Features

| Feature | What it does |
|---|---|
| Live Weather | Pulls current conditions from Open-Meteo, including temperature, humidity, precipitation, and wind |
| Live Clock | Updates the date and time every second in the header |
| Task Board | Lets you add tasks, include details, mark items important, and remove completed items |
| Day Planner | Provides 18 hourly slots from 6:00 to 23:00 with automatic local persistence |
| Daily Inspiration | Fetches a random motivational quote on load, with a fallback message if the request fails |
| Focus Timer | Runs a 25-minute work session and a 5-minute break cycle with start, pause, and reset controls |
| Theme Support | Includes a dark mode toggle and weather/time-aware background switching |
| Responsive Layout | Uses a mobile-first design with distinct portrait assets for smaller screens |

## Preview

### Desktop
![Desktop View](./assets/preview-desktop.png)

### Mobile
![Mobile View](./assets/preview-mobile.png)

## How It Works

The home screen presents four cards: Task Board, Day Planner, Inspire Me, and Focus Timer. Selecting a card opens a full-screen workspace, while the navigation bar is hidden to keep attention on the active task.

The header combines live date/time with current weather data and updates the visual theme based on time of day and weather conditions. LocalStorage is used to persist tasks, planner entries, and weather cache data across visits.

## Getting Started

No build step is required to run the app. The compiled CSS is already included, so you can open the project immediately after cloning.

### 1. Clone the repository

```bash
git clone https://github.com/NovaWhisperer/focusflow.git
cd focusflow
```

### 2. Open the app

Open `index.html` directly in a browser, or use a local server for a smoother experience.

```bash
npx serve .
```

If you prefer VS Code, the Live Server extension also works well.

### 3. Edit styles

If you change the SCSS source, recompile it into the CSS file used by the app.

```bash
sass style.scss style.css --watch
```

## Configuration

To change the default location shown in the weather widget, update the `CONFIG` object near the top of `script.js`.

```js
const CONFIG = {
    location: {
        name: "Hamirpur (HP)",
        latitude: 31.68,
        longitude: 76.52,
        timezone: "Asia/Kolkata",
    }
};
```

Helpful references:

- Coordinates: https://www.latlong.net
- Timezone lookup: https://timezonefinder.michelfe.eu

The weather cache automatically refreshes when the coordinates change.

## Tech Stack

- HTML5 for semantic structure
- SCSS for source styling and design tokens
- Vanilla JavaScript for interactions and data persistence
- Open-Meteo API for live weather data
- dummyjson API for random quotes
- Remixicon for icons
- Poppins from Google Fonts for typography

## Responsive Breakpoints

| Breakpoint | Target |
|---|---|
| Base | Mobile screens below 480px |
| 480px and up | Small phones and landscape layouts |
| 768px and up | Tablets |
| 1200px and up | Desktop |

## Notes

- Weather data requires an internet connection.
- If weather data is unavailable, the dashboard falls back to a time-based background.
- The app is optimized for modern browsers.

## License

MIT. Free to use, modify, and distribute.

Built with patience and focus.
