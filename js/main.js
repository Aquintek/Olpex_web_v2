(function () {
  'use strict';

  var desktop = window.matchMedia('(min-width: 900px)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Menú móvil ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('menu');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });

  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) {
      setMenu(false);
      toggle.focus();
    }
  });

  /* ---------- Menú: marcar la sección visible ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-nav ul a'));
  var sections = navLinks.map(function (a) {
    return document.querySelector(a.getAttribute('href'));
  });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = '#' + entry.target.id;
        navLinks.forEach(function (a) {
          if (a.getAttribute('href') === id) a.setAttribute('aria-current', 'true');
          else a.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { if (s) observer.observe(s); });
  }

  /* ---------- Servicios: índice-detalle (escritorio) / acordeón (móvil) ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.svc-tab'));

  function openPanel(tab) {
    tabs.forEach(function (t) {
      var isTarget = t === tab;
      t.setAttribute('aria-expanded', String(isTarget));
      document.getElementById(t.getAttribute('aria-controls')).hidden = !isTarget;
    });
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () {
      var isOpen = tab.getAttribute('aria-expanded') === 'true';
      // En móvil se puede cerrar el área abierta; en escritorio siempre queda una visible
      if (isOpen && !desktop.matches) {
        tab.setAttribute('aria-expanded', 'false');
        document.getElementById(tab.getAttribute('aria-controls')).hidden = true;
        return;
      }
      openPanel(tab);
    });

    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      e.preventDefault();
      next.focus();
      if (desktop.matches) openPanel(next);
    });
  });

  // Al pasar a escritorio, asegurar que haya un área abierta
  desktop.addEventListener('change', function (e) {
    if (e.matches && !tabs.some(function (t) { return t.getAttribute('aria-expanded') === 'true'; })) {
      openPanel(tabs[0]);
    }
  });

  // Los nodos del inicio abren el área correspondiente
  function goToService(panelId) {
    var tab = tabs.filter(function (t) { return t.getAttribute('aria-controls') === panelId; })[0];
    if (!tab) return false;
    openPanel(tab);
    var target = desktop.matches ? document.getElementById('servicios') : tab;
    target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
    tab.focus({ preventScroll: true });
    try { history.replaceState(null, '', '#' + panelId); } catch (err) { /* sin historial */ }
    return true;
  }

  document.querySelectorAll('a[href^="#servicio-"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      goToService(link.getAttribute('href').slice(1));
    });
  });

  if (location.hash.indexOf('#servicio-') === 0) goToService(location.hash.slice(1));

  /* ---------- Formulario de contacto ---------- */
  var form = document.querySelector('.contact-form');
  var statusEl = form.querySelector('.form-status');
  var submitBtn = form.querySelector('button[type="submit"]');

  var messages = {
    nombre: 'Escriba su nombre.',
    correo: 'Escriba un correo válido, por ejemplo nombre@empresa.com.',
    mensaje: 'Cuéntenos brevemente qué necesita.'
  };

  function validateField(input) {
    var errorEl = document.getElementById('e-' + input.name);
    if (!errorEl) return true;
    var valid = input.checkValidity() && input.value.trim() !== '';
    input.setAttribute('aria-invalid', String(!valid));
    if (valid) input.removeAttribute('aria-describedby');
    else input.setAttribute('aria-describedby', errorEl.id);
    errorEl.textContent = valid ? '' : messages[input.name];
    return valid;
  }

  form.querySelectorAll('[required]').forEach(function (input) {
    input.addEventListener('blur', function () { if (input.value) validateField(input); });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') validateField(input);
    });
  });

  function setStatus(text, kind) {
    statusEl.textContent = text;
    statusEl.className = 'form-status' + (kind ? ' is-' + kind : '');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var required = Array.prototype.slice.call(form.querySelectorAll('[required]'));
    var firstInvalid = null;
    required.forEach(function (input) {
      if (!validateField(input) && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      firstInvalid.focus();
      setStatus('Revise los campos marcados.', 'error');
      return;
    }

    submitBtn.disabled = true;
    setStatus('Enviando…');

    fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        setStatus('Mensaje enviado. Le contactaremos pronto.', 'ok');
      })
      .catch(function () {
        setStatus('No se pudo enviar el mensaje. Escríbanos a asesortecnico1@olpex.net o por WhatsApp.', 'error');
      })
      .then(function () {
        submitBtn.disabled = false;
      });
  });

  /* ---------- Clientes: tira en bucle ---------- */
  var marquee = document.querySelector('.marquee');
  var marqueeToggle = document.querySelector('.marquee-toggle');

  if (marquee && !reducedMotion.matches) {
    var track = marquee.querySelector('.marquee-track');
    // Segunda copia de la lista para que el bucle no tenga cortes; oculta a lectores de pantalla
    Array.prototype.slice.call(track.children).forEach(function (li) {
      var clone = li.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      clone.querySelectorAll('img').forEach(function (img) { img.alt = ''; });
      track.appendChild(clone);
    });
    // Velocidad constante sin importar cuántos logos haya (≈ 45 px por segundo)
    marquee.style.setProperty('--marquee-duration', Math.round(track.scrollWidth / 2 / 45) + 's');
    marquee.classList.add('is-running');

    marqueeToggle.hidden = false;
    marqueeToggle.addEventListener('click', function () {
      var paused = marquee.classList.toggle('is-paused');
      marqueeToggle.setAttribute('aria-pressed', String(paused));
      marqueeToggle.textContent = paused ? 'Reanudar' : 'Pausar';
    });
  }

  /* ---------- Año del pie ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
