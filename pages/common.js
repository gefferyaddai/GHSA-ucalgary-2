/* ============================================================
   GHSA — Shared navbar behaviour (scroll shrink + hamburger)
   Included by every page. Requires:
     <nav id="mainNav">
       <button id="navToggle" aria-expanded="false">…</button>
       <div id="navLinks">…</div>
     </nav>
   ============================================================ */

(function () {
    const nav       = document.getElementById('mainNav');
    const navToggle = document.getElementById('navToggle');
    const navLinks  = document.getElementById('navLinks');

    if (!nav || !navToggle || !navLinks) return;

    // ── SCROLL SHRINK ─────────────────────────────────────
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 40);
    });

    // ── HAMBURGER TOGGLE ──────────────────────────────────
    navToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = navLinks.classList.toggle('open');
        navToggle.classList.toggle('open', isOpen);
        navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // ── CLOSE ON NAV LINK CLICK (mobile) ──────────────────
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 860) {
                navLinks.classList.remove('open');
                navToggle.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });
    });

    // ── CLOSE ON OUTSIDE CLICK ────────────────────────────
    document.addEventListener('click', (e) => {
        if (!nav.contains(e.target) && navLinks.classList.contains('open')) {
            navLinks.classList.remove('open');
            navToggle.classList.remove('open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
})();

// ── TOAST NOTIFICATIONS ───────────────────────────────
// Usage: showToast('message')              → green
//        showToast('message', 'error')     → red
//        showToast('message', 'neutral')   → grey
function showToast(message, type = 'success') {
    const colours = {
        success: 'background:#006b3f;color:#fff;',
        error:   'background:#b91c1c;color:#fff;',
        neutral: 'background:#444440;color:#fff;',
    };

    // Inject keyframes once
    if (!document.getElementById('ghsa-toast-style')) {
        const style = document.createElement('style');
        style.id = 'ghsa-toast-style';
        style.textContent = `
            @keyframes toastIn {
                from { opacity:0; transform:translateX(-50%) translateY(-12px); }
                to   { opacity:1; transform:translateX(-50%) translateY(0); }
            }`;
        document.head.appendChild(style);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        position:fixed; top:100px; left:50%; transform:translateX(-50%);
        padding:16px 28px; border-radius:12px;
        font-family:'DM Sans',sans-serif; font-size:0.9rem; font-weight:600;
        z-index:9999; max-width:500px; text-align:center;
        animation:toastIn 0.4s ease;
        ${colours[type] || colours.success}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transition = 'opacity 0.4s ease';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}