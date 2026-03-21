function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

function attachHeartBurst() {
    const HEARTS = ['❤️', '🖤', '💛', '💚', '🇬🇭','❤️', '🖤', '💛', '💚', '🇬🇭','❤️', '🖤', '💛', '💚', '🇬🇭'];

    document.querySelectorAll('.ig-card').forEach(card => {
        // avoid double-attaching
        if (card.dataset.heartAttached) return;
        card.dataset.heartAttached = 'true';

        let interval = null;

        function spawnHeart() {
            const heart = document.createElement('span');
            heart.className = 'heart-particle';
            heart.textContent = HEARTS[Math.floor(Math.random() * HEARTS.length)];

            const cardWidth = card.offsetWidth;
            const x = 16 + Math.random() * (cardWidth - 40);
            heart.style.left = x + 'px';
            heart.style.bottom = '16px';

            const tx = (Math.random() - 0.5) * 90;
            const ty = -(50 + Math.random() * 70);
            heart.style.setProperty('--tx', tx + 'px');
            heart.style.setProperty('--ty', ty + 'px');

            card.appendChild(heart);
            heart.addEventListener('animationend', () => heart.remove());
        }

        card.addEventListener('mouseenter', () => {
            spawnHeart();
            interval = setInterval(spawnHeart, 200);
        });

        card.addEventListener('mouseleave', () => {
            clearInterval(interval);
            interval = null;
        });
    });
}

function renderInstagram() {
    const igGrid = document.getElementById("igGrid");
    if (!igGrid) return;

    const IG_POST_URLS = [
        "https://www.instagram.com/p/DVXSE0ckoVl/",
        "https://www.instagram.com/p/DVcuGqakYbb/",
        "https://www.instagram.com/p/DVjPNk4mnvc/",
    ];

    if (IG_POST_URLS.length === 0) {
        igGrid.innerHTML = Array.from({ length: 3 })
            .map((_, i) => `
                <div class="ig-card">
                    <div class="placeholder">
                        <div>
                            <div class="strong">Instagram Post ${i + 1}</div>
                            <div class="tiny muted">Paste your post URLs in <span class="mono">aboutUs.js</span></div>
                        </div>
                    </div>
                </div>
            `).join("");

        attachHeartBurst();
        return;
    }

    igGrid.innerHTML = IG_POST_URLS.map((url) => {
        const safeUrl = escapeHTML(url);
        return `
            <div class="ig-card">
                <blockquote
                    class="instagram-media"
                    data-instgrm-permalink="${safeUrl}"
                    data-instgrm-version="14"
                    style="background:#fff; border:0; margin:0; padding:0; width:100%;">
                </blockquote>
            </div>
        `;
    }).join("");

    if (window.instgrm?.Embeds?.process) {
        window.instgrm.Embeds.process();
    }

    // attach after cards are in the DOM
    attachHeartBurst();
}

document.addEventListener("DOMContentLoaded", () => {
    renderInstagram();
});