(() => {
  const config = window.NEXUS_DOWNLOADS || {};

  // --- Version, liens de téléchargement (config.js = source unique) ---
  document.querySelectorAll('[data-version]').forEach((el) => { el.textContent = config.version || '2.11.1'; });
  const safeHttpUrl = (value) => {
    try {
      const url = new URL(value, window.location.href);
      if (['http:', 'https:'].includes(url.protocol) || (window.location.protocol === 'file:' && url.protocol === 'file:')) return url.href;
    } catch { /* lien par défaut conservé */ }
    return '';
  };
  document.querySelectorAll('[data-download]').forEach((link) => {
    const value = config[link.dataset.download];
    if (!value) return;
    const href = safeHttpUrl(value);
    if (href) link.href = href;
  });
  document.querySelectorAll('[data-link]').forEach((link) => {
    const value = config[link.dataset.link];
    if (typeof value !== 'string' || !value) return;
    const href = safeHttpUrl(value);
    if (href) link.href = href;
  });

  // --- Taille réelle des fichiers et date réelle de publication (config.js) ---
  const formatSize = (bytes) => {
    const n = Number(bytes);
    if (!Number.isFinite(n) || n <= 0) return '';
    return `${(n / 1048576).toLocaleString('fr-FR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Mo`;
  };
  document.querySelectorAll('[data-size]').forEach((el) => {
    const text = formatSize(config.sizes?.[el.dataset.size]);
    if (text) el.textContent = text;
  });
  if (typeof config.publishedAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(config.publishedAt)) {
    const date = new Date(`${config.publishedAt}T12:00:00`);
    if (!Number.isNaN(date.getTime())) {
      const label = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
      document.querySelectorAll('[data-published]').forEach((el) => { el.textContent = label; el.setAttribute('datetime', config.publishedAt); });
    }
  }
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

  if (config.windowsKind === 'setup') {
    const replacements = {
      'win-card-description': 'Un installateur guidé, des raccourcis et votre application prête à s’ouvrir.',
      'win-meta': 'Windows 10 / 11 · x64 · installateur .exe',
      'win-step-1-title': 'Ouvrez le fichier .exe.',
      'win-step-1-text': 'L’assistant en français vous accueille. Choisissez le dossier si vous le souhaitez, puis installez.',
      'win-step-2-title': 'Lancez Nexus Realty.',
      'win-step-2-text': 'Cochez « Lancer Nexus Realty » à la fin, ou utilisez le raccourci du Bureau et du menu Démarrer.',
    };
    Object.entries(replacements).forEach(([id, text]) => { const el = document.getElementById(id); if (el) el.textContent = text; });
  }

  // --- Détection du système ---
  const ua = navigator.userAgent || '';
  const platform = navigator.userAgentData?.platform || navigator.platform || '';
  const mobile = navigator.userAgentData?.mobile || /Android|iPhone|iPad|iPod/i.test(ua) || (/Mac/i.test(platform) && navigator.maxTouchPoints > 1);
  const os = mobile ? 'mobile' : /Win/i.test(platform + ua) ? 'windows' : /Mac/i.test(platform + ua) ? 'mac' : /Linux/i.test(platform + ua) ? 'linux' : 'unknown';
  const messages = {
    windows: config.windowsKind === 'setup' ? 'Windows détecté : l’installateur .exe est le choix recommandé.' : 'Windows détecté : le fichier .exe portable est le choix recommandé (non signé, SmartScreen affichera un avertissement).',
    linux: 'Linux détecté : choisissez l’AppImage, ou le .deb sur Ubuntu / Debian.',
    mac: 'Vous êtes sur macOS : cette version n’est pas encore disponible pour votre ordinateur.',
    mobile: 'Vous êtes sur mobile : ouvrez cette page sur votre ordinateur Windows ou Linux pour installer l’application.',
    unknown: 'Votre système n’a pas été identifié. Choisissez Windows ou Linux ci-dessous.',
  };
  const detection = document.getElementById('detection');
  if (detection) detection.textContent = messages[os];
  const card = document.getElementById(`${os}-card`);
  if (card) { card.classList.add('is-recommended'); card.querySelector('.recommended').hidden = false; }

  // --- Tarifs et paiement ---
  const contactEmail = typeof config.contactEmail === 'string' && config.contactEmail.includes('@')
    ? config.contactEmail.trim()
    : 'Ayoubmeilleur9@gmail.com';

  // Offre de lancement : affichée jusqu’à la date de fin incluse (config.offreLancementFin).
  const launchActive = (() => {
    const end = typeof config.offreLancementFin === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(config.offreLancementFin)
      ? new Date(`${config.offreLancementFin}T23:59:59`) : null;
    return !!end && !Number.isNaN(end.getTime()) && Date.now() <= end.getTime();
  })();
  if (!launchActive) document.querySelectorAll('[data-launch-text]').forEach((el) => { el.hidden = true; });

  const publicPaymentUrl = (value) => {
    if (typeof value !== 'string') return '';
    const trimmed = value.trim();
    if (!trimmed) return '';
    try {
      const url = new URL(trimmed);
      return (url.protocol === 'https:' || url.protocol === 'http:') ? url.href : '';
    } catch {
      return '';
    }
  };

  const paymentLink = (plan, period, provider) => {
    const value = config.paiements?.[plan]?.[period]?.[provider];
    return publicPaymentUrl(value);
  };

  const labels = { essentiel: 'Essentiel', pro: 'Pro', business: 'Business', mensuel: 'mensuel', annuel: 'annuel', carte: 'carte bancaire', paypal: 'PayPal', sepa: 'prélèvement bancaire' };
  const mailtoFor = (plan, period, method) => {
    const subject = `Nexus Realty — demande ${labels[plan] || plan} ${labels[period] || period} (${labels[method] || method})`;
    const body = `Bonjour,\n\nJe souhaite souscrire à la formule ${labels[plan] || plan} (${labels[period] || period}) par ${labels[method] || method}.\n\nNom de l’agence :\nTéléphone :\n\nMerci.`;
    return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  document.querySelectorAll('.pay-contact').forEach((a) => { a.href = `mailto:${contactEmail}`; });

  const periodButtons = document.querySelectorAll('.pricing [data-period]');
  const selectedPeriod = () => {
    const pressed = document.querySelector('.pricing [data-period][aria-pressed="true"]');
    return pressed?.dataset.period || 'mensuel';
  };

  const articles = document.querySelectorAll('.price-grid article[data-plan]');
  const renderPrices = () => {
    const period = selectedPeriod();
    articles.forEach((article) => {
      const amountEl = article.querySelector('[data-price-amount]');
      const unitEl = article.querySelector('[data-price-unit]');
      const altEl = article.querySelector('[data-price-alt]');
      const launchLine = article.querySelector('[data-launch-line]');
      if (amountEl) amountEl.textContent = article.dataset[`${period}Amount`] || amountEl.textContent;
      if (unitEl) unitEl.textContent = article.dataset[`${period}Unit`] || unitEl.textContent;
      if (altEl) altEl.textContent = article.dataset[`${period}Alt`] || altEl.textContent;
      if (launchLine) launchLine.hidden = !(period === 'annuel' && launchActive && article.dataset.annuelLaunch);
    });
  };
  periodButtons.forEach((button) => {
    button.addEventListener('click', () => {
      periodButtons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
      renderPrices();
    });
  });
  renderPrices();

  // Étape 2 : moyens de paiement, affichés après le choix d’une formule.
  const dialog = document.getElementById('paiement');
  const fallback = dialog?.querySelector('.pay-fallback');
  const secureText = dialog?.querySelector('[data-secure-text]');

  const renderPayment = (plan, period) => {
    if (!dialog) return;
    const article = document.querySelector(`.price-grid article[data-plan="${plan}"]`);
    const set = (sel, text) => { const el = dialog.querySelector(sel); if (el) el.textContent = text; };
    set('[data-pay-plan]', labels[plan] || plan);
    set('[data-pay-amount]', article?.dataset[`${period}Amount`] || '');
    set('[data-pay-unit]', article?.dataset[`${period}Unit`] || '');
    set('[data-pay-period]', period === 'annuel' ? 'annuel, 2 mois offerts' : 'mensuel, sans engagement');
    const launchEl = dialog.querySelector('[data-pay-launch]');
    if (launchEl) {
      const show = period === 'annuel' && launchActive && article?.dataset.annuelLaunch;
      launchEl.hidden = !show;
      if (show) launchEl.textContent = `Offre de lancement : ${article.dataset.annuelLaunch} HT la première année (−20 %).`;
    }

    const stripe = paymentLink(plan, period, 'stripe');
    const paypal = paymentLink(plan, period, 'paypal');
    let missing = false;
    let ready = false;
    dialog.querySelectorAll('.pay-btn[data-pay]').forEach((btn) => {
      const provider = btn.dataset.pay;
      const method = btn.dataset.method || provider;
      const url = provider === 'paypal' ? paypal : stripe;
      const state = btn.querySelector('[data-pay-state]');
      if (url) {
        ready = true;
        btn.href = url;
        btn.target = '_blank';
        btn.rel = 'noopener noreferrer';
        btn.dataset.ready = 'true';
        btn.removeAttribute('aria-disabled');
        if (state) state.textContent = provider === 'paypal' ? 'Page sécurisée PayPal' : 'Page sécurisée Stripe';
      } else {
        missing = true;
        btn.href = mailtoFor(plan, period, method);
        btn.removeAttribute('target');
        btn.removeAttribute('rel');
        btn.dataset.ready = 'false';
        if (state) state.textContent = 'Demande par e-mail';
      }
    });
    if (fallback) fallback.hidden = !missing;
    if (secureText) {
      secureText.textContent = ready
        ? 'Le paiement se fait sur la page sécurisée de Stripe ou de PayPal. Ce site ne collecte et ne stocke aucune donnée bancaire.'
        : 'Ce site ne collecte et ne stocke aucune donnée bancaire.';
    }
  };

  document.querySelectorAll('[data-choose]').forEach((btn) => {
    const plan = btn.closest('article[data-plan]')?.dataset.plan;
    if (!plan) return;
    // Sans JavaScript ou sans <dialog>, le lien e-mail d’origine reste actif.
    btn.href = mailtoFor(plan, 'mensuel', 'carte');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    btn.href = '#paiement';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      renderPayment(plan, selectedPeriod());
      dialog.showModal();
    });
  });
  if (dialog) {
    dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
    dialog.querySelectorAll('[data-close-dialog]').forEach((a) => a.addEventListener('click', () => dialog.close()));
  }
})();
