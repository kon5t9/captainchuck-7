/* West Coast Captain — THE OPERATOR (CaptainChuck-7)
   Progressive enhancement only. All content lives in the HTML. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── reveal on scroll (IO + scroll fallback so nothing can be missed) ── */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('revealed'); });
    revealEls = [];
  } else {
    var pending = revealEls.slice();
    var sweep = function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for (var i = pending.length - 1; i >= 0; i--) {
        var r = pending[i].getBoundingClientRect();
        if (r.top < vh * 0.92 && r.bottom > 0) {
          pending[i].classList.add('revealed');
          pending.splice(i, 1);
        }
      }
    };
    var sweeping = false;
    window.addEventListener('scroll', function () {
      sweep();
      if (!sweeping && pending.length) {
        sweeping = true;
        setTimeout(function () { sweeping = false; if (pending.length) sweep(); }, 120);
      }
    }, { passive: true });
    sweep();
  }

  /* ── masthead background on scroll ── */
  var mast = document.querySelector('.masthead');
  var mastTick = false;
  function mastState() {
    mast.classList.toggle('scrolled', window.scrollY > 40);
    mastTick = false;
  }
  window.addEventListener('scroll', function () {
    if (!mastTick) { mastTick = true; requestAnimationFrame(mastState); }
  }, { passive: true });
  mastState();

  /* ── chapter rail lights when its chapter is on screen ── */
  if ('IntersectionObserver' in window) {
    var rails = document.querySelectorAll('.chapter .rail-sticky');
    var chapterIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var rail = e.target.querySelector('.rail-sticky');
        if (rail) rail.classList.toggle('lit', e.isIntersecting && e.intersectionRatio > 0.25);
      });
    }, { threshold: [0, 0.25, 0.6] });
    document.querySelectorAll('.chapter').forEach(function (ch) { chapterIO.observe(ch); });
    void rails;
  }

  /* ── scroll-spy nav ── */
  var links = Array.prototype.slice.call(document.querySelectorAll('.mast-nav a[href^="#"]'));
  var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
  if ('IntersectionObserver' in window && targets.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        links.forEach(function (a) {
          a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
        });
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    targets.forEach(function (t) { spy.observe(t); });
  }

  /* ── mobile nav ── */
  var toggle = document.querySelector('.nav-toggle');
  var navList = document.getElementById('site-nav');
  if (toggle && navList) {
    toggle.addEventListener('click', function () {
      var open = navList.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    navList.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        navList.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── contact form: progressive enhancement over contact.php ── */
  var form = document.querySelector('.contact-form');
  var status = form && form.querySelector('.form-status');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      if (typeof FormData === 'undefined' || !window.fetch) return; /* let native POST happen */
      e.preventDefault();
      status.textContent = 'Sending…';
      fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'text/plain' } })
        .then(function (r) { return r.text().then(function (t) { return { ok: r.ok, t: t }; }); })
        .then(function (res) {
          var msg = res.t.replace(/<[^>]*>/g, '').trim();
          status.textContent = msg || (res.ok ? 'Sent. The bridge will call you back today.' : 'The message could not be sent. Please call +1 714 625-2980.');
          if (res.ok) form.reset();
        })
        .catch(function () {
          status.textContent = 'The message could not be sent. Please call +1 714 625-2980 or email chuck@westcoastcaptain.com.';
        });
    });
  }

  /* ── smooth anchor offset for fixed masthead ── */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (id.length < 2) return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      var y = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });
})();
