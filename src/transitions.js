// ============================================================
// transitions.js — Smooth page fade transitions
// ============================================================

export function initPageTransitions() {
    // Add page-in animation on load
    document.body.classList.add("page-ready");

    // Intercept all same-origin page navigation links
    document.addEventListener("click", e => {
        const link = e.target.closest("a[href]");
        if (!link) return;
        const href = link.getAttribute("href");
        // Only intercept .html pages (not # anchors)
        if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto")) return;

        e.preventDefault();
        document.body.classList.add("page-exit");

        setTimeout(() => {
            window.location.href = href;
        }, 400);
    });
}
