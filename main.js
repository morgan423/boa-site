/* ============================================================
   Bleu Océan Aquitaine — interactions vanilla
   - reveal au scroll (IntersectionObserver)
   - parallaxe légère de la rose des vents
   - soumission du formulaire Brevo (POST natif vers iframe cachée)
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Reveal au scroll ---------- */
  var reveals = document.querySelectorAll('[data-reveal]');
  function reveal(el) { el.classList.add('is-visible'); }

  if (reduce) {
    reveals.forEach(reveal);
  } else {
    try {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
      reveals.forEach(function (el) { io.observe(el); });
    } catch (err) {
      reveals.forEach(reveal);
    }
    // Filet de sécurité : ne jamais laisser un contenu caché si l'observer cale.
    setTimeout(function () { reveals.forEach(reveal); }, 2600);
  }

  /* ---------- Parallaxe rose des vents ---------- */
  var compass = document.querySelector('[data-compass]');
  if (compass && !reduce) {
    var ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        var y = (window.scrollY || 0) * 0.12;
        compass.style.setProperty('--py', y + 'px');
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------- Formulaire Brevo ---------- */
  var form = document.getElementById('signup-form');
  var formWrap = document.getElementById('form-wrap');
  var success = document.getElementById('success');
  var errorEl = document.getElementById('form-error');
  var button = form ? form.querySelector('button[type="submit"]') : null;
  var sink = document.getElementById('brevo-sink');
  var submitting = false;

  if (form && sink) {
    // Quand l'iframe cachée a fini de charger après un envoi, on bascule en succès.
    sink.addEventListener('load', function () {
      if (!submitting) return; // ignore le tout premier load (iframe vide)
      submitting = false;
      if (button) { button.removeAttribute('aria-busy'); button.disabled = false; }
      formWrap.classList.add('is-hidden');
      success.classList.remove('is-hidden');
      success.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    });

    form.addEventListener('submit', function () {
      // La validation HTML5 (required, type=email, case consentement) s'applique
      // avant cet événement. On passe juste l'UI en état "envoi".
      errorEl.textContent = '';
      submitting = true;
      if (button) { button.setAttribute('aria-busy', 'true'); button.disabled = true; }
      // Le POST natif part vers l'iframe cachée (target) — pas de CORS, pas de fetch.
      // Filet : si Brevo ne répond pas, on réactive le bouton.
      setTimeout(function () {
        if (submitting) {
          submitting = false;
          if (button) { button.removeAttribute('aria-busy'); button.disabled = false; }
          errorEl.textContent = "L'envoi a pris trop de temps. Vérifiez votre connexion et réessayez.";
        }
      }, 12000);
    });
  }
})();
