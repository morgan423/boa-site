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

  /* ---------- Formulaire Brevo ----------
     L'endpoint Brevo (/v2/serve) attend du multipart/form-data et répond en JSON
     { success, message }. On soumet donc via fetch + FormData (et non en POST natif,
     qui enverrait de l'urlencoded → rejeté). CORS autorisé pour le domaine. */
  var form = document.getElementById('signup-form');
  var formWrap = document.getElementById('form-wrap');
  var success = document.getElementById('success');
  var errorEl = document.getElementById('form-error');
  var button = form ? form.querySelector('button[type="submit"]') : null;

  function setBusy(on) {
    if (!button) return;
    if (on) { button.setAttribute('aria-busy', 'true'); button.disabled = true; }
    else { button.removeAttribute('aria-busy'); button.disabled = false; }
  }
  function showSuccess() {
    formWrap.classList.add('is-hidden');
    success.classList.remove('is-hidden');
    success.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  }

  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      // La validation HTML5 (required, type=email, consentement) a déjà filtré
      // les soumissions invalides avant cet événement.
      errorEl.textContent = '';

      // Honeypot : si rempli, c'est un bot — on simule un succès sans rien envoyer.
      var hp = form.querySelector('input[name="email_address_check"]');
      if (hp && hp.value) { showSuccess(); return; }

      // On n'envoie à Brevo que les champs qu'il attend (pas la case "consent").
      var data = new FormData();
      data.append('EMAIL', form.elements['EMAIL'].value.trim());
      data.append('NOM', form.elements['NOM'].value.trim());
      data.append('email_address_check', '');
      data.append('locale', 'fr');

      setBusy(true);

      fetch(form.action, { method: 'POST', body: data, mode: 'cors' })
        .then(function (r) { return r.json().catch(function () { return { success: r.ok }; }); })
        .then(function (res) {
          if (res && res.success) {
            showSuccess();
          } else {
            setBusy(false);
            errorEl.textContent = (res && res.message)
              ? res.message
              : "Une erreur est survenue. Merci de réessayer dans un instant.";
          }
        })
        .catch(function () {
          setBusy(false);
          errorEl.textContent = "Connexion impossible. Vérifiez votre réseau et réessayez.";
        });
    });
  }
})();
