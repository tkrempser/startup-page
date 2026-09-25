const rows_per_rect = get_css_variable("--rows-per-rect");
const cols_per_rect = get_css_variable("--cols-per-rect");
let calendar = document.getElementById("calendar");
const urlParams = new URLSearchParams(location.search);
const date_birth = urlParams.get("dob") || "1984-01-01";
const life_expectancy = urlParams.get("age") || "80";
const highlighted_week = "2026-12-28";
const progress_start = "2026-07-01";
const progress_decimals = 6;
const using_defaults = !urlParams.get("dob") && !urlParams.get("age");
let numDecades = Math.floor(life_expectancy / 10);

populate_calendar(numDecades);

fill_calendar(date_birth);

if (using_defaults) {
    outline_week(weeks_since_birth(date_birth, parse_date(highlighted_week)));
}

const target_date = parse_date(highlighted_week);

render_target_date(target_date);
start_countdown(target_date);

function fill_calendar(bday) {
    let num_weeks = weeks_since_birth(bday, new Date());

    for (let week = 0; week < num_weeks; week++) {
        paint_week(week);
    }
}

function parse_date(date) {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function weeks_since_birth(bday, date) {
    let day_diff = (date - parse_date(bday)) / (1000 * 3600 * 24);
    let years = Math.floor(day_diff / 365);
    let remaining_weeks = Math.floor((day_diff % 365) / 7);

    return years * 26 * 2 + remaining_weeks;
}

function paint_week(num) {
    const week = document.getElementById(`week-${num}`);
    if (week != null) {
        week.style.borderColor = get_css_variable("--color-dark-gray");
        week.style.backgroundColor = get_css_variable("--color-dark-gray");
    }
}

function outline_week(num) {
    const week = document.getElementById(`week-${num}`);
    if (week != null) {
        week.style.borderColor = get_css_variable("--color-green");
        week.style.backgroundColor = get_css_variable("--color-green");
    }
}

function set_ids(numDecades) {
    const weeks_per_year = cols_per_rect * 2;
    const weeks_per_decade = weeks_per_year * 10;

    for (let decade = 0; decade < numDecades; decade++) {
        const decade_weeks = decade * weeks_per_decade;
        for (let rect = 0; rect < 2; rect++) {
            const r = document.getElementById(`rect-${decade}-${rect}`);
            const rect_weeks = rect * cols_per_rect;
            r.childNodes.forEach((cell, index) => {
                let rect_rows = Math.floor(index / 26);
                let offset = index % cols_per_rect;
                let id =
                    decade_weeks + rect_rows * weeks_per_year + rect_weeks + offset;
                cell.id = `week-${id}`;
            });
        }
    }
}

function populate_calendar(numDecades) {
    for (let i = 0; i < numDecades; i++) {
        spawn_decade(i);
    }

    set_ids(numDecades);
}

function spawn_decade(decade) {
    for (let i = 0; i < 2; i++) {
        const rect = spawn_rectangle(rows_per_rect, cols_per_rect);
        rect.id = `rect-${decade}-${i}`;
        calendar.appendChild(rect);
    }
}

function spawn_rectangle(rows, cols) {
    const rect = document.createElement("div");
    rect.classList.add("rect-container");

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            rect.appendChild(spawn_cell());
        }
    }
    return rect;
}

function spawn_cell() {
    const div = document.createElement("div");
    div.classList.add("week-cell");
    return div;
}

function time_until(target) {
    const seconds = Math.max(0, Math.floor((target - new Date()) / 1000));

    return {
        days: Math.floor(seconds / 86400),
        hours: Math.floor(seconds / 3600) % 24,
        minutes: Math.floor(seconds / 60) % 60,
        seconds: seconds % 60,
    };
}

function start_countdown(target) {
    const tick = () => {
        render_countdown(target);
        render_progress(target);
    };

    tick();
    setInterval(tick, 1000);
}

function render_countdown(target) {
    const left = time_until(target);

    document.getElementById("countdown-days").textContent = left.days;
    document.getElementById("countdown-hours").textContent = left.hours;
    document.getElementById("countdown-minutes").textContent = left.minutes;
    document.getElementById("countdown-seconds").textContent = left.seconds;
}

function render_target_date(target) {
    document.getElementById("target-date").textContent =
        target.toLocaleDateString("pt-BR", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
}

function render_progress(target) {
    const start = parse_date(progress_start);
    const ratio = (new Date() - start) / (target - start);
    const percent = Math.min(100, Math.max(0, ratio * 100));
    const shown = percent.toLocaleString("pt-BR", {
        minimumFractionDigits: progress_decimals,
        maximumFractionDigits: progress_decimals,
    });

    document.getElementById("progress-fill").style.width = `${percent}%`;
    document.getElementById(
        "progress-label"
    ).textContent = `Progresso · ${shown}%`;
}

function get_css_variable(name) {
    return getComputedStyle(document.documentElement).getPropertyValue(
        name
    );
}