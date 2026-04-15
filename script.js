/**
 * FocusFlow — script.js
 *
 * Sections:
 *  1. USER CONFIG  ← change your location here
 *  2. localStorage helper
 *  3. Background theme (time + weather aware)
 *  4. Section navigation (open / close full-screen pages)
 *  5. Task Board
 *  6. Day Planner
 *  7. Daily Inspiration (quote fetch)
 *  8. Focus Timer (Pomodoro — no SVG ring)
 *  9. Weather API + live clock
 * 10. Dark mode toggle
 */


// ════════════════════════════════════════════════════════
//  1. USER CONFIG
//  Change these values to match your location.
//  Find your coordinates: https://www.latlong.net
//  Find your timezone:    https://timezonefinder.michelfe.eu
// ════════════════════════════════════════════════════════
const CONFIG = {
    location: {
        name:      "Hamirpur (HP)",   // displayed in the UI header
        latitude:  31.68,             // decimal degrees, N is positive
        longitude: 76.52,             // decimal degrees, E is positive
        timezone:  "Asia/Kolkata",    // IANA timezone string
    }
};


// ════════════════════════════════════════════════════════
//  2. localStorage HELPER
// ════════════════════════════════════════════════════════
const store = {
    get(key) {
        try {
            const val = localStorage.getItem(key);
            return val ? JSON.parse(val) : null;
        } catch { return null; }
    },
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch {
            console.warn(`localStorage unavailable — "${key}" not saved.`);
        }
    }
};


// ════════════════════════════════════════════════════════
//  3. BACKGROUND THEME  (time + weather aware)
// ════════════════════════════════════════════════════════
function setTheme(weatherCode = null) {
    const hour = new Date().getHours();

    let period;
    if (hour < 6 || hour >= 20) {
        period = "night";
    } else if (hour >= 17) {
        period = "evening";
    } else if (weatherCode !== null && weatherCode >= 61 && weatherCode <= 99) {
        period = "evening";
    } else {
        period = "morning";
    }

    const images = {
        morning: "./assets/Morning.png",
        evening: "./assets/Evening.png",
        night:   "./assets/Night.png"
    };

    const header = document.querySelector(".allElems header");
    if (header) header.style.backgroundImage = `url("${images[period]}")`;

    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
        const colors = { morning: "#4E1F00", evening: "#2C1508", night: "#0E0E16" };
        metaTheme.setAttribute("content", colors[period]);
    }

    setTimeout(() => document.querySelector("#main").classList.add("loaded"), 80);
}

setTheme();


// ════════════════════════════════════════════════════════
//  4. NAVIGATION — open / close full-screen sections
// ════════════════════════════════════════════════════════
(function openFeatures() {
    const cards    = document.querySelectorAll(".elem");
    const sections = document.querySelectorAll(".fullElem");
    const backBtns = document.querySelectorAll(".back");
    const nav      = document.querySelector("nav");

    cards.forEach(card => {
        card.addEventListener("click", () => {
            sections[card.id].style.display = "flex";
            nav.style.display = "none";
        });
    });

    backBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            sections[btn.id].style.display = "none";
            nav.style.display = "block";
        });
    });
})();


// ════════════════════════════════════════════════════════
//  5. TASK BOARD
// ════════════════════════════════════════════════════════
let currentTask = store.get("currentTask") || [];

const taskForm         = document.getElementById("task-form");
const taskInput        = document.getElementById("task-input");
const taskDetailsInput = document.getElementById("textarea");
const taskCheckbox     = document.getElementById("check");
const taskCountBadge   = document.getElementById("task-count");

function updateTaskCount() {
    if (!taskCountBadge) return;
    const n = currentTask.length;
    taskCountBadge.textContent = `${n} task${n !== 1 ? "s" : ""}`;
}

function renderTask() {
    const listEl = document.querySelector(".task-list-inner");
    if (!listEl) return;

    listEl.innerHTML = currentTask.map(t =>
        `<div class="task" data-id="${t.id}">
            <details>
                <summary>
                    <h5>
                        ${t.task}
                        <span class="${t.imp}">${t.imp ? "Important" : ""}</span>
                    </h5>
                </summary>
                <p class="task-details">${t.details || "No details added."}</p>
            </details>
            <button class="done-btn" data-id="${t.id}">✓ Done</button>
        </div>`
    ).join("");

    store.set("currentTask", currentTask);
    updateTaskCount();

    listEl.querySelectorAll(".done-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            currentTask = currentTask.filter(t => t.id !== btn.dataset.id);
            renderTask();
        });
    });
}

renderTask();

taskForm.addEventListener("submit", e => {
    e.preventDefault();
    const val = taskInput.value.trim();
    if (!val) return;

    currentTask.push({
        id:      `task-${Date.now()}`,
        task:    val,
        details: taskDetailsInput.value.trim(),
        imp:     taskCheckbox.checked
    });

    renderTask();
    taskForm.reset();
});


// ════════════════════════════════════════════════════════
//  6. DAY PLANNER
// ════════════════════════════════════════════════════════
(function dailyPlanner() {
    const container = document.querySelector(".day-planner");
    if (!container) return;

    let planData = store.get("dayPlanData") || {};
    const hours  = Array.from({ length: 18 }, (_, i) => `${6 + i}:00 — ${7 + i}:00`);

    container.innerHTML = hours.map((label, i) =>
        `<div class="day-planner-time">
            <p>${label}</p>
            <input id="slot-${i}" type="text" placeholder="..." value="${planData[i] || ""}" autocomplete="off">
        </div>`
    ).join("");

    container.addEventListener("input", e => {
        if (e.target.tagName !== "INPUT") return;
        const index = e.target.id.replace("slot-", "");
        planData[index] = e.target.value;
        store.set("dayPlanData", planData);
    });
})();


// ════════════════════════════════════════════════════════
//  7. DAILY INSPIRATION
// ════════════════════════════════════════════════════════
(function motivationalQuote() {
    const quoteEl  = document.querySelector(".motivation-2 p");
    const authorEl = document.querySelector(".motivation-3 span");

    async function fetchQuote() {
        try {
            const res  = await fetch("https://dummyjson.com/quotes/random");
            const data = await res.json();
            if (quoteEl)  quoteEl.textContent  = `"${data.quote}"`;
            if (authorEl) authorEl.textContent = `— ${data.author}`;
        } catch {
            if (quoteEl)  quoteEl.textContent  = '"Every day is a fresh start."';
            if (authorEl) authorEl.textContent = "— Unknown";
        }
    }

    fetchQuote();
})();


// ════════════════════════════════════════════════════════
//  8. FOCUS TIMER (POMODORO)
//  SVG ring removed — plain time display only.
//  Work/break cycle: 25 min work → 5 min break → repeat.
// ════════════════════════════════════════════════════════
(function pomodoroTimer() {
    const displayEl = document.querySelector(".pomo-time");
    const startBtn  = document.querySelector(".start-timer");
    const pauseBtn  = document.querySelector(".pause-timer");
    const resetBtn  = document.querySelector(".reset-timer");
    const sessionEl = document.querySelector(".session");

    let isWork        = true;
    let timerInterval = null;
    let totalSeconds  = 25 * 60;
    let maxSeconds    = 25 * 60;

    function updateDisplay() {
        const mm = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
        const ss = String(totalSeconds % 60).padStart(2, "0");
        if (displayEl) displayEl.textContent = `${mm}:${ss}`;
    }

    function setMode(work) {
        isWork       = work;
        maxSeconds   = work ? 25 * 60 : 5 * 60;
        totalSeconds = maxSeconds;

        if (sessionEl) {
            sessionEl.textContent      = work ? "Work Session" : "Break";
            sessionEl.style.background = work ? "var(--green)" : "var(--blue)";
            sessionEl.style.boxShadow  = work
                ? "0 0.3rem 1.2rem rgba(65,149,65,0.35)"
                : "0 0.3rem 1.2rem rgba(55,82,141,0.45)";
        }

        updateDisplay();
    }

    function runInterval(onEnd) {
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            if (totalSeconds > 0) {
                totalSeconds--;
                updateDisplay();
            } else {
                clearInterval(timerInterval);
                onEnd();
            }
        }, 1000);
    }

    if (startBtn) startBtn.addEventListener("click", () => runInterval(() => setMode(!isWork)));
    if (pauseBtn) pauseBtn.addEventListener("click", () => clearInterval(timerInterval));
    if (resetBtn) resetBtn.addEventListener("click", () => {
        clearInterval(timerInterval);
        totalSeconds = maxSeconds;
        updateDisplay();
    });

    updateDisplay();
})();


// ════════════════════════════════════════════════════════
//  9. WEATHER API + LIVE CLOCK
//  Reads coordinates and timezone from CONFIG above.
//  Cache is busted automatically if the location changes.
// ════════════════════════════════════════════════════════
(function weatherFunctionality() {
    const timeEl     = document.querySelector(".header-1 h1");
    const dateEl     = document.querySelector(".header-1 h2");
    const tempEl     = document.querySelector(".header-2 h2");
    const descEl     = document.querySelector(".header-2 h4");
    const precipEl   = document.querySelector(".weather-precip");
    const humidityEl = document.querySelector(".weather-humidity");
    const windEl     = document.querySelector(".weather-wind");
    const locationEl = document.querySelector(".header-1 h4");

    const CACHE_KEY     = "weatherCache";
    const CACHE_MINUTES = 10;

    // Inject location name from CONFIG into the UI pill
    if (locationEl) {
        locationEl.innerHTML = `<i class="ri-map-pin-line"></i> ${CONFIG.location.name}`;
    }

    function describeWeather(code) {
        if (code === 0)  return "Clear Sky";
        if (code <= 3)   return "Partly Cloudy";
        if (code <= 48)  return "Foggy";
        if (code <= 67)  return "Rainy";
        if (code <= 77)  return "Snowy";
        if (code <= 99)  return "Thunderstorm";
        return "Unknown";
    }

    function applyWeather(w) {
        if (tempEl)     tempEl.textContent   = `${w.temperature_2m} °C`;
        if (descEl)     descEl.textContent   = describeWeather(w.weather_code);
        if (precipEl)   precipEl.innerHTML   = `<i class="ri-drop-line"></i> Precipitation: ${w.precipitation} mm`;
        if (humidityEl) humidityEl.innerHTML = `<i class="ri-water-percent-line"></i> Humidity: ${w.relative_humidity_2m}%`;
        if (windEl)     windEl.innerHTML     = `<i class="ri-windy-line"></i> Wind: ${w.wind_speed_10m} km/h`;
        setTheme(w.weather_code);
    }

    async function fetchWeather() {
        const cached = store.get(CACHE_KEY);

        // Bust cache if coordinates have changed since last fetch
        const locationChanged = cached &&
            (cached.lat !== CONFIG.location.latitude ||
             cached.lon !== CONFIG.location.longitude);

        const isFresh = cached &&
            !locationChanged &&
            (Date.now() - cached.timestamp) < CACHE_MINUTES * 60_000;

        if (isFresh) { applyWeather(cached.data); return; }

        try {
            // URL built entirely from CONFIG — just edit the object at the top
            const url = "https://api.open-meteo.com/v1/forecast"
                + `?latitude=${CONFIG.location.latitude}`
                + `&longitude=${CONFIG.location.longitude}`
                + "&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m"
                + `&timezone=${encodeURIComponent(CONFIG.location.timezone)}`;

            const res     = await fetch(url);
            const json    = await res.json();
            const weather = json.current;

            // Store lat/lon fingerprint alongside the data so cache busting works
            store.set(CACHE_KEY, {
                data:      weather,
                timestamp: Date.now(),
                lat:       CONFIG.location.latitude,
                lon:       CONFIG.location.longitude
            });

            applyWeather(weather);
        } catch {
            console.warn("Weather fetch failed — using time-based background.");
        }
    }

    fetchWeather();

    // ── Live clock ──────────────────────────────────────
    const DAYS   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    const MONTHS = ["January","February","March","April","May","June",
                    "July","August","September","October","November","December"];

    function tick() {
        const now  = new Date();
        const day  = DAYS[now.getDay()];
        const date = now.getDate();
        const mon  = MONTHS[now.getMonth()];
        const yr   = now.getFullYear();

        let h = now.getHours();
        const ampm = h >= 12 ? "PM" : "AM";
        h = h % 12 || 12;

        const hh = String(h).padStart(2, "0");
        const mm = String(now.getMinutes()).padStart(2, "0");
        const ss = String(now.getSeconds()).padStart(2, "0");

        if (dateEl) dateEl.textContent = `${date} ${mon} ${yr}`;
        if (timeEl) timeEl.textContent = `${day}, ${hh}:${mm}:${ss} ${ampm}`;
    }

    tick();
    setInterval(tick, 1000);
})();


// ════════════════════════════════════════════════════════
// 10. DARK MODE TOGGLE
// ════════════════════════════════════════════════════════
document.querySelector(".theme").addEventListener("click", function () {
    document.documentElement.classList.toggle("dark");
    const icon   = this.querySelector("i");
    const isDark = document.documentElement.classList.contains("dark");
    icon.className = isDark ? "ri-moon-line" : "ri-sun-line";
});