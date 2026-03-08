// ============================================================
// reminders.js — Event reminder & countdown system
// ============================================================

const REMINDER_KEY = "dipp_reminders";

export function getReminders() {
    try { return JSON.parse(localStorage.getItem(REMINDER_KEY)) || []; }
    catch { return []; }
}

export function setReminder(eventId) {
    const reminders = getReminders();
    if (!reminders.includes(eventId)) {
        reminders.push(eventId);
        localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
        updateReminderBadge();
        return true;
    }
    return false; // already set
}

export function removeReminder(eventId) {
    const reminders = getReminders().filter(id => id !== eventId);
    localStorage.setItem(REMINDER_KEY, JSON.stringify(reminders));
    updateReminderBadge();
}

export function hasReminder(eventId) {
    return getReminders().includes(eventId);
}

export function updateReminderBadge() {
    const badge = document.getElementById("reminderBadge");
    if (!badge) return;
    const count = getReminders().length;
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";
}

// Returns { days, hours, mins, secs, isUrgent, isPast }
export function getCountdown(dateStr) {
    const now = Date.now();
    const target = new Date(dateStr).getTime();
    const diff = target - now;

    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, isUrgent: false, isPast: true };

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    const isUrgent = diff < 48 * 3600000; // within 48 hours

    return { days, hours, mins, secs, isUrgent, isPast: false };
}

export function renderCountdown(dateStr) {
    const cd = getCountdown(dateStr);
    if (cd.isPast) return `<span class="text-xs text-text2/60">Completed</span>`;
    if (cd.isUrgent) {
        return `<span class="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 animate-pulse">
      🔥 ${cd.hours}h ${cd.mins}m left — Happening Soon!
    </span>`;
    }
    return `<span class="text-[11px] text-text2 font-medium">
    ⏳ ${cd.days}d ${cd.hours}h ${cd.mins}m
  </span>`;
}

// Attach live countdown tickers to all elements with data-countdown-date
export function initCountdownTickers() {
    function tick() {
        document.querySelectorAll("[data-countdown-date]").forEach(el => {
            const dateStr = el.dataset.countdownDate;
            el.innerHTML = renderCountdown(dateStr);
        });
    }
    tick();
    setInterval(tick, 1000);
}
