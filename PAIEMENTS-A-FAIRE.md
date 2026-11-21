# Paiements à mettre en place (Stripe et PayPal)

Ce fichier est un guide pour toi, Ayoub. Il n’est pas destiné aux clients. Si le site est publié tel quel, ce texte pourra être visible à l’adresse du dépôt : pense à le retirer du site public plus tard, ou à ne pas le laisser sur la branche publiée.

Aujourd’hui, le site est prêt visuellement. Les boutons « Carte bancaire », « PayPal » et « Prélèvement bancaire » sont en place pour chaque formule (Essentiel, Pro, Business), en mensuel et en annuel. Comme tu n’as pas encore de compte Stripe ni PayPal, les liens sont vides : le visiteur voit le message « Paiement en ligne bientôt disponible, contacte-nous » et peut t’écrire par e-mail.

Tu n’as rien à coder. Quand tes comptes seront ouverts, tu colleras uniquement des liens publics dans `config.js`. Jamais de clé secrète.

## Avant de commencer

- Il te faut un **SIRET** (micro-entreprise ou société). Sans ça, Stripe et PayPal Business te demanderont quand même des informations d’entreprise et pourront bloquer l’activation.
- Prépare aussi : une **pièce d’identité**, l’**IBAN** du compte sur lequel tu veux recevoir l’argent, ton adresse, et l’adresse de ton site : `https://nexus-realty489.github.io/nexus-realty-telechargement/`.
- Les clés de licence Nexus Realty restent générées **à la main** par toi. Le paiement en ligne n’envoie pas la clé tout seul. Après un paiement confirmé, tu envoies la clé par e-mail sous 24 h ouvrées.
- Pour un **prélèvement SEPA**, l’argent n’est pas confirmé tout de suite (souvent quelques jours). N’envoie la clé qu’une fois le paiement indiqué comme réussi / payé, pas seulement « en cours ».
- L’offre de lancement « −20 % la première année en annuel, jusqu’au 31 mars 2027 » n’est **pas** appliquée automatiquement. Si tu veux la garder, il faudra un coupon ou un tarif promotionnel dans Stripe et PayPal, sinon le client paiera le tarif plein (490 / 790 / 1 290 € HT).
- Le site indique aujourd’hui « TVA 20 % en sus ». Tu as aussi parlé d’une franchise en base de TVA (art. 293 B). **Ne règle pas la TVA dans Stripe ou PayPal au hasard.** Demande à ton expert-comptable (ou à un avocat) comment facturer, puis aligne le site, les liens de paiement et tes factures.

## Ce qu’il ne faut jamais faire

- Ne mets jamais dans `config.js`, ni ailleurs sur le site, une clé secrète Stripe (`sk_live_…`, `sk_test_…`) ou un secret / identifiant confidentiel PayPal.
- Ne simule pas un paiement, et ne demande jamais un IBAN ou un numéro de carte directement par e-mail. Le client paie seulement sur la page Stripe ou PayPal.
- Ne mets pas en ligne des liens de **mode test**. Seulement les vrais liens de paiement, une fois les comptes activés.

---

## 1. Ouvrir un compte Stripe

1. Va sur [https://dashboard.stripe.com/register](https://dashboard.stripe.com/register) et crée un compte avec ton e-mail.
2. Stripe te guide pour activer le compte. Tu devras indiquer :
   - ton identité (pièce d’identité) ;
   - les informations de ton entreprise (SIRET, adresse, activité) ;
   - l’IBAN du compte qui recevra les virements Stripe ;
   - l’adresse de ton site web.
3. Tu peux d’abord explorer le **mode test** (paiements fictifs) pour comprendre l’écran. Les liens que tu colleras sur le site public devront être ceux du **mode live** (vrai argent), une fois le compte activé.
4. Dans le tableau de bord : **Paramètres** (roue dentée) → **Paiements** → **Moyens de paiement**. Active au moins :
   - les **cartes bancaires** ;
   - le **prélèvement SEPA** (ou « Prélèvement automatique SEPA »).
   Stripe peut demander une vérification supplémentaire pour le SEPA. Sans cette activation, le bouton « Prélèvement bancaire » du site ouvrira bien le lien Stripe, mais le client ne verra peut-être pas le prélèvement.
5. Crée **3 produits** dans **Catalogue de produits** (ou Produits) :
   - Nexus Realty Essentiel
   - Nexus Realty Pro
   - Nexus Realty Business
6. Pour chaque produit, ajoute **2 tarifs récurrents** en **euros (EUR)** :

   | Produit    | Mensuel         | Annuel              |
   | ---------- | --------------- | ------------------- |
   | Essentiel  | 49 € / mois     | 490 € / an          |
   | Pro        | 79 € / mois     | 790 € / an          |
   | Business   | 129 € / mois    | 1 290 € / an        |

   Ce sont les montants **HT** affichés sur le site. Si tu dois facturer la TVA, fais-toi confirmer le montant à saisir (HT ou TTC) avant de créer les tarifs.
7. Crée **6 liens de paiement** (Payment Links), un par tarif :
   - dans le menu, ouvre **Payment Links** (Liens de paiement) → **Créer un lien** ;
   - choisis le produit et **le tarif récurrent** concerné (abonnement, pas un paiement unique) ;
   - demande au moins l’e-mail du client (utile pour lui envoyer la clé). Tu peux aussi demander le nom de l’agence ;
   - tu peux indiquer une page de retour, par exemple ton site, avec un message du type : « Merci, votre clé de licence vous sera envoyée par e-mail sous 24 h ouvrées » ;
   - enregistre, puis **copie le lien** (il ressemble à `https://buy.stripe.com/…`).
8. Un même lien Stripe sert pour **la carte** et **le prélèvement**, à condition que les deux moyens soient activés : le client choisit sur la page Stripe. C’est pour ça qu’il n’y a qu’un champ `stripe` par formule et par période, pas deux.

### Où coller les liens Stripe dans `config.js`

Ouvre `config.js` et colle chaque lien entre les quotes, à la ligne correspondante :

```
paiements.essentiel.mensuel.stripe
paiements.essentiel.annuel.stripe
paiements.pro.mensuel.stripe
paiements.pro.annuel.stripe
paiements.business.mensuel.stripe
paiements.business.annuel.stripe
```

Exemple (ce n’est pas un vrai lien) :

```js
essentiel: {
  mensuel: { stripe: 'https://buy.stripe.com/EXEMPLE', paypal: '' },
  annuel: { stripe: 'https://buy.stripe.com/EXEMPLE', paypal: '' },
},
```

---

## 2. Ouvrir un compte PayPal Business

1. Va sur [https://www.paypal.com/fr/business](https://www.paypal.com/fr/business) et crée un **compte Business** (professionnel), pas un compte personnel.
2. Confirme ton identité, les informations de ton entreprise, et relie ton compte bancaire (IBAN).
3. Une fois le compte prêt, crée **6 abonnements** (un par formule et par période), avec les mêmes montants que le tableau ci-dessus, en euros, en récurrent (mensuel ou annuel).
   - depuis un ordinateur, tu peux passer par [https://www.paypal.com/boutons/](https://www.paypal.com/boutons/) → bouton **Abonnement**, puis suivre les étapes (créer le produit, le plan, le tarif, activer) ;
   - ou, dans le compte, **Outils professionnels** → **paiements récurrents** / **Abonnements**, puis créer un plan.
4. PayPal te donne souvent un **code HTML** de bouton. Pour notre site, on a besoin d’un **lien** (une adresse https), pas du code complet. Cherche un lien à partager, ou, dans le code, l’adresse qui commence par `https://`. Colle uniquement cette adresse dans `config.js`.
5. Ne copie jamais un identifiant secret, un certificat API ou un mot de passe dans le site.

### Où coller les liens PayPal dans `config.js`

```
paiements.essentiel.mensuel.paypal
paiements.essentiel.annuel.paypal
paiements.pro.mensuel.paypal
paiements.pro.annuel.paypal
paiements.business.mensuel.paypal
paiements.business.annuel.paypal
```

Dès qu’un lien est rempli (adresse `http://` ou `https://` valide), le bouton correspondant ouvre cette page. Tant qu’il est vide, le bouton envoie un e-mail vers `Ayoubmeilleur9@gmail.com` et le message « bientôt disponible » reste affiché.

---

## 3. Après chaque paiement

1. Regarde tes e-mails Stripe / PayPal, ou le tableau de bord.
2. Vérifie que le paiement est bien **confirmé** (surtout en prélèvement SEPA).
3. Génère la clé de licence pour la formule achetée, comme tu le fais déjà.
4. Envoie-la au client par e-mail, si possible sous 24 h ouvrées, avec un court mode d’emploi pour l’activer dans l’application.
5. Garde une trace (nom de l’agence, formule, date, e-mail) dans ton registre, pas sur le site public.

---

## 4. Frais (ordre de grandeur, à vérifier le jour J)

Les plateformes peuvent changer leurs tarifs. Chiffres relevés le 21 novembre 2026, à titre indicatif.

**Stripe** (source : [tarifs Stripe France](https://stripe.com/fr/pricing) et [moyens de paiement locaux](https://stripe.com/fr/pricing/local-payment-methods)) :

- pas de frais mensuels d’abonnement Stripe, d’après leur page de tarifs ;
- carte standard de l’Espace économique européen : **1,5 % + 0,25 €** par paiement réussi ;
- carte premium EEE : **2,8 % + 0,25 €** ;
- prélèvement SEPA : **0,35 €** par paiement réussi.

**PayPal** (source : [tarifs marchands PayPal France](https://www.paypal.com/fr/business/paypal-business-fees), page indiquée comme mise à jour le 4 novembre 2026) :

- transactions commerciales habituelles (paiement via un compte PayPal, cas le plus courant ici) : **2,90 % + 0,35 €** ;
- paiement par carte sans compte PayPal : **1,20 % + 0,35 €**.

Regarde toujours la page officielle au moment d’ouvrir le compte : c’est elle qui fait foi.

---

## 5. Mise en ligne du site

Remplir `config.js` ne met pas le site à jour tout seul auprès des visiteurs. Quand tu seras prêt, dis-le pour que la nouvelle version du site soit publiée. En attendant, rien n’a été envoyé sur GitHub Pages.
