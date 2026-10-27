(function () {
  'use strict';

  var desktop = window.matchMedia('(min-width: 900px)');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Diagrama del inicio: encuadre según el ancho ---------- */
  // En móvil se amplía el área visible a la derecha para que quepan las etiquetas más grandes
  var diagram = document.querySelector('.hero-diagram');

  function fitDiagram() {
    if (diagram) diagram.setAttribute('viewBox', desktop.matches ? '0 0 800 560' : '16 34 950 500');
  }
  fitDiagram();
  desktop.addEventListener('change', fitDiagram);

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
  var svc = document.querySelector('[data-svc]');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.svc-tab'));

  // Fondo y nodo amarillo que se desplazan por la traza hasta la pestaña activa (solo escritorio)
  var indicators = ['bg', 'dot'].map(function (part) {
    var el = document.createElement('span');
    el.className = 'svc-indicator svc-indicator-' + part;
    el.setAttribute('aria-hidden', 'true');
    svc.appendChild(el);
    return el;
  });
  // Sin transición al tomar el control: el nodo de la pestaña inicial no debe animarse al cargar
  svc.classList.add('is-instant', 'has-indicator');

  function activeTab() {
    return tabs.filter(function (t) { return t.getAttribute('aria-expanded') === 'true'; })[0];
  }

  // Se asigna transform y tamaño directamente al indicador para no recalcular toda la sección
  function placeIndicator(animate) {
    var tab = activeTab();
    if (!tab || !desktop.matches) return;
    if (!animate) svc.classList.add('is-instant');
    indicators.forEach(function (el) {
      el.style.width = tab.offsetWidth + 'px';
      el.style.height = tab.offsetHeight + 'px';
      el.style.transform = 'translateY(' + tab.offsetTop + 'px)';
    });
    if (!animate) {
      void svc.offsetWidth; // aplica la posición antes de reactivar la transición
      svc.classList.remove('is-instant');
    }
  }

  function openPanel(tab) {
    var from = tabs.indexOf(activeTab());
    // El contenido entra desde el lado hacia el que se movió la selección
    svc.setAttribute('data-dir', from > tabs.indexOf(tab) ? 'up' : 'down');
    tabs.forEach(function (t) {
      var isTarget = t === tab;
      t.setAttribute('aria-expanded', String(isTarget));
      document.getElementById(t.getAttribute('aria-controls')).hidden = !isTarget;
    });
    placeIndicator(true);
  }

  placeIndicator(false);
  // Se observan las pestañas y no la sección: su alto cambia con cada área y cortaría el desplazamiento
  if ('ResizeObserver' in window) {
    var tabsObserver = new ResizeObserver(function () { placeIndicator(false); });
    tabs.forEach(function (t) { tabsObserver.observe(t); });
  }
  if (document.fonts) document.fonts.ready.then(function () { placeIndicator(false); });

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function (e) {
      // Con teclado (Enter/Espacio llegan con detail 0) el cambio es inmediato
      svc.setAttribute('data-input', e.detail === 0 ? 'key' : 'pointer');
      var isOpen = tab.getAttribute('aria-expanded') === 'true';
      // En móvil se puede cerrar el área abierta; en escritorio siempre queda una visible
      if (isOpen && !desktop.matches) {
        tab.setAttribute('aria-expanded', 'false');
        document.getElementById(tab.getAttribute('aria-controls')).hidden = true;
        return;
      }
      openPanel(tab);
      // En móvil, al cerrarse un área de arriba la pestaña sube; se mantiene a la vista
      if (!desktop.matches && tab.getBoundingClientRect().top < document.querySelector('.site-header').offsetHeight) {
        tab.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
      }
    });

    tab.addEventListener('keydown', function (e) {
      var next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      e.preventDefault();
      svc.setAttribute('data-input', 'key');
      next.focus();
      if (desktop.matches) openPanel(next);
    });
  });

  // Al pasar a escritorio, asegurar que haya un área abierta
  desktop.addEventListener('change', function (e) {
    if (e.matches && !activeTab()) openPanel(tabs[0]);
    placeIndicator(false);
  });

  // Los nodos del inicio abren el área correspondiente
  function goToService(panelId) {
    var tab = tabs.filter(function (t) { return t.getAttribute('aria-controls') === panelId; })[0];
    if (!tab) return false;
    svc.setAttribute('data-input', 'pointer');
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
  }

  /* ---------- Mapa de cobertura: las trazas se dibujan al llegar a la sección ---------- */
  var coverage = document.querySelector('.coverage');

  if (coverage) {
    if ('IntersectionObserver' in window) {
      var mapObserver = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        coverage.classList.add('is-drawn');
        mapObserver.disconnect();
      }, { threshold: 0.35 });
      mapObserver.observe(coverage);
    } else {
      coverage.classList.add('is-drawn');
    }
  }

  /* ---------- Año del pie ---------- */
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
