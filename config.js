/* Modifiez UNIQUEMENT cet objet pour changer les liens, la version et les paiements.
   Liens relatifs : site et fichiers hébergés ensemble.
   Ou URLs HTTPS vers les fichiers d’une release GitHub (pas vers la page de la release).
   Paiements : uniquement des liens publics Stripe (carte + prélèvement SEPA) et PayPal.
   Jamais de clé secrète (sk_live, secret PayPal, etc.). Laissez les champs vides tant que
   les comptes ne sont pas ouverts : le site affichera alors le message de contact. */
window.NEXUS_DOWNLOADS = Object.freeze({
  version: '2.11.1',
  windows: 'https://github.com/Nexus-Realty489/nexus-realty-telechargement/releases/download/v2.11.1/NexusRealty-Portable-2.11.1.exe',
  windowsKind: 'portable', // 'setup' lorsque l’installateur NSIS est validé
  windowsSetup: 'https://github.com/Nexus-Realty489/nexus-realty-telechargement/releases/download/v2.11.1/NexusRealty-Setup-2.11.1.exe',
  appimage: 'https://github.com/Nexus-Realty489/nexus-realty-telechargement/releases/download/v2.11.1/NexusRealty-2.11.1-x86_64.AppImage',
  deb: 'https://github.com/Nexus-Realty489/nexus-realty-telechargement/releases/download/v2.11.1/nexus-realty-2.11.1-amd64.deb',
  checksums: 'https://github.com/Nexus-Realty489/nexus-realty-telechargement/releases/download/v2.11.1/SHA256SUMS.txt',
  contactEmail: 'Ayoubmeilleur9@gmail.com',
  paiements: {
    essentiel: {
      mensuel: { stripe: '', paypal: '' },
      annuel: { stripe: '', paypal: '' },
    },
    pro: {
      mensuel: { stripe: '', paypal: '' },
      annuel: { stripe: '', paypal: '' },
    },
    business: {
      mensuel: { stripe: '', paypal: '' },
      annuel: { stripe: '', paypal: '' },
    },
  },
});
