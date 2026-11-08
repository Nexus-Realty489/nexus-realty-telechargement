(() => {
  const config = window.NEXUS_DOWNLOADS || {};
  document.querySelectorAll('[data-version]').forEach((el) => { el.textContent = config.version || '2.8.0'; });
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
    windows: 'Windows détecté : l’installateur .exe est le choix recommandé.',
    linux: 'Linux détecté : choisissez l’AppImage, ou le .deb sur Ubuntu / Debian.',
    mac: 'Vous êtes sur macOS : cette version n’est pas encore disponible pour votre ordinateur.',
    mobile: 'Vous êtes sur mobile : ouvrez cette page sur votre ordinateur Windows ou Linux pour installer l’application.',
    unknown: 'Votre système n’a pas été identifié. Choisissez Windows ou Linux ci-dessous.',
  };
  document.getElementById('detection').textContent = messages[os];
  const card = document.getElementById(`${os}-card`);
  if (card) { card.classList.add('is-recommended'); card.querySelector('.recommended').hidden = false; }
})();
