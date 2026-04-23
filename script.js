/* ═══════════════════════════════════════════════════
   Ala'a's Sweet & Pastry — script.js
   ═══════════════════════════════════════════════════ */

// ── HERO SLIDER ────────────────────────────────────────────────────────────────
(function initHero() {
  const slides   = document.querySelectorAll('.hero-slide');
  const dots     = document.querySelectorAll('.hero-dot');
  let current    = 0;
  let timer;

  function goTo(n) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (n + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAuto() {
    clearInterval(timer);
    timer = setInterval(next, 4500);
  }

  document.querySelector('.hero-next').addEventListener('click', () => { next(); startAuto(); });
  document.querySelector('.hero-prev').addEventListener('click', () => { prev(); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { goTo(i); startAuto(); }));

  goTo(0);
  startAuto();
})();

// ── PRODUCT FILTER ─────────────────────────────────────────────────────────────
(function initFilter() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.product-card');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      cards.forEach(card => {
        const matchCat = filter === 'all' || card.dataset.cat === filter;
        const matchSub = filter === 'all' || card.dataset.sub === filter || card.dataset.cat === filter;
        card.classList.toggle('hidden', !(filter === 'all' || card.dataset.cat === filter || card.dataset.sub === filter));
      });
    });
  });
})();

// ── MENU TICKER CLICK → FILTER ────────────────────────────────────────────────
document.querySelectorAll('.menu-word').forEach(word => {
  word.addEventListener('click', () => {
    if (word.dataset.special) {
      document.getElementById('special-order').scrollIntoView({ behavior: 'smooth' });
      return;
    }
    const sub = word.dataset.sub;
    const cat = word.dataset.cat;
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => {
      document.querySelectorAll('.product-card').forEach(card => {
        card.classList.toggle('hidden', !(card.dataset.cat === cat || card.dataset.sub === sub));
      });
    }, 400);
  });
});

// ── PRODUCT DETAIL POPUP ───────────────────────────────────────────────────────
const detailBackdrop = document.getElementById('detail-popup');
const cartBackdrop   = document.getElementById('cart-popup');

function openProduct(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;

  // Populate left side
  document.getElementById('popup-cat').textContent   = p.cat === 'cakes' ? '🎂 Cakes' : '🍪 Cookies & Pastries';
  document.getElementById('popup-name').textContent  = p.name;
  document.getElementById('popup-price').textContent = p.price;

  const detRows = document.getElementById('popup-detail-rows');
  detRows.innerHTML = '';
  if (p.size && p.size !== '—') {
    detRows.innerHTML += `<div class="popup-detail-row"><span class="label">Size</span><span class="value">${p.size}</span></div>`;
  }
  detRows.innerHTML += `<div class="popup-detail-row"><span class="label">Portion</span><span class="value">${p.portion}</span></div>`;

  const allergenWrap = document.getElementById('popup-allergens');
  allergenWrap.innerHTML = '';
  p.allergens.split(',').forEach(a => {
    const b = document.createElement('span');
    b.className = 'popup-allergen-badge';
    b.textContent = a.trim();
    allergenWrap.appendChild(b);
  });

  // Set Add to Cart button
  document.getElementById('popup-add-btn').onclick = () => openCart(id);

  // Populate right side image slider
  const mainImg   = document.getElementById('popup-main-img');
  const thumbWrap = document.getElementById('popup-thumbs');
  thumbWrap.innerHTML = '';

  const imgs = p.detailImgs || [p.mainImg];
  mainImg.src = imgs[0] || '';

  imgs.forEach((src, i) => {
    const div = document.createElement('div');
    div.className = 'popup-thumb' + (i === 0 ? ' active' : '');
    div.innerHTML = `<img src="${src}" alt="">`;
    div.addEventListener('click', () => {
      mainImg.src = src;
      thumbWrap.querySelectorAll('.popup-thumb').forEach(t => t.classList.remove('active'));
      div.classList.add('active');
    });
    thumbWrap.appendChild(div);
  });

  detailBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetail() {
  detailBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

detailBackdrop.addEventListener('click', e => { if (e.target === detailBackdrop) closeDetail(); });
document.getElementById('detail-close').addEventListener('click', closeDetail);

// ── CART / ALTERNATION POPUP ───────────────────────────────────────────────────
function openCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  if (!p) return;
  closeDetail();

  document.getElementById('cart-name').textContent  = p.name;
  document.getElementById('cart-price').textContent = p.price;
  document.getElementById('cart-img').src           = p.mainImg || '';

  // Reset alternation form
  document.getElementById('alt-name-input').value = '';
  document.getElementById('alt-taste-input') && (document.getElementById('alt-taste-input').value = '');
  document.getElementById('alt-look-input')  && (document.getElementById('alt-look-input').value  = '');
  document.getElementById('alt-product-name').value = p.name;
  document.getElementById('alt-success').style.display = 'none';
  const altForm = document.getElementById('alt-form');
  if (altForm) altForm.style.display = 'block';

  cartBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

cartBackdrop.addEventListener('click', e => { if (e.target === cartBackdrop) closeCart(); });
document.getElementById('cart-close').addEventListener('click', closeCart);

// alt form always visible

// ── ALTERNATION FORM SUBMIT (EmailJS) ─────────────────────────────────────────
document.getElementById('alt-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('button[type="submit"]');
  btn.textContent = 'Sending…'; btn.disabled = true;

  const tasteEl = document.getElementById('alt-taste-input');
  const lookEl  = document.getElementById('alt-look-input');
  emailjs.send("service_cr14gir", "template_dlmqm35", {
    from_name:    document.getElementById('alt-name-input').value,
    product_name: document.getElementById('alt-product-name').value,
    message:      'Taste/Ingredients: ' + (tasteEl ? tasteEl.value : '') + '\n\nLook/Design: ' + (lookEl ? lookEl.value : ''),
    to_email:     "lamarhazeem2000@gmail.com"
  }).then(() => {
    document.getElementById('alt-success').style.display = 'block';
    document.getElementById('alt-form').style.display    = 'none';
    btn.textContent = 'Send Alteration ✨'; btn.disabled = false;
  }).catch(err => {
    alert('Something went wrong. Please try again.');
    btn.textContent = 'Send Alteration ✨'; btn.disabled = false;
    console.error(err);
  });
});

// ── SPECIAL ORDER POPUP ────────────────────────────────────────────────────────
const specialBackdrop = document.getElementById('special-popup');

document.getElementById('open-special-btn').addEventListener('click', () => {
  specialBackdrop.classList.add('open');
  document.body.style.overflow = 'hidden';
});

function closeSpecial() {
  specialBackdrop.classList.remove('open');
  document.body.style.overflow = '';
}

specialBackdrop.addEventListener('click', e => { if (e.target === specialBackdrop) closeSpecial(); });
document.getElementById('special-close').addEventListener('click', closeSpecial);

// ── SPECIAL ORDER FORM SUBMIT (EmailJS) ────────────────────────────────────────
document.getElementById('special-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('.form-submit-btn');
  btn.textContent = 'Sending…'; btn.disabled = true;

  const fileToBase64 = file => new Promise(res => {
    if (!file) return res('');
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.readAsDataURL(file);
  });

  const inspo = document.getElementById('s-inspo').files[0];
  const draw  = document.getElementById('s-draw').files[0];

  Promise.all([fileToBase64(inspo), fileToBase64(draw)]).then(([inspoB64, drawB64]) => {
    emailjs.send("service_cr14gir", "template_dlmqm35", {
      from_name:   document.getElementById('s-name').value,
      from_email:  document.getElementById('s-email').value,
      message:     document.getElementById('s-notes').value,
      to_email:    "lamarhazeem2000@gmail.com",
      subject:     "Special Order Request — Ala'a's Sweet & Pastry"
    }).then(() => {
      document.getElementById('special-success').style.display = 'block';
      document.getElementById('special-form').style.display    = 'none';
      btn.textContent = 'Send Order'; btn.disabled = false;
    }).catch(err => {
      alert('Something went wrong. Please try again.');
      btn.textContent = 'Send Order'; btn.disabled = false;
      console.error(err);
    });
  });
});

// ── SMOOTH SCROLL FOR NAV LINKS ────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});
