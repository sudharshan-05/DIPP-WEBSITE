// ============================================================
// auth.js — Role-based authentication & permission system
// ============================================================

export const ADMIN_ROLES = ["President", "Vice President", "Lead", "Member"];
export const STUDENT_ROLE = "Student";

export const DEMO_ACCOUNTS = [
    { email: "president@dipp.club", password: "president123", role: "President", name: "VISHAL .M", regNo: "21CS001", dept: "CS", year: 3 },

    { email: "vp@dipp.club", password: "vp123", role: "Vice President", name: "Sara M.", regNo: "21EE002", dept: "EE", year: 3 },
    { email: "lead@dipp.club", password: "lead123", role: "Lead", name: "Omar R.", regNo: "22CS003", dept: "CS", year: 2 },
    { email: "member@dipp.club", password: "member123", role: "Member", name: "Fatima Z.", regNo: "22ME004", dept: "ME", year: 2 },
    { email: "student@dipp.club", password: "student123", role: "Student", name: "Ziad F.", regNo: "23CS005", dept: "CS", year: 1 },
];

export function getCurrentUser() {
    try {
        const raw = localStorage.getItem("dipp_user");
        return raw ? JSON.parse(raw) : null;
    } catch { return null; }
}

export function isAdmin(user = getCurrentUser()) {
    return user && ADMIN_ROLES.includes(user.role);
}

export function isPresident(user = getCurrentUser()) {
    return user && user.role === 'President';
}

export function hasPermission(action, user = getCurrentUser()) {
    if (!user) return false;
    const adminActions = ["addEvent", "editEvent", "deleteEvent", "addGallery", "deleteGallery", "viewDashboard"];
    if (adminActions.includes(action)) return isAdmin(user);
    return true; // Students can view/register
}

export function applyRoleUI() {
    const user = getCurrentUser();
    const admin = isAdmin(user);
    const president = isPresident(user);

    // Show/hide admin-only elements
    document.querySelectorAll(".admin-only").forEach(el => {
        el.style.display = admin ? "" : "none";
    });

    // Show/hide president-only elements
    document.querySelectorAll(".president-only").forEach(el => {
        el.style.display = president ? "" : "none";
    });

    // Show/hide student-only elements
    document.querySelectorAll(".student-only").forEach(el => {
        el.style.display = (!user || !admin) ? "" : "none";
    });

    // Update navbar
    const signInBtn = document.getElementById("signInBtn");
    const navUser = document.getElementById("navUser");

    if (user) {
        if (signInBtn) signInBtn.style.display = "none";
        if (navUser) {
            navUser.style.display = "flex";
            navUser.classList.remove("hidden");
        }
        const badge = document.getElementById("navRoleBadge");
        const label = document.getElementById("navUserLabel");
        const avatar = document.getElementById("navAvatar");
        if (badge) badge.textContent = user.role;
        if (label) label.textContent = user.name || user.role;
        if (avatar) avatar.textContent = (user.name || user.role)[0].toUpperCase();
    } else {
        if (signInBtn) signInBtn.style.display = "";
        if (navUser) { navUser.style.display = "none"; navUser.classList.add("hidden"); }
    }
}

export function logout() {
    localStorage.removeItem("dipp_user");
    applyRoleUI();
}
