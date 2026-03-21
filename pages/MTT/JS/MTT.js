/* ============================================================
   GHSA — Meet The Team JS
   ============================================================ */

const tabs   = document.querySelectorAll('.team-tab');
const panels = document.querySelectorAll('.team-panel');

function staggerCards(panel) {
    const cards = panel.querySelectorAll('.member-card');
    cards.forEach((card, i) => {
        card.classList.remove('visible');
        setTimeout(() => card.classList.add('visible'), i * 100);
    });
}

// Stagger cards in the initial active panel on load
const initialPanel = document.querySelector('.team-panel.active');
if (initialPanel) staggerCards(initialPanel);

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const target = tab.dataset.team;

        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));

        tab.classList.add('active');

        const activePanel = document.getElementById(target);
        activePanel.classList.add('active');
        staggerCards(activePanel);
    });
});