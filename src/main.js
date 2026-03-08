import './style.css';
import { applyRoleUI, logout, isAdmin, getCurrentUser, DEMO_ACCOUNTS } from './auth.js';
import { updateReminderBadge, setReminder, hasReminder, renderCountdown, initCountdownTickers } from './reminders.js';
import { initPageTransitions } from './transitions.js';


// ---- Event Data (with ISO dates for countdown + Google Form autofill) ----
export const eventData = {
    memorytrix: {
        img: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&h=500&fit=crop',
        title: 'MemoryTrix', date: 'March 15, 2026', isoDate: '2026-03-15T10:00:00',
        time: '10:00 AM – 1:00 PM', venue: 'Electronics Lab, Block A',
        duration: '3 Hours', category: 'Competition', audience: 'All Students',
        about: 'MemoryTrix is a high-intensity memory challenge that fuses electronics puzzles with lightning-fast recall. Participants navigate through rounds of increasingly complex circuit identification, component matching, and schematic memorisation tasks.\n\nWhether you\'re a beginner or a seasoned tinkerer, this event will push your cognitive limits while deepening your understanding of core electronics concepts. Prizes await the sharpest minds!',
        conducted: false,
        // Google Form autofill — replace with real form URL + real entry IDs
        formLink: 'https://docs.google.com/forms/d/e/FORM_MEMORYTRIX/viewform',
        formFields: { name: 'entry.111001', email: 'entry.111002', regNo: 'entry.111003', dept: 'entry.111004', year: 'entry.111005' }
    },
    robowars: {
        img: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&h=500&fit=crop',
        title: 'RoboWars Workshop', date: 'April 2, 2026', isoDate: '2026-04-02T10:00:00',
        time: '10:00 AM – 1:00 PM', venue: 'Electronics Lab, Block A',
        duration: '3 Hours', category: 'Workshop', audience: 'All Students',
        about: 'Build and program combat robots from scratch. Learn embedded systems, motor control, and sensor integration.\n\nAll materials and components will be provided.',
        conducted: false,
        formLink: 'https://docs.google.com/forms/d/e/FORM_ROBOWARS/viewform',
        formFields: { name: 'entry.222001', email: 'entry.222002', regNo: 'entry.222003', dept: 'entry.222004', year: 'entry.222005' }
    },
    iot: {
        img: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=1200&h=500&fit=crop',
        title: 'IoT Smart Lab', date: 'April 20, 2026', isoDate: '2026-04-20T14:00:00',
        time: '2:00 PM – 5:00 PM', venue: 'Computer Lab 3',
        duration: '3 Hours', category: 'Workshop', audience: 'All Students',
        about: 'Design connected devices using ESP32 and sensors. From concept to working prototype.\n\nAll ESP32 boards and sensors will be provided.',
        conducted: false,
        formLink: 'https://docs.google.com/forms/d/e/FORM_IOT/viewform',
        formFields: { name: 'entry.333001', email: 'entry.333002', regNo: 'entry.333003', dept: 'entry.333004', year: 'entry.333005' }
    },
    pcb: {
        img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&h=500&fit=crop',
        title: 'PCB Design Bootcamp', date: 'January 10, 2026', isoDate: '2026-01-10T10:00:00',
        time: '10:00 AM – 1:00 PM', venue: 'Electronics Lab, Block A',
        duration: '3 Hours', category: 'Workshop', audience: 'All Students',
        about: 'Learn professional PCB layout using KiCad. This bootcamp equipped 40+ students with industry-standard PCB design skills.',
        conducted: true
    },
    arduino: {
        img: 'https://images.unsplash.com/photo-1531746790095-e5325c943422?w=1200&h=500&fit=crop',
        title: 'Arduino Kickstart', date: 'December 5, 2025', isoDate: '2025-12-05T10:00:00',
        time: '10:00 AM – 1:00 PM', venue: 'Electronics Lab, Block A',
        duration: '3 Hours', category: 'Workshop', audience: 'All Students',
        about: 'An introductory workshop covering Arduino basics, sensor interfacing, and simple automation projects.',
        conducted: true
    }
};


// ---- Open Event Detail Modal ----
window.openEventDetail = function (key) {
    const e = eventData[key]; if (!e) return;
    document.getElementById('eventDetailImg').src = e.img;
    document.getElementById('eventDetailDate').textContent = e.date;
    document.getElementById('eventDetailDate').className =
        'inline-block text-[11px] font-bold px-3 py-1 rounded-xl mb-3.5 ' +
        (e.conducted ? 'bg-text2/10 text-text2' : 'bg-accent/20 text-accent-light');
    document.getElementById('eventDetailTitle').textContent = e.title;
    document.getElementById('eventDetailVenue').textContent = '📍 ' + e.venue;
    document.getElementById('eventDetailAbout').innerHTML = e.about.replace(/\n/g, '<br>');
    document.getElementById('edlDate').textContent = e.date;
    document.getElementById('edlTime').textContent = e.time;
    document.getElementById('edlVenue').textContent = e.venue;
    document.getElementById('edlDuration').textContent = e.duration;
    document.getElementById('edlCategory').textContent = e.category;
    document.getElementById('edlAudience').textContent = e.audience;

    // Countdown in modal
    const cdEl = document.getElementById('edlCountdown');
    if (cdEl && !e.conducted) cdEl.innerHTML = renderCountdown(e.isoDate);

    // Action buttons
    const actionDiv = document.getElementById('eventDetailAction');
    if (e.conducted) {
        actionDiv.innerHTML = '<p class="text-[13px] text-text2 italic text-center p-3 border border-border rounded-lg bg-accent/[0.03]">This event has already been conducted.</p>';
    } else {
        const alreadySet = hasReminder(key);
        const alreadyReg = localStorage.getItem('dipp_reg_' + key) === 'true';
        actionDiv.innerHTML = `
      <button onclick="window.registerForEvent('${key}')"
        class="w-full text-center text-sm font-semibold px-6 py-3 rounded-full mb-3 transition-all
          ${alreadyReg
                ? 'bg-green-600/20 text-green-400 border border-green-500/40 cursor-default'
                : 'bg-accent text-white shadow-[0_2px_16px_rgba(124,58,237,0.3)] hover:bg-accent-dark'}"
        ${alreadyReg ? 'disabled' : ''}>
        ${alreadyReg ? '✅ Already Registered' : '📋 Register Now'}
      </button>
      <button id="reminderBtn" onclick="window.toggleReminder('${key}')" class="w-full text-center text-sm font-semibold px-6 py-3 rounded-full transition-all border ${alreadySet ? 'border-amber-500/60 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20' : 'border-accent/40 text-accent-light bg-accent/10 hover:bg-accent/20'}">
        ${alreadySet ? '🔔 Reminder Set ✓' : '🔕 Set Reminder'}
      </button>
    `;
    }

    openModal('eventDetailModal');
};

window.toggleReminder = function (key) {
    const btn = document.getElementById('reminderBtn');
    if (hasReminder(key)) {
        // already set — remove
        const { removeReminder } = window.__reminders || {};
        import('./reminders.js').then(({ removeReminder }) => {
            removeReminder(key);
            if (btn) { btn.innerHTML = '🔕 Set Reminder'; btn.className = btn.className.replace(/border-amber.+$/, '') + 'border-accent/40 text-accent-light bg-accent/10'; }
        });
    } else {
        setReminder(key);
        if (btn) { btn.innerHTML = '🔔 Reminder Set ✓'; btn.className = 'w-full text-center text-sm font-semibold px-6 py-3 rounded-full transition-all border border-amber-500/60 text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'; }
        // Show toast
        showToast('🔔 Reminder set for ' + eventData[key]?.title);
    }
};

// ---- Toast Notification ----
function showToast(msg) {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#5b21b6,#7c3aed);color:white;padding:12px 24px;border-radius:999px;font-size:13px;font-weight:600;z-index:99999;pointer-events:none;transition:opacity 0.4s;box-shadow:0 4px 24px rgba(124,58,237,0.4)';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { toast.style.opacity = '0'; }, 3000);
}

window.showToast = showToast;

// ---- Modal Logic ----
function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('closing');
    modal.style.display = 'flex';
    void modal.offsetWidth;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('closing');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('closing');
        document.body.style.overflow = '';
    }, 300);
}

window.openModal = openModal;
window.closeModal = closeModal;

// ---- Typewriter ----
function initTypewriter() {
    const el = document.getElementById('typewriter-word');
    if (!el) return;
    const words = ['matter.', 'happen.', 'the future.', 'circuits.', 'tomorrow.', 'real.'];
    let wi = 0, ci = 0, deleting = false;
    const TYPE_SPEED = 90, DELETE_SPEED = 55, PAUSE_AFTER = 1800, PAUSE_BEFORE = 320;

    function tick() {
        const word = words[wi];
        if (!deleting) {
            el.textContent = word.slice(0, ++ci);
            if (ci === word.length) {
                deleting = true;
                setTimeout(tick, PAUSE_AFTER);
                return;
            }
        } else {
            el.textContent = word.slice(0, --ci);
            if (ci === 0) {
                deleting = false;
                wi = (wi + 1) % words.length;
                setTimeout(tick, PAUSE_BEFORE);
                return;
            }
        }
        setTimeout(tick, deleting ? DELETE_SPEED : TYPE_SPEED);
    }
    tick();
}

// ---- Auto-Promote Expired Upcoming Events → Conducted ----
function autoPromoteExpiredEvents() {
    const now = new Date();
    const upcomingGrid = document.getElementById('upcomingEventsGrid');
    const conductedGrid = document.getElementById('conductedEventsGrid');
    if (!upcomingGrid || !conductedGrid) return;

    // Check hardcoded eventData entries: if isoDate is past and not already marked conducted
    for (const [key, e] of Object.entries(eventData)) {
        if (!e.conducted && e.isoDate && new Date(e.isoDate) < now) {
            e.conducted = true; // update in-memory flag
        }
    }

    // Also scan any DOM cards in upcomingEventsGrid with a data-date attribute
    const upcomingCards = Array.from(upcomingGrid.querySelectorAll('.event-card-neon'));
    upcomingCards.forEach(card => {
        const dateStr = card.dataset.date;
        if (!dateStr) return;
        const cardDate = new Date(dateStr + 'T23:59:59');
        if (cardDate < now) {
            // Update badge from "Upcoming" to "✓ Completed"
            const badge = card.querySelector('span.inline-block');
            if (badge) {
                badge.textContent = '✓ Completed';
                badge.className = 'inline-block text-[11px] font-bold px-3 py-1 rounded-xl bg-text2/10 text-text2';
            }
            // Swap neon gradient to conducted style
            const gradient = card.querySelector('.event-neon-gradient');
            if (gradient) gradient.classList.add('conducted-gradient');
            // Fade slightly
            card.style.opacity = '0.82';
            // Change "Register" button to "View Highlights"
            const regBtn = card.querySelector('.bg-accent');
            if (regBtn && regBtn.tagName === 'SPAN') {
                regBtn.textContent = '👁 View Highlights';
                regBtn.className = 'inline-flex items-center text-xs font-semibold px-4 py-2 rounded-full bg-white/5 text-white border border-white/12';
            }
            // Remove countdown if present
            const countdown = card.querySelector('[data-countdown-date]');
            if (countdown) countdown.innerHTML = '';
            // Move card to conducted grid
            conductedGrid.appendChild(card);
        }
    });

    // Hide featured banner if its event is now expired
    const featuredCard = document.getElementById('featuredEventCard');
    if (featuredCard) {
        // updateFeaturedEvent() handles this, just refresh it too
        updateFeaturedEvent();
    }
}

// ---- Update Featured Event ----
const FEATURED_STORAGE_KEY = 'dipp_featured_event';

function updateFeaturedEvent() {
    const card = document.getElementById('featuredEventCard');
    if (!card) return;

    const now = new Date();
    const deletedEvents = getDeletedEvents();

    // Check localStorage for manually selected featured event
    let chosenKey = localStorage.getItem(FEATURED_STORAGE_KEY);
    let chosen = chosenKey ? eventData[chosenKey] : null;

    // If chosen event is deleted, conducted, or doesn't exist, clear it
    if (chosen && (chosen.conducted || chosen._deleted || deletedEvents.includes(chosenKey))) {
        chosen = null;
        chosenKey = null;
        localStorage.removeItem(FEATURED_STORAGE_KEY);
    }

    // Fallback: auto-select soonest upcoming event
    if (!chosen) {
        let minDiff = Infinity;
        for (const [key, e] of Object.entries(eventData)) {
            if (!e.conducted && !e._deleted && !deletedEvents.includes(key)) {
                const diff = new Date(e.isoDate) - now;
                if (diff > 0 && diff < minDiff) {
                    minDiff = diff;
                    chosen = e;
                    chosenKey = key;
                }
            }
        }
    }

    if (chosen) {
        card.setAttribute('onclick', `openEventDetail('${chosenKey}')`);
        const imgEl = document.getElementById('featuredEventImg');
        if (imgEl) imgEl.src = chosen.img;
        const titleEl = document.getElementById('featuredEventTitle');
        if (titleEl) titleEl.textContent = chosen.title;
        const dateEl = document.getElementById('featuredEventDate');
        if (dateEl) dateEl.textContent = chosen.date;
        const cdEl = document.getElementById('featuredEventCountdown');
        if (cdEl) cdEl.setAttribute('data-countdown-date', chosen.isoDate);
        card.style.display = 'block';
    } else {
        card.style.display = 'none';
    }
}

// ---- Featured Event Picker (admin-only) ----
window.toggleFeaturedPicker = function () {
    const picker = document.getElementById('featuredEventPicker');
    if (!picker) return;
    const isHidden = picker.classList.contains('hidden');
    if (isHidden) {
        // Populate the picker list
        const list = document.getElementById('featuredPickerList');
        if (!list) return;
        list.innerHTML = '';
        const now = new Date();
        const deletedEvents = getDeletedEvents();
        for (const [key, e] of Object.entries(eventData)) {
            if (e.conducted || e._deleted || deletedEvents.includes(key)) continue;
            const diff = new Date(e.isoDate) - now;
            if (diff <= 0) continue;
            const item = document.createElement('div');
            item.className = 'flex items-center gap-3 p-3 rounded-xl bg-accent/[0.06] border border-accent/15 cursor-pointer hover:border-accent/50 hover:bg-accent/[0.12] transition-all';
            item.innerHTML = `
                <img src="${e.img}" alt="${e.title}" class="w-12 h-12 rounded-lg object-cover shrink-0">
                <div class="min-w-0">
                    <p class="text-[13px] font-semibold truncate">${e.title}</p>
                    <p class="text-[11px] text-text2">${e.date}</p>
                </div>`;
            item.addEventListener('click', () => window.selectFeaturedEvent(key));
            list.appendChild(item);
        }
        if (list.children.length === 0) {
            list.innerHTML = '<p class="text-xs text-text2 text-center py-4 col-span-2">No upcoming events available.</p>';
        }
        picker.classList.remove('hidden');
    } else {
        picker.classList.add('hidden');
    }
};

window.selectFeaturedEvent = function (key) {
    localStorage.setItem(FEATURED_STORAGE_KEY, key);
    updateFeaturedEvent();
    const picker = document.getElementById('featuredEventPicker');
    if (picker) picker.classList.add('hidden');
    showToast('⭐ Featured event changed to "' + (eventData[key]?.title || key) + '"');
};

// ---- Event Deletion Persistence ----
const DELETED_STORAGE_KEY = 'dipp_deleted_events';

function getDeletedEvents() {
    try {
        const raw = localStorage.getItem(DELETED_STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch { return []; }
}

function saveDeletedEvent(key) {
    const deleted = getDeletedEvents();
    if (!deleted.includes(key)) {
        deleted.push(key);
        localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deleted));
    }
}

window.deleteEvent = function (key) {
    // Remove from DOM
    const cards = document.querySelectorAll('.event-card-neon');
    cards.forEach(card => {
        const onc = card.getAttribute('onclick') || '';
        const fn = card.onclick;
        // Check inline onclick or JS onclick
        if (onc.includes(`'${key}'`) || (fn && fn.toString().includes(key))) {
            card.remove();
        }
    });

    // Mark as deleted
    if (eventData[key]) {
        eventData[key]._deleted = true;
    }
    saveDeletedEvent(key);

    // Also remove from custom events storage
    saveEventsToStorage();

    // Update featured if this was the featured event
    const featuredKey = localStorage.getItem(FEATURED_STORAGE_KEY);
    if (featuredKey === key) {
        localStorage.removeItem(FEATURED_STORAGE_KEY);
    }
    updateFeaturedEvent();

    showToast('🗑 Event deleted');
};

// ---- Event Persistence (localStorage) ----
const STORAGE_KEY = 'dipp_custom_events_v2';

function saveEventsToStorage() {
    try {
        const toSave = {};
        for (const [k, v] of Object.entries(eventData)) {
            if (k.startsWith('dipp_rsvp_') && !v._deleted) toSave[k] = v;
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) { console.warn('saveEvents:', e); }
}

function loadEventsFromStorage() {
    // 1. Remove hardcoded event cards that were previously deleted
    const deletedEvents = getDeletedEvents();
    deletedEvents.forEach(key => {
        if (eventData[key]) eventData[key]._deleted = true;
        // Remove matching static cards from DOM
        document.querySelectorAll('.event-card-neon').forEach(card => {
            const onc = card.getAttribute('onclick') || '';
            if (onc.includes(`'${key}'`)) card.remove();
        });
    });

    // 2. Load dynamically added events
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        const placeholders = {
            Workshop: 'https://images.unsplash.com/photo-1531746790095-e5325c943422?w=600&h=400&fit=crop',
            Hackathon: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop',
            Competition: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop',
            Seminar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop',
        };
        for (const [rsvpKey, e] of Object.entries(saved)) {
            if (e._deleted) continue;
            eventData[rsvpKey] = e;
            const gridId = e.conducted ? 'conductedEventsGrid' : 'upcomingEventsGrid';
            const grid = document.getElementById(gridId);
            if (!grid) continue;
            const card = document.createElement('div');
            card.dataset.category = e.category;
            card.dataset.date = e.isoDate?.split('T')[0] || '';
            const imgSrc = e.img || placeholders[e.category] || placeholders.Workshop;
            if (e.conducted) {
                card.className = 'event-card-neon relative rounded-2xl overflow-hidden h-[300px] border border-accent/20 cursor-pointer opacity-80 hover:-translate-y-1 transition-all';
                card.onclick = () => window.openEventDetail(rsvpKey);
                card.innerHTML = `
                    <img src="${imgSrc}" alt="${e.title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105">
                    <div class="event-neon-gradient conducted-gradient"></div>
                    <div class="absolute top-3.5 left-3.5 right-3.5 flex justify-between z-2">
                        <span class="inline-block text-[11px] font-bold px-3 py-1 rounded-xl bg-text2/10 text-text2">✓ Completed</span>
                        <span class="text-xs text-text2 bg-black/40 px-2.5 py-0.5 rounded-lg">${e.date}</span>
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 p-5 z-2">
                        <h4 class="text-lg font-bold mb-2">${e.title}</h4>
                        <span class="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-full bg-white/5 text-white border border-white/12">👁 View Highlights</span>
                    </div>
                    <button class="delete-btn absolute top-2.5 right-2.5 z-5 w-7 h-7 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[13px] cursor-pointer flex items-center justify-center hover:bg-red-500 hover:text-white admin-only"
                        onclick="event.stopPropagation();window.deleteEvent('${rsvpKey}')" title="Delete">🗑</button>`;
            } else {
                card.className = 'event-card-neon relative rounded-2xl overflow-hidden h-[300px] border border-accent/20 cursor-pointer hover:-translate-y-1 transition-all';
                card.onclick = () => window.openEventDetail(rsvpKey);
                card.innerHTML = `
                    <img src="${imgSrc}" alt="${e.title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105">
                    <div class="event-neon-gradient"></div>
                    <div class="absolute top-3.5 left-3.5 right-3.5 flex justify-between z-2">
                        <span class="inline-block text-[11px] font-bold px-3 py-1 rounded-xl bg-accent/20 text-accent-light">Upcoming</span>
                        <span class="text-xs text-text2 bg-black/40 px-2.5 py-0.5 rounded-lg">${e.date}</span>
                    </div>
                    <div class="absolute bottom-0 left-0 right-0 p-5 z-2">
                        <h4 class="text-lg font-bold mb-2">${e.title}</h4>
                        <span class="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-full bg-accent text-white">Register</span>
                    </div>
                    <button class="delete-btn absolute top-2.5 right-2.5 z-5 w-7 h-7 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[13px] cursor-pointer flex items-center justify-center hover:bg-red-500 hover:text-white admin-only"
                        onclick="event.stopPropagation();window.deleteEvent('${rsvpKey}')" title="Delete">🗑</button>`;
            }
            grid.appendChild(card);
            if (isAdmin()) {
                card.querySelectorAll('.admin-only').forEach(el => { el.style.display = ''; el.style.opacity = '1'; });
            }
        }
    } catch (e) { console.warn('loadEvents:', e); }
}

// Expose saveEventsToStorage globally for inline onclick handlers
window.saveEventsToStorage = saveEventsToStorage;

// ---- Init ----
function init() {
    // 0. Typewriter hero
    initTypewriter();

    // 1. Reveal page (no FOUC)
    document.body.classList.add('page-ready');

    // 2. Role UI
    applyRoleUI();

    // 3. Reminder badge
    updateReminderBadge();

    // 3.5. Featured Event
    updateFeaturedEvent();

    // 3.6. Auto-promote any expired upcoming events → Conducted
    autoPromoteExpiredEvents();

    // 3.7. Load persisted events from localStorage
    loadEventsFromStorage();

    // 4. Countdown tickers
    initCountdownTickers();

    // 5. Cursor glow — removed per user request

    // 6. Page transitions
    initPageTransitions();

    // 7. Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', () => { logout(); applyRoleUI(); });

    // 8. Mobile menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinksEl = document.getElementById('navLinks');
    if (mobileMenuBtn && navLinksEl) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinksEl.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
        document.querySelectorAll('#navLinks .nav-link').forEach(l =>
            l.addEventListener('click', () => {
                navLinksEl.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            })
        );
    }

    // 9. Scroll: navbar + active link
    const allSections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        document.getElementById('navbar')?.classList.toggle('scrolled', window.scrollY > 50);
        let cur = '';
        allSections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) cur = s.id; });
        document.querySelectorAll('.nav-link').forEach(l => {
            const isActive = l.getAttribute('href') === '#' + cur;
            l.style.color = isActive ? '#a855f7' : '';
            l.style.textShadow = isActive ? '0 0 12px rgba(124,58,237,0.5)' : '';
        });
    });

    // 10. Scroll reveal
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('revealed');
                if (e.target.id === 'stats') animateCounters();
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));

    // 11. Team carousel
    const carousel = document.getElementById('teamCarousel');
    document.getElementById('teamPrev')?.addEventListener('click', () => carousel?.scrollBy({ left: -220, behavior: 'smooth' }));
    document.getElementById('teamNext')?.addEventListener('click', () => carousel?.scrollBy({ left: 220, behavior: 'smooth' }));

    // 11. Team expand cards — click to expand/collapse (for touch devices)
    document.querySelectorAll('.team-ds-card').forEach(card => {
        card.addEventListener('click', () => {
            const isActive = card.classList.contains('team-ds-active');
            // Collapse all cards
            document.querySelectorAll('.team-ds-card').forEach(c => c.classList.remove('team-ds-active'));
            // Expand clicked card if it wasn't already active
            if (!isActive) card.classList.add('team-ds-active');
        });
    });

    // 12. Smooth anchor scrolling
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const t = document.querySelector(a.getAttribute('href'));
            if (t) window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
        });
    });

    // 13. Modal bindings
    document.getElementById('openAddEvent')?.addEventListener('click', () => {
        // Reset conducted checkbox to unchecked for upcoming events
        const cb = document.getElementById('eventConducted');
        if (cb) cb.checked = false;
        // Reset modal title
        const modalTitle = document.querySelector('#addEventModal h2');
        if (modalTitle) modalTitle.innerHTML = 'Add New <span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-500">Event</span>';
        openModal('addEventModal');
    });
    document.getElementById('openAddConductedEvent')?.addEventListener('click', () => {
        // Pre-tick conducted checkbox so the card goes to the right grid
        const cb = document.getElementById('eventConducted');
        if (cb) cb.checked = true;
        // Update modal title to indicate conducted event
        const modalTitle = document.querySelector('#addEventModal h2');
        if (modalTitle) modalTitle.innerHTML = 'Add <span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-500">Conducted</span> Event';
        openModal('addEventModal');
    });
    document.getElementById('closeEventModal')?.addEventListener('click', () => closeModal('addEventModal'));
    document.getElementById('addEventModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal('addEventModal'); });
    document.getElementById('closeImageModal')?.addEventListener('click', () => closeModal('addImageModal'));
    document.getElementById('addImageModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal('addImageModal'); });
    document.getElementById('closeEventDetail')?.addEventListener('click', () => closeModal('eventDetailModal'));
    document.getElementById('eventDetailModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) closeModal('eventDetailModal'); });
    // Add Event Album modal (president-only)
    document.getElementById('openAddAlbum')?.addEventListener('click', () => openModal('addAlbumModal'));
    document.getElementById('closeAlbumModal')?.addEventListener('click', () => { closeModal('addAlbumModal'); resetAlbumForm(); });
    document.getElementById('addAlbumModal')?.addEventListener('click', e => { if (e.target === e.currentTarget) { closeModal('addAlbumModal'); resetAlbumForm(); } });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
            closeModal('addEventModal'); closeModal('addImageModal');
            closeModal('eventDetailModal'); closeModal('addAlbumModal');
        }
    });

    // 14. Forms
    const addEventFormEl = document.getElementById('addEventForm');
    if (addEventFormEl) {
        addEventFormEl.addEventListener('submit', e => {
            e.preventDefault();
            const form = e.target;
            const inputs = form.querySelectorAll('input[type="text"]');
            const title = inputs[0]?.value.trim() || 'Untitled Event';
            const venue = inputs[1]?.value.trim() || 'TBA';
            const dateRaw = form.querySelector('input[type="date"]')?.value || '';
            const timeRaw = form.querySelector('input[type="time"]')?.value || '';
            const category = document.getElementById('eventCategory')?.value || 'Workshop';
            const isConducted = document.getElementById('eventConducted')?.checked || false;
            const fileInput = document.getElementById('eventFileInput');

            const dateDisplay = dateRaw
                ? new Date(dateRaw + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                : 'TBA';
            const timeDisplay = timeRaw
                ? new Date('1970-01-01T' + timeRaw).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                : '';

            const placeholders = {
                Workshop: 'https://images.unsplash.com/photo-1531746790095-e5325c943422?w=600&h=400&fit=crop',
                Hackathon: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600&h=400&fit=crop',
                Competition: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&h=400&fit=crop',
                Seminar: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop',
                TechTalk: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=600&h=400&fit=crop',
            };

            const desc = form.querySelector('textarea')?.value.trim() || '';
            const rsvpKey = 'dipp_rsvp_' + Date.now();

            function injectCard(imgSrc) {
                // Register in eventData so openEventDetail + reminders work
                eventData[rsvpKey] = {
                    img: imgSrc,
                    title,
                    date: dateDisplay,
                    isoDate: dateRaw ? dateRaw + 'T' + (timeRaw || '00:00') : new Date().toISOString(),
                    time: timeDisplay || 'TBA',
                    venue,
                    duration: 'TBA',
                    category,
                    audience: 'All Students',
                    about: desc || `${title} — hosted by the DIPP Club. Stay tuned for details.`,
                    conducted: isConducted,
                    rsvpCount: 0,
                };

                const gridId = isConducted ? 'conductedEventsGrid' : 'upcomingEventsGrid';
                const grid = document.getElementById(gridId);
                if (!grid) return;
                const card = document.createElement('div');
                card.dataset.category = category;
                card.dataset.date = dateRaw;

                if (isConducted) {
                    card.className = 'event-card-neon relative rounded-2xl overflow-hidden h-[300px] border border-accent/20 cursor-pointer opacity-80 hover:-translate-y-1 transition-all';
                    card.onclick = () => window.openEventDetail(rsvpKey);
                    card.innerHTML = `
                        <img src="${imgSrc}" alt="${title}" class="w-full h-full object-cover hover:scale-105 transition-transform duration-500">
                        <div class="event-neon-gradient conducted-gradient"></div>
                        <div class="absolute top-3.5 left-3.5 right-3.5 flex justify-between z-2">
                            <span class="inline-block text-[11px] font-bold px-3 py-1 rounded-xl bg-text2/10 text-text2">✓ Completed</span>
                            <span class="text-xs text-text2 bg-black/40 px-2.5 py-0.5 rounded-lg">${dateDisplay}</span>
                        </div>
                        <div class="absolute bottom-0 left-0 right-0 p-5 z-2">
                            <h4 class="text-lg font-bold mb-2">${title}</h4>
                            <span class="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-full bg-white/5 text-white border border-white/12">👁 View Highlights</span>
                        </div>
                        <button class="absolute top-2.5 right-2.5 z-5 w-7 h-7 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[13px] cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white admin-only delete-btn"
                            onclick="event.stopPropagation();window.deleteEvent('${rsvpKey}')" title="Delete">🗑</button>`;
                } else {
                    card.className = 'event-card-neon relative rounded-2xl overflow-hidden h-[300px] border border-accent/20 cursor-pointer hover:-translate-y-1 transition-all';
                    card.onclick = () => window.openEventDetail(rsvpKey);
                    card.innerHTML = `
                        <img src="${imgSrc}" alt="${title}" class="w-full h-full object-cover transition-transform duration-500 hover:scale-105">
                        <div class="event-neon-gradient"></div>
                        <div class="absolute top-3.5 left-3.5 right-3.5 flex justify-between z-2">
                            <span class="inline-block text-[11px] font-bold px-3 py-1 rounded-xl bg-accent/20 text-accent-light">Upcoming</span>
                            <span class="text-xs text-text2 bg-black/40 px-2.5 py-0.5 rounded-lg">${dateDisplay}</span>
                        </div>
                        <div class="absolute bottom-0 left-0 right-0 p-5 z-2">
                            <h4 class="text-lg font-bold mb-1">${title}</h4>
                            ${timeDisplay ? `<p class="text-[11px] text-text2 mb-2">${timeDisplay} · ${venue}</p>` : ''}
                            <span class="rsvp-badge-${rsvpKey} inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-text2 mb-2">👥 0 going</span>
                            <span class="inline-flex items-center text-xs font-semibold px-4 py-2 rounded-full bg-accent text-white">Register</span>
                        </div>
                        <button class="absolute top-2.5 right-2.5 z-5 w-7 h-7 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[13px] cursor-pointer flex items-center justify-center opacity-0 hover:bg-red-500 hover:text-white admin-only delete-btn"
                            onclick="event.stopPropagation();window.deleteEvent('${rsvpKey}')" title="Delete">🗑</button>`;
                }
                grid.appendChild(card);
                // Delete button always visible for admins
                if (isAdmin()) {
                    card.querySelectorAll('.admin-only').forEach(el => { el.style.display = ''; el.style.opacity = '1'; });
                    // Remove hover-only opacity from delete btn
                    card.querySelectorAll('.delete-btn').forEach(btn => { btn.style.opacity = '1'; btn.style.removeProperty('opacity'); });
                }
                // Save events to localStorage for persistence
                saveEventsToStorage();
                // Re-run filter in case the grid has filters active
                if (typeof window.applyEventFilter === 'function') window.applyEventFilter();
            }

            // Use first accumulated image or placeholder
            const accumulated = fileInput?._accumulatedImages || [];
            if (accumulated.length > 0) {
                injectCard(accumulated[0]);
            } else {
                injectCard(placeholders[category] || placeholders.Workshop);
            }

            form.reset();
            const lbl = document.getElementById('eventFileLabel');
            if (lbl) lbl.textContent = 'Upload image or drag & drop';
            // Clear accumulated file list reference
            if (fileInput) fileInput._accumulatedImages = [];
            closeModal('addEventModal');
            // Reset modal title back to default
            const modalTitle = document.querySelector('#addEventModal h2');
            if (modalTitle) modalTitle.innerHTML = 'Add New <span class="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-500">Event</span>';
            showToast('✅ "' + title + '" added to ' + (isConducted ? 'Conducted' : 'Upcoming') + ' Events!');
        });
    }

    document.getElementById('addImageForm')?.addEventListener('submit', e => { e.preventDefault(); closeModal('addImageModal'); showToast('✅ Image added to gallery!'); });
    initAlbumForm();

    // 15. Drive upload zones — event form accumulates images
    document.querySelectorAll('.drive-upload').forEach(zone => {
        const fileInput = zone.querySelector('.file-input-hidden');
        const driveBtn = zone.querySelector('.btn-drive');
        if (driveBtn && fileInput) {
            driveBtn.addEventListener('click', e => {
                e.preventDefault();
                e.stopPropagation();
                fileInput.click();
            });
        }
        if (fileInput) {
            // Initialize accumulated images array on the fileInput element
            fileInput._accumulatedImages = [];

            // Create a preview grid below the upload zone
            let previewGrid = zone.parentElement?.querySelector('.event-img-preview');
            if (!previewGrid) {
                previewGrid = document.createElement('div');
                previewGrid.className = 'event-img-preview grid grid-cols-3 gap-2 mt-3';
                zone.parentElement?.appendChild(previewGrid);
            }

            function addFiles(files) {
                Array.from(files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = ev => {
                        const src = ev.target.result;
                        fileInput._accumulatedImages.push(src);
                        // Add thumbnail
                        const wrapper = document.createElement('div');
                        wrapper.className = 'relative rounded-lg overflow-hidden aspect-square';
                        wrapper.innerHTML = `<img src="${src}" class="w-full h-full object-cover">
                            <button type="button" class="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center leading-none" onclick="const idx=Array.from(this.closest('.event-img-preview').children).indexOf(this.parentElement);document.querySelector('.file-input-hidden')._accumulatedImages?.splice(idx,1);this.parentElement.remove()">✕</button>`;
                        previewGrid.appendChild(wrapper);
                        // Update label
                        const label = zone.querySelector('span');
                        if (label) label.textContent = fileInput._accumulatedImages.length + ' image(s) selected — click to add more';
                    };
                    reader.readAsDataURL(file);
                });
            }

            // Click on zone (not button) also opens picker
            zone.addEventListener('click', e => {
                if (e.target === driveBtn || driveBtn?.contains(e.target)) return;
                fileInput.click();
            });

            zone.addEventListener('dragover', e => { e.preventDefault(); zone.style.borderColor = 'rgba(168,85,247,0.6)'; });
            zone.addEventListener('dragleave', () => { zone.style.borderColor = ''; });
            zone.addEventListener('drop', e => {
                e.preventDefault(); zone.style.borderColor = '';
                addFiles(e.dataTransfer.files);
            });
            fileInput.addEventListener('change', () => {
                if (fileInput.files.length) addFiles(fileInput.files);
            });
        }
    });
}

// ---- Album Form ----
function initAlbumForm() {
    const fileInput = document.getElementById('albumFileInput');
    const browseBtn = document.getElementById('albumBrowseBtn');
    const dropArea = document.getElementById('albumDropArea');
    const preview = document.getElementById('albumPreview');
    const fileLabel = document.getElementById('albumFileLabel');
    const form = document.getElementById('addAlbumForm');
    const gallerySection = document.querySelector('#gallery .max-w-\\[1200px\\]');

    if (!fileInput || !form) return;

    // Browse button → opens real file picker
    browseBtn?.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });

    // Also clicking the drop area opens picker
    dropArea?.addEventListener('click', e => {
        if (e.target === browseBtn || browseBtn?.contains(e.target)) return;
        fileInput.click();
    });

    // Drag-and-drop
    dropArea?.addEventListener('dragover', e => {
        e.preventDefault();
        dropArea.style.borderColor = 'rgba(168,85,247,0.7)';
        dropArea.style.background = 'rgba(124,58,237,0.08)';
    });
    dropArea?.addEventListener('dragleave', () => {
        dropArea.style.borderColor = '';
        dropArea.style.background = '';
    });
    dropArea?.addEventListener('drop', e => {
        e.preventDefault();
        dropArea.style.borderColor = '';
        dropArea.style.background = '';
        loadFilePreviews(e.dataTransfer.files);
    });

    // File input change
    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) loadFilePreviews(fileInput.files);
    });

    function loadFilePreviews(files) {
        if (!preview) return;
        preview.innerHTML = '';
        const count = files.length;
        if (fileLabel) fileLabel.textContent = count + ' image' + (count > 1 ? 's' : '') + ' selected';
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => {
                const img = document.createElement('img');
                img.src = ev.target.result;
                img.className = 'w-full aspect-square object-cover rounded-lg border border-accent/20';
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }

    // Form submit → inject new album into gallery
    form.addEventListener('submit', e => {
        e.preventDefault();
        const name = document.getElementById('albumEventName')?.value.trim();
        const summary = document.getElementById('albumSummary')?.value.trim();
        if (!name) return;

        // Collect preview srcs
        const imgs = Array.from(preview.querySelectorAll('img')).map(i => i.src);
        if (imgs.length === 0) { showToast('⚠️ Please select at least one image.'); return; }

        // Build album HTML
        const imgGrid = imgs.map(src => `
            <div class="rounded-lg overflow-hidden aspect-[4/3] cursor-pointer relative group">
                <img src="${src}" alt="${name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.06]">
                <button class="absolute top-2 right-2 z-5 w-7 h-7 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-[13px] cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all admin-only"
                    onclick="this.closest('div.group').remove()">🗑</button>
            </div>`).join('');

        const albumBlock = document.createElement('div');
        albumBlock.className = 'mb-12 reveal revealed';
        albumBlock.innerHTML = `
            <div class="flex justify-between items-start mb-5 gap-5 max-[900px]:flex-col">
                <div>
                    <h3 class="text-[22px] font-extrabold mb-1.5">${name}</h3>
                    ${summary ? `<p class="text-[13px] text-text2 leading-relaxed max-w-[450px]">${summary}</p>` : ''}
                </div>
                <button class="bg-red-500/10 text-red-400 border border-red-500/25 text-xs font-semibold px-3 py-1 rounded-xl cursor-pointer admin-only hover:bg-red-500 hover:text-white transition-all"
                    onclick="this.closest('.mb-12').remove()">🗑 Remove Album</button>
            </div>
            <div class="grid grid-cols-3 max-[900px]:grid-cols-2 max-[480px]:grid-cols-1 gap-3.5 glass-card rounded-2xl p-4">
                ${imgGrid}
            </div>`;

        // Insert before last child (which is the existing Hackathon block's parent)
        if (gallerySection) gallerySection.appendChild(albumBlock);

        closeModal('addAlbumModal');
        resetAlbumForm();
        showToast('✅ Album "' + name + '" added to gallery!');
    });
}

function resetAlbumForm() {
    const form = document.getElementById('addAlbumForm');
    if (form) form.reset();
    const preview = document.getElementById('albumPreview');
    if (preview) preview.innerHTML = '';
    const label = document.getElementById('albumFileLabel');
    if (label) label.textContent = 'Click to browse or drag & drop images';
    const dropArea = document.getElementById('albumDropArea');
    if (dropArea) { dropArea.style.borderColor = ''; dropArea.style.background = ''; }
}

// ---- Stat counters ----
function animateCounters() {
    document.querySelectorAll('[data-target]').forEach(el => {
        const target = +el.dataset.target, dur = 2200, start = performance.now();
        // Ease out cubic
        function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
        function tick(now) {
            const p = Math.min((now - start) / dur, 1);
            el.textContent = Math.floor(easeOut(p) * target) + '+';
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    });
}

// Run on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ============================================================
// Google Form Autofill — Per-event registration
// ============================================================

/**
 * Called by the "Register Now" button in the event detail modal.
 * Builds a pre-filled Google Form URL from the logged-in user's stored data
 * and opens it in a new tab. Tracks registration in localStorage.
 */
window.registerForEvent = function (key) {
    const e = eventData[key];
    if (!e || !e.formLink) { showToast('⚠️ No registration form configured for this event.'); return; }

    const user = getCurrentUser();
    if (!user) {
        showToast('🔒 Please sign in first to register.');
        setTimeout(() => { window.location.href = 'login.html'; }, 1200);
        return;
    }

    if (localStorage.getItem('dipp_reg_' + key) === 'true') {
        showToast('✅ You\'re already registered for ' + e.title + '!');
        return;
    }

    const f = e.formFields;
    const params = new URLSearchParams({
        [f.name]: user.name || '',
        [f.email]: user.email || '',
        [f.regNo]: user.regNo || '',
        [f.dept]: user.dept || '',
        [f.year]: user.year ? user.year + (typeof user.year === 'number' ? (user.year === 1 ? 'st' : user.year === 2 ? 'nd' : 'rd') + ' Year' : '') : ''
    });

    // Mark as registered locally
    localStorage.setItem('dipp_reg_' + key, 'true');
    showToast('📋 Opening registration form for ' + e.title + '…');

    window.open(e.formLink + '?' + params.toString(), '_blank');
};

/** Returns true if user already registered for this event */
window.isRegistered = function (key) {
    return localStorage.getItem('dipp_reg_' + key) === 'true';
};

// ============================================================
// Dock Neighbour Magnification (MagicUI spring-physics feel)
// ============================================================
function initDockMagnification() {
    document.querySelectorAll('.dock').forEach(dock => {
        const items = Array.from(dock.querySelectorAll('.dock-item'));
        items.forEach((item, idx) => {
            item.addEventListener('mouseenter', () => {
                items.forEach((el, i) => {
                    el.classList.remove('dock-adjacent', 'dock-near');
                    const dist = Math.abs(i - idx);
                    if (dist === 1) el.classList.add('dock-adjacent');
                    else if (dist === 2) el.classList.add('dock-near');
                });
            });
            item.addEventListener('mouseleave', () => {
                items.forEach(el => el.classList.remove('dock-adjacent', 'dock-near'));
            });
        });
    });
}

// Kick off dock magnification after DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDockMagnification);
} else {
    initDockMagnification();
}

// ============================================================
// Reminder Bell Panel
// ============================================================

function renderReminderPanel() {
    const panel = document.getElementById('reminderPanel');
    const list = document.getElementById('reminderList');
    const empty = document.getElementById('reminderEmpty');
    if (!panel || !list) return;

    import('./reminders.js').then(({ getReminders, removeReminder, getCountdown }) => {
        const ids = getReminders();
        list.innerHTML = '';

        if (ids.length === 0) {
            if (empty) empty.style.display = 'block';
            return;
        }
        if (empty) empty.style.display = 'none';

        ids.forEach(key => {
            const e = eventData[key];
            if (!e) return;
            const cd = getCountdown(e.isoDate);
            const cdText = cd.isPast ? 'Completed' : `⏳ ${cd.days}d ${cd.hours}h ${cd.mins}m left`;

            const item = document.createElement('div');
            item.className = 'flex items-start justify-between gap-3 p-3 rounded-xl bg-accent/[0.06] border border-accent/15';
            item.innerHTML = `
              <div>
                <p class="text-[13px] font-semibold mb-0.5">${e.title}</p>
                <p class="text-[11px] text-text2">📅 ${e.date}</p>
                <p class="text-[11px] ${cd.isPast ? 'text-text2/60' : cd.isUrgent ? 'text-amber-400 font-bold' : 'text-accent-light'}">${cdText}</p>
              </div>
              <button class="shrink-0 text-[11px] text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/25 rounded-lg px-2 py-1 cursor-pointer transition-all hover:bg-red-500/20"
                onclick="window.removeReminderFromPanel('${key}')">✕ Remove</button>
            `;
            list.appendChild(item);
        });
    });
}

window.removeReminderFromPanel = function (key) {
    import('./reminders.js').then(({ removeReminder }) => {
        removeReminder(key);
        renderReminderPanel();
        updateReminderBadge();
    });
};

window.toggleReminderPanel = function () {
    const panel = document.getElementById('reminderPanel');
    if (!panel) return;
    const isHidden = panel.classList.contains('hidden');
    if (isHidden) {
        renderReminderPanel();
        panel.classList.remove('hidden');
    } else {
        panel.classList.add('hidden');
    }
};

// Close panel on outside click
document.addEventListener('click', e => {
    const wrap = document.getElementById('reminderBellWrap');
    const panel = document.getElementById('reminderPanel');
    if (wrap && panel && !wrap.contains(e.target)) {
        panel.classList.add('hidden');
    }
});

// ============================================================
// EVENT FILTER + DATE SORT
// ============================================================
let _activeFilter = 'All';
let _dateAsc = true; // soonest first

window.applyEventFilter = function (filter) {
    if (filter !== undefined) {
        _activeFilter = filter;
        // Update pill active state
        document.querySelectorAll('.event-pill').forEach(p => {
            p.classList.toggle('active', p.dataset.filter === _activeFilter);
        });
    }
    const grid = document.getElementById('upcomingEventsGrid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.event-card-neon'));
    cards.forEach(card => {
        const cat = card.dataset.category || 'Unknown';
        const match = _activeFilter === 'All' || cat === _activeFilter;
        card.style.display = match ? '' : 'none';
    });
};

window.toggleDateSort = function () {
    _dateAsc = !_dateAsc;
    const btn = document.getElementById('dateSortBtn');
    if (btn) btn.textContent = '📅 Sort: ' + (_dateAsc ? 'Soonest' : 'Latest');
    const grid = document.getElementById('upcomingEventsGrid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.event-card-neon'));
    cards.sort((a, b) => {
        const da = new Date(a.dataset.date || '9999-12-31');
        const db = new Date(b.dataset.date || '9999-12-31');
        return _dateAsc ? da - db : db - da;
    });
    cards.forEach(c => grid.appendChild(c));
};

// Assign data-category and data-date to existing static event cards on load
(function labelStaticCards() {
    const staticCategories = {
        robowars: { category: 'Workshop', date: '2026-04-02' },
        iot: { category: 'Workshop', date: '2026-04-20' },
        memorytrix: { category: 'Competition', date: '2026-03-15' },
    };
    document.querySelectorAll('#upcomingEventsGrid .event-card-neon').forEach(card => {
        // Try to infer from onclick string
        const onc = card.getAttribute('onclick') || '';
        const match = onc.match(/openEventDetail\('(\w+)'\)/);
        if (match && staticCategories[match[1]]) {
            card.dataset.category = staticCategories[match[1]].category;
            card.dataset.date = staticCategories[match[1]].date;
        }
    });
})();

// ============================================================
// MOBILE NAV
// ============================================================
function openMobileNav() {
    document.body.classList.add('mobile-nav-open');
    const overlay = document.getElementById('mobileNavOverlay');
    const panel = document.getElementById('mobileNavPanel');
    const btn = document.getElementById('mobileMenuBtn');
    if (overlay) overlay.style.opacity = '1';
    if (panel) panel.style.transform = 'translateX(0)';
    if (btn) btn.classList.add('open');
}
window.closeMobileNav = function () {
    document.body.classList.remove('mobile-nav-open');
    const overlay = document.getElementById('mobileNavOverlay');
    const panel = document.getElementById('mobileNavPanel');
    const btn = document.getElementById('mobileMenuBtn');
    if (overlay) overlay.style.opacity = '0';
    if (panel) panel.style.transform = 'translateX(100%)';
    if (btn) btn.classList.remove('open');
};
document.getElementById('mobileMenuBtn')?.addEventListener('click', () => {
    if (document.body.classList.contains('mobile-nav-open')) closeMobileNav();
    else openMobileNav();
});
document.getElementById('mobileNavOverlay')?.addEventListener('click', closeMobileNav);

// ============================================================
// LOADING SKELETONS
// ============================================================
(function showSkeletons() {
    const grids = ['upcomingEventsGrid', 'conductedEventsGrid'];
    grids.forEach(id => {
        const grid = document.getElementById(id);
        if (!grid) return;
        // Add 2 skeleton cards that fade out after real content loads
        const skels = [1, 2].map(() => {
            const s = document.createElement('div');
            s.className = 'skeleton skeleton-card transition-opacity duration-500';
            grid.prepend(s);
            return s;
        });
        setTimeout(() => skels.forEach(s => { s.style.opacity = '0'; setTimeout(() => s.remove(), 500); }), 600);
    });
})();

// ============================================================
// JOIN FORM
// ============================================================
document.getElementById('joinForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector('input[type="text"]')?.value.trim();
    showToast(`🎉 Application submitted, ${name || 'friend'}! We'll reach out within 48 hours.`);
    form.reset();
    // Scroll to top
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 1000);
});

// ============================================================
// RSVP COUNT — increment on register
// ============================================================
const _origRegister = window.registerForEvent;
window.registerForEvent = function (key) {
    const wasRegistered = localStorage.getItem('dipp_reg_' + key) === 'true';
    if (_origRegister) _origRegister(key);
    // After original runs, if newly registered bump the count
    if (!wasRegistered && eventData[key]) {
        eventData[key].rsvpCount = (eventData[key].rsvpCount || 0) + 1;
        // Update any badge on the card
        document.querySelectorAll(`.rsvp-badge-${key}`).forEach(el => {
            el.textContent = `👥 ${eventData[key].rsvpCount} going`;
        });
    }
};
