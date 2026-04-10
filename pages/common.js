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