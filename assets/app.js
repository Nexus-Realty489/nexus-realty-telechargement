(() => {
  const config = window.NEXUS_DOWNLOADS || {};
  document.querySelectorAll('[data-version]').forEach((el) => { el.textContent = config.version || '2.10.0'; });
  document.querySelectorAll('[data-download]').forEach((link) => {
    const value = config[link.dataset.download];
    if (!value) return;
    try {
      const url = new URL(value, window.location.href);
      if (['http:', 'https:'].includes(url.protocol) || (window.location.protocol === 'file:' && url.protocol === 'file:')) link.href = url.href;
    } catch { /* lien par défaut conservé */ }
  });
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
  document.getElementById('detection').textContent = messages[os];
  const card = document.getElementById(`${os}-card`);
  if (card) { card.classList.add('is-recommended'); card.querySelector('.recommended').hidden = false; }

  const contactEmail = typeof config.contactEmail === 'string' && config.contactEmail.includes('@')
    ? config.contactEmail.trim()
    : 'Ayoubmeilleur9@gmail.com';

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

  const mailtoFor = (plan, period, method) => {
    const labels = { essentiel: 'Essentiel', pro: 'Pro', business: 'Business', mensuel: 'mensuel', annuel: 'annuel', carte: 'carte bancaire', paypal: 'PayPal', sepa: 'prélèvement bancaire' };
    const subject = `Nexus Realty — demande ${labels[plan] || plan} ${labels[period] || period} (${labels[method] || method})`;
    const body = `Bonjour,\n\nJe souhaite souscrire à la formule ${labels[plan] || plan} (${labels[period] || period}) par ${labels[method] || method}.\n\nMerci.`;
    return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  document.querySelectorAll('.price-grid article[data-plan]').forEach((article) => {
    const plan = article.dataset.plan;
    const amountEl = article.querySelector('[data-price-amount]');
    const unitEl = article.querySelector('[data-price-unit]');
    const altEl = article.querySelector('[data-price-alt]');
    const fallback = article.querySelector('.pay-fallback');
    const fallbackLink = article.querySelector('.pay-contact');
    const periodButtons = article.querySelectorAll('[data-period]');

    if (fallbackLink) fallbackLink.href = `mailto:${contactEmail}`;

    const selectedPeriod = () => {
      const pressed = article.querySelector('[data-period][aria-pressed="true"]');
      return pressed?.dataset.period || 'mensuel';
    };

    const render = () => {
      const period = selectedPeriod();
      if (amountEl) amountEl.textContent = article.dataset[`${period}Amount`] || amountEl.textContent;
      if (unitEl) unitEl.textContent = article.dataset[`${period}Unit`] || unitEl.textContent;
      if (altEl) altEl.textContent = article.dataset[`${period}Alt`] || altEl.textContent;

      const stripe = paymentLink(plan, period, 'stripe');
      const paypal = paymentLink(plan, period, 'paypal');
      let missing = false;

      article.querySelectorAll('.pay-btn[data-pay]').forEach((btn) => {
        const provider = btn.dataset.pay;
        const method = btn.dataset.method || provider;
        const url = provider === 'paypal' ? paypal : stripe;
        if (url) {
          btn.href = url;
          btn.target = '_blank';
          btn.rel = 'noopener noreferrer';
          btn.dataset.ready = 'true';
          btn.removeAttribute('aria-disabled');
        } else {
          missing = true;
          btn.href = mailtoFor(plan, period, method);
          btn.removeAttribute('target');
          btn.removeAttribute('rel');
          btn.dataset.ready = 'false';
        }
      });

      if (fallback) fallback.hidden = !missing;
    };

    periodButtons.forEach((button) => {
      button.addEventListener('click', () => {
        periodButtons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
        render();
      });
    });

    render();
  });
})();
