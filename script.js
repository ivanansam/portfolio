document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initMobileMenu();
    initWorksTabs();
    initVideoPlayers();
    initScrollAnimations();
    initSmoothScroll();
    initCountUp();
    initHeroBg();
});

function initHeroBg() {
    const host = document.getElementById('hero-bg-track');
    if (!host) return;

    const EYE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    const MSG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>';
    const fmt = n => Math.round(n).toLocaleString('ru-RU');

    const rows = [
        { w: '58%', dur: '44:37',   v: 1284000, c: 4120,  proc: false },
        { w: '46%', dur: '5:38',    v: 0,       c: 0,     proc: true  },
        { w: '68%', dur: '1:20:19', v: 842000,  c: 2730,  proc: false },
        { w: '52%', dur: '12:04',   v: 3160000, c: 9840,  proc: false },
        { w: '63%', dur: '1:07:19', v: 627000,  c: 1810,  proc: false },
        { w: '49%', dur: '8:51',    v: 2045000, c: 6390,  proc: false },
        { w: '61%', dur: '23:12',   v: 1490000, c: 5210,  proc: false },
        { w: '44%', dur: '3:47',    v: 398000,  c: 1240,  proc: false },
        { w: '66%', dur: '58:03',   v: 2760000, c: 8470,  proc: false },
        { w: '54%', dur: '16:39',   v: 913000,  c: 3050,  proc: false }
    ];

    const buildRow = r => {
        const el = document.createElement('div');
        el.className = 'hero__bg-row';
        el.innerHTML =
            '<div class="hero__bg-left"><div class="hero__bg-thumb"><span class="dur">' + r.dur + '</span></div>' +
            '<div class="hero__bg-bars"><div class="hero__bg-t" style="width:' + r.w + '"></div><div class="hero__bg-s"></div></div></div>' +
            '<div class="hero__bg-num" data-k="v">' + EYE + '<span>' + fmt(r.v) + '</span></div>' +
            '<div class="hero__bg-num" data-k="c">' + MSG + '<span>' + fmt(r.c) + '</span></div>';
        if (r.proc) {
            const p = document.createElement('div');
            p.className = 'hero__bg-proc';
            el.appendChild(p);
        }
        return el;
    };

    rows.forEach(r => { r._els = [buildRow(r)]; host.appendChild(r._els[0]); });
    rows.forEach(r => { const clone = buildRow(r); r._els.push(clone); host.appendChild(clone); });

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setInterval(() => {
        const r = rows[Math.floor(Math.random() * rows.length)];
        if (r.proc) return;
        r.v += Math.round(80 + Math.random() * 1400);
        if (Math.random() < 0.45) r.c += Math.round(1 + Math.random() * 6);
        r._els.forEach(el => {
            el.querySelector('[data-k=v] span').textContent = fmt(r.v);
            el.querySelector('[data-k=c] span').textContent = fmt(r.c);
            const bump = el.querySelector('[data-k=v]');
            bump.classList.remove('hero__bg-bump');
            void bump.offsetWidth;
            bump.classList.add('hero__bg-bump');
        });
    }, 650);
}

function initCountUp() {
    const els = document.querySelectorAll('.case__growth-to[data-count-to]');
    if (!els.length) return;

    const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');

    const animate = el => {
        const from = parseFloat(el.dataset.countFrom) || 0;
        const to = parseFloat(el.dataset.countTo) || 0;
        const gainEl = el.parentElement.querySelector('.case__growth-gain');
        const gain = gainEl ? (parseFloat(gainEl.dataset.gain) || 0) : 0;
        const duration = 1600;
        const start = performance.now();

        const block = el.closest('.case__growth');
        if (block) block.classList.add('in-view');

        const tick = now => {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
            el.textContent = fmt(from + (to - from) * eased);
            if (gainEl) gainEl.textContent = '+' + fmt(gain * eased);
            if (p < 1) requestAnimationFrame(tick);
            else { el.textContent = fmt(to); if (gainEl) gainEl.textContent = '+' + fmt(gain); }
        };
        requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animate(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    els.forEach(el => observer.observe(el));
}

function initWorksTabs() {
    const tabs = document.querySelectorAll('.works__tab');
    if (!tabs.length) return;

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active to clicked tab
            tab.classList.add('active');

            // Hide all grids
            document.querySelectorAll('.works__grid').forEach(grid => {
                grid.style.display = 'none';
                grid.classList.remove('active');
            });

            // Pause all videos when switching tabs
            document.querySelectorAll('.works__video-wrap video').forEach(v => {
                v.pause();
                v.muted = true;
                const overlay = v.closest('.works__video-wrap').querySelector('.works__play-overlay');
                if (overlay) overlay.classList.remove('hidden');
            });

            // Show target grid
            const targetId = tab.getAttribute('data-target');
            const targetGrid = document.getElementById(`${targetId}-works`);
            if (targetGrid) {
                targetGrid.style.display = '';
                // Trigger reflow for animation if needed
                void targetGrid.offsetWidth;
                targetGrid.classList.add('active');
            }
        });
    });
}

function initNav() {
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('nav--scrolled', window.scrollY > 50);
    }, { passive: true });
}

function initMobileMenu() {
    const burger = document.getElementById('nav-burger');
    const menu = document.getElementById('mobile-menu');
    burger.addEventListener('click', () => {
        burger.classList.toggle('active');
        menu.classList.toggle('active');
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    });
    menu.querySelectorAll('.mobile-menu__link').forEach(link => {
        link.addEventListener('click', () => {
            burger.classList.remove('active');
            menu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

function initVideoPlayers() {
    document.querySelectorAll('.works__video-wrap').forEach(wrap => {
        const video = wrap.querySelector('video');
        const overlay = wrap.querySelector('.works__play-overlay');
        if (!video || !overlay) return;

        // Click to play/unmute, click again to pause/mute
        wrap.addEventListener('click', () => {
            if (video.paused) {
                // Pause all other videos first
                document.querySelectorAll('.works__video-wrap video').forEach(v => {
                    if (v !== video) {
                        v.pause();
                        v.muted = true;
                        v.closest('.works__video-wrap').querySelector('.works__play-overlay').classList.remove('hidden');
                    }
                });
                video.muted = false;
                video.play();
                overlay.classList.add('hidden');
            } else {
                video.pause();
                video.muted = true;
                overlay.classList.remove('hidden');
            }
        });
    });
}

function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const anchorEl = target.querySelector('.section-label') || target;
                const offset = document.getElementById('nav').offsetHeight + 16;
                window.scrollTo({ top: anchorEl.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' });
            }
        });
    });
}
