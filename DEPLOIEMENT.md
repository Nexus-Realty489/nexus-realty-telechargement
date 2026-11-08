# Mettre le téléchargement en ligne

Cette page est prête, mais **elle n’est pas encore publiée**. Aucune inscription, aucun suivi publicitaire et aucun faux témoignage n’ont été ajoutés. L’aperçu de l’interface est une illustration identifiée comme telle.

## État de la version Windows

Le téléchargement Windows pointe actuellement vers le **.exe portable**, qui n’a pas besoin de programme d’installation : ouvrir le fichier, attendre la préparation, cliquer sur Commencer. Les données restent dans `%APPDATA%/nexus-realty`, pas dans le dossier temporaire de l’exécutable.

La configuration NSIS en français est prête dans les sources, mais la génération de l’installateur `NexusRealty-Setup-2.8.0.exe` a échoué sur la machine de fabrication (Wine ne démarre pas). **Ne distribuez pas un petit fichier Setup partiel.** Pour le fabriquer sur un vrai PC Windows : `npm --prefix desktop run dist:win`, puis le tester. Une fois validé, mettez `windowsKind: 'setup'` et remplacez `windows` par le lien `windowsSetup` dans `config.js`. Les étapes affichées seront alors adaptées à l’installateur.

## 1. Le plus simple sur le futur VPS : site + fichiers ensemble

Copier le contenu de `nexus-download-site/` dans `/var/www/nexus-download/` sur le VPS, **y compris `downloads/`** avec :

- `NexusRealty-Portable-2.8.0.exe`
- `NexusRealty-2.8.0-x86_64.AppImage`
- `nexus-realty-2.8.0-amd64.deb`
- `SHA256SUMS.txt`

Le zip du site est volontairement léger : il ne contient **pas** les trois installateurs. Les récupérer séparément dans `nexus-desktop/` et les placer dans `downloads/`. Garder les noms exactement identiques.

Créer par exemple un sous-domaine `telecharger.VOTRE-DOMAINE.fr` (enregistrement DNS A vers le VPS). Ajouter ce bloc à `/etc/caddy/Caddyfile`, sans modifier le bloc existant du CRM :

```caddyfile
telecharger.VOTRE-DOMAINE.fr {
    root * /var/www/nexus-download
    encode zstd gzip
    header {
        X-Content-Type-Options nosniff
        Referrer-Policy strict-origin-when-cross-origin
        X-Frame-Options DENY
        Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
    }
    @downloads path /downloads/*
    header @downloads Content-Disposition "attachment"
    file_server
}
```

Puis sur le VPS (après copie, permissions de lecture pour l’utilisateur caddy) :

```bash
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Ports 80/443 ouverts, domaine pointant vers le VPS : Caddy gère HTTPS. Ouvrir le site et vérifier chaque téléchargement. Pas de service Node/npm à lancer pour ce site statique. Ne jamais placer le dossier `data` ou les secrets du CRM dans le répertoire web.

## 2. Hébergement gratuit : Pages + Releases

GitHub Pages / Cloudflare Pages conviennent aux petits fichiers du site, **pas aux gros installateurs**. Les binaires dépassent 25 Mo et les limites d’import de fichiers ordinaires.

1. Créer un dépôt destiné à la distribution du produit (vérifier que vous avez le droit de publier chaque fichier). Le dépôt n’a pas besoin de contenir le code source du CRM.
2. Créer une release `v2.8.0`, joindre les trois binaires et `SHA256SUMS.txt` comme **assets de release**, pas comme fichiers du dépôt.
3. Dans `config.js`, remplacer les quatre liens par les URLs HTTPS des assets :

```js
windows: 'https://github.com/VOTRE-COMPTE/VOTRE-DEPOT/releases/download/v2.8.0/NexusRealty-Portable-2.8.0.exe',
appimage: 'https://github.com/VOTRE-COMPTE/VOTRE-DEPOT/releases/download/v2.8.0/NexusRealty-2.8.0-x86_64.AppImage',
deb: 'https://github.com/VOTRE-COMPTE/VOTRE-DEPOT/releases/download/v2.8.0/nexus-realty-2.8.0-amd64.deb',
checksums: 'https://github.com/VOTRE-COMPTE/VOTRE-DEPOT/releases/download/v2.8.0/SHA256SUMS.txt',
```

4. Publier `index.html`, `config.js` et `assets/` sur GitHub Pages (branche dédiée) ou sur Cloudflare Pages (import statique). Aucun build nécessaire, répertoire publié = celui contenant `index.html`.
5. Tester l’URL publique sur Windows/Linux et téléphone, les téléchargements et les empreintes. Avec des liens externes, l’attribut HTML `download` peut être ignoré : GitHub sert lui-même l’asset en téléchargement.

Ces étapes de publication ne sont pas exécutées ici. Elles nécessitent votre compte et votre validation de publication. Aucun domaine ou hébergement n’a été acheté.

## Mises à jour et sécurité

Remplacer les fichiers et les liens dans le seul `config.js`. Le texte ne contient pas de tailles figées. Une mise à jour reste manuelle : télécharger et réinstaller, sans supprimer les données. Faites une sauvegarde préalable.

L’exécutable Windows est **non signé**. SmartScreen peut l’avertir ou le bloquer selon la politique du PC. Ne jamais demander de désactiver la protection ; vérifier l’origine et les empreintes. Un certificat de signature et des tests sur de vrais PC Windows restent souhaitables avant une diffusion commerciale large.

Les téléchargements ne contrôlent pas un abonnement et n’activent pas de licence payante. Le programme est local : pas de synchronisation entre installations ni de serveur partagé créé automatiquement.
