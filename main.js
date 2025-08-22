(() => {
  const targets = document.querySelectorAll('[data-animate]');

  // IntersectionObserver に未対応なら即座に表示
  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('active'));
    return;
  }

  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target); // 1回で観測終了
      }
    });
  }, { threshold: 0.1 });

  targets.forEach(el => io.observe(el));
})();

/* ==============================================
   KPI カウントアップ改良版
   ============================================== */
document.addEventListener('DOMContentLoaded', () => {
  const nums = document.querySelectorAll('.stat-number');
  if (!nums.length) return;

  nums.forEach(el => {
    const raw = parseFloat(el.textContent.replace(/[^0-9.]/g, ''));
    el.dataset.target = raw;      // 目標値保存
    el.textContent = '0';         // 初期化
  });

  const easeOut = t => 1 - Math.pow(1 - t, 3);   // cubic

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;

      const num   = e.target;
      const unit  = num.nextElementSibling?.classList.contains('unit') ? num.nextElementSibling : null;
      const total = parseFloat(num.dataset.target);
      let start   = null;

      const tick = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1000, 1);   // 1秒
        const val = easeOut(p) * total;
        num.textContent = Number.isInteger(total)
          ? Math.floor(val).toLocaleString()
          : (val).toFixed(1);
        if (p < 1) requestAnimationFrame(tick);
        else if (unit) unit.style.opacity = 1;
      };
      requestAnimationFrame(tick);
      io.unobserve(num);
    });
  }, {threshold: 0.45});

  nums.forEach(el => io.observe(el));
});

/* ===== Number cards count-up ========================= */
document.addEventListener('DOMContentLoaded', () => {
  const nums = document.querySelectorAll('.number-card .num'); // ←数値に付けたクラス名
  if (!nums.length) return;

  nums.forEach(el => {
    const tgt = parseFloat(el.textContent.replace(/[^0-9.]/g, ''));
    el.dataset.tgt = tgt;
    el.textContent = '0';
  });

  const ease = t => 1 - Math.pow(1 - t, 3);

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;

      const el  = e.target;
      const tot = parseFloat(el.dataset.tgt);
      let start = null;

      const tick = ts => {
        if (!start) start = ts;
        const p = Math.min((ts - start) / 1000, 1);
        const v = ease(p) * tot;
        el.textContent = Number.isInteger(tot)
          ? Math.floor(v).toLocaleString()
          : v.toFixed(1);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      io.unobserve(el);
    });
  }, {threshold: 0.4});

  nums.forEach(n => io.observe(n));
});

// シンプルな横スライド（各スライダー独立）
document.querySelectorAll('.venue-slider').forEach(slider => {
  const track = slider.querySelector('.slides');
  const slides = [...track.children];
  let i = 0;

  const go = (to) => {
    i = (to + slides.length) % slides.length;
    track.style.transform = `translateX(${-100 * i}%)`;
  };

  slider.querySelector('.prev').addEventListener('click', () => go(i - 1));
  slider.querySelector('.next').addEventListener('click', () => go(i + 1));

  // スワイプ対応（軽量）
  let sx = 0;
  track.addEventListener('touchstart', e => sx = e.touches[0].clientX, {passive:true});
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - sx;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
  });
});
