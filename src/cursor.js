// ============================================================
// cursor.js — Shiny pointer effect (desktop only)
// ============================================================

export function initCursorGlow() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    // Hide default cursor
    document.documentElement.style.cursor = 'none';

    // ── Layer 1: Sharp bright dot (snaps to cursor, no lag) ──
    const dot = document.createElement('div');
    dot.id = 'cursor-dot';
    dot.style.cssText = `
        position: fixed;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #ffffff 0%, rgba(220,210,255,0.9) 50%, rgba(168,85,247,0.6) 100%);
        box-shadow: 0 0 6px 2px rgba(255,255,255,0.7), 0 0 14px 4px rgba(168,85,247,0.5);
        pointer-events: none;
        z-index: 99999;
        transform: translate(-50%, -50%);
        transition: width 0.18s ease, height 0.18s ease, box-shadow 0.18s ease, transform 0.12s ease, opacity 0.3s;
        opacity: 0;
        mix-blend-mode: screen;
    `;

    // ── Layer 2: Soft trailing halo ──
    const halo = document.createElement('div');
    halo.id = 'cursor-halo';
    halo.style.cssText = `
        position: fixed;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(168,85,247,0.18) 0%, rgba(124,58,237,0.07) 55%, transparent 80%);
        border: 1px solid rgba(168,85,247,0.25);
        pointer-events: none;
        z-index: 99998;
        transform: translate(-50%, -50%);
        transition: width 0.25s ease, height 0.25s ease, border-color 0.25s, opacity 0.3s;
        opacity: 0;
    `;

    document.body.appendChild(halo);
    document.body.appendChild(dot);

    let mx = 0, my = 0, hx = 0, hy = 0;

    // Snap dot exactly to pointer
    document.addEventListener('mousemove', e => {
        mx = e.clientX; my = e.clientY;
        dot.style.left = mx + 'px';
        dot.style.top = my + 'px';
        dot.style.opacity = '1';
        halo.style.opacity = '1';
    });

    document.addEventListener('mouseleave', () => {
        dot.style.opacity = '0';
        halo.style.opacity = '0';
    });

    // Lerp-smooth halo
    function animateHalo() {
        hx += (mx - hx) * 0.12;
        hy += (my - hy) * 0.12;
        halo.style.left = hx + 'px';
        halo.style.top = hy + 'px';
        requestAnimationFrame(animateHalo);
    }
    animateHalo();

    // Expand on hover over interactive elements
    const sel = 'a, button, [onclick], input, textarea, select, .tcard, .glass-card, .event-card-neon';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(sel)) {
            dot.style.width = '18px';
            dot.style.height = '18px';
            dot.style.boxShadow = '0 0 10px 4px rgba(255,255,255,0.85), 0 0 28px 8px rgba(168,85,247,0.7)';
            halo.style.width = '72px';
            halo.style.height = '72px';
            halo.style.borderColor = 'rgba(168,85,247,0.55)';
        }
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(sel)) {
            dot.style.width = '10px';
            dot.style.height = '10px';
            dot.style.boxShadow = '0 0 6px 2px rgba(255,255,255,0.7), 0 0 14px 4px rgba(168,85,247,0.5)';
            halo.style.width = '44px';
            halo.style.height = '44px';
            halo.style.borderColor = 'rgba(168,85,247,0.25)';
        }
    });

    // Click flash — scale compress
    document.addEventListener('mousedown', () => {
        dot.style.transform = 'translate(-50%, -50%) scale(0.6)';
    });
    document.addEventListener('mouseup', () => {
        dot.style.transform = 'translate(-50%, -50%) scale(1)';
    });
}
