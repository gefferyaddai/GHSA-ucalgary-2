/* ============================================================
   GHSA — Why Join Page JS
   ============================================================ */

// ── CARD SCROLL-IN ANIMATION ─────────────────────────
const cards = document.querySelectorAll('.wj-card');

if (cards.length) {
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const allCards = entry.target.closest('.wj-cards').querySelectorAll('.wj-card');
                allCards.forEach((card, i) => {
                    setTimeout(() => card.classList.add('visible'), i * 100);
                });
                cardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    cardObserver.observe(cards[0]);
}

// ── STAT COUNT-UP ANIMATION ──────────────────────────
function countUp(el, target, duration = 1600) {
    const start = performance.now();
    const isDecimal = target % 1 !== 0;

    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        el.textContent = current;
        if (progress < 1) requestAnimationFrame(update);
        else el.textContent = target;
    }

    requestAnimationFrame(update);
}

const statNumbers = document.querySelectorAll('.wj-stat-number span');

if (statNumbers.length) {
    const statObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                statNumbers.forEach(el => {
                    const target = parseInt(el.textContent, 10);
                    countUp(el, target);
                });
                statObserver.disconnect();
            }
        });
    }, { threshold: 0.3 });

    statObserver.observe(document.querySelector('.wj-stats'));
}