Université Horizon – Application de gestion universitaire

Application web de gestion universitaire réalisée dans le cadre du Laboratoire 5 (variante 1 : gestion universitaire). Elle permet de gérer les étudiants, les enseignants, les cours, les départements, les inscriptions et les résultats académiques, et d'afficher les statistiques de réussite.

Application en ligne : https://gestion-universitaire-4t4d.onrender.com/
Code source : https://github.com/Oifikidine976/gestion-universitaire
Fonctionnalités

L'application comporte cinq pages :

Page Adresse Accès Rôle de la page
Accueil / Tout le monde Présentation de l'université et de ses services

Connexion /connexion Tout le monde Création de compte, connexion, déconnexion

Enregistrement /formulaires Utilisateur connecté Ajouter, modifier et supprimer les étudiants, enseignants, cours, départements et inscriptions

Gestion /gestion Utilisateur connecté Consulter et corriger les résultats académiques (notes)

Tableau de bord /dashboard Administrateur Statistiques de réussite, graphiques et historique

Détail des pages
Connexion : formulaire d'inscription (nom, e-mail, mot de passe) et formulaire de connexion. Les données sont vérifiées et les erreurs sont affichées en français (mot de passe trop court, compte déjà existant, etc.).

Enregistrement : un onglet par type d'information. Les formulaires contiennent des champs de texte, d'e-mail, de nombre, des listes déroulantes et des cases à cocher. Chaque information peut être ajoutée, modifiée ou supprimée, et elle est enregistrée dans la base de données.

Gestion (résultats académiques) : tableau des résultats avec cartes de synthèse (nombre de résultats, moyenne, taux de réussite), barre de recherche (étudiant ou cours), filtres par cours et par résultat (réussi, échec, non noté). On peut saisir ou modifier une note. L'administrateur peut aussi supprimer une inscription.

Tableau de bord (statistiques de réussite) : filtre par année universitaire, indicateurs clés (nombre d'étudiants, notes saisies, moyenne générale, taux de réussite), deux graphiques (taux de réussite par cours et répartition des résultats), tableau récapitulatif par cours avec recherche, et historique des dernières activités. Les chiffres se mettent à jour automatiquement.

Technologies utilisées

Technologie :

React 19 Création de l'interface avec des composants

Vite Outil de développement et de construction du site

React Router Navigation entre les pages

Firebase Authentication Inscription et connexion des utilisateurs

Cloud Firestore Base de données (stockage persistant, mise à jour en temps réel)

Chart.js et react-chartjs-2 Graphiques du tableau de bord

HTML5, CSS3, JavaScript Structure, mise en forme (responsive) et logique

Render Hébergement de l'application en ligne

GitHub Gestion et partage du code

Rôles et autorisations

Rôle
Enseignant (rôle donné à l'inscription) Voir les pages Enregistrement et Gestion, ajouter et modifier des informations, saisir et modifier des notes

Administrateur Tous les droits de l'enseignant, plus la suppression d'informations et l'accès au tableau de bord

Les pages protégées sont gérées par le composant ProtectedRoute : un utilisateur non connecté est renvoyé vers la page de connexion, et un utilisateur sans le bon rôle ne peut pas ouvrir le tableau de bord.

Pour donner le rôle administrateur à un compte : dans la console Firebase, ouvrir Firestore, collection users, puis mettre le champ role du compte à admin.

Structure du projet

gestion-universitaire/
├── public/ Icônes du site
├── src/
│ ├── components/
│ │ ├── Navbar.jsx Menu de navigation
│ │ ├── ProtectedRoute.jsx Protection des pages selon le rôle
│ │ └── GestionCollection.jsx Tableau avec ajout, modification, suppression
│ ├── context/
│ │ └── AuthContext.jsx Utilisateur connecté et son rôle
│ ├── hooks/
│ │ └── useCollection.js Lecture d'une collection Firestore en temps réel
│ ├── pages/
│ │ ├── Accueil.jsx Page d'accueil
│ │ ├── Connexion.jsx Inscription et connexion
│ │ ├── Formulaires.jsx Enregistrement des informations
│ │ ├── Gestion.jsx Résultats académiques
│ │ └── Dashboard.jsx Tableau de bord et statistiques
│ ├── App.jsx Liste des pages (routes)
│ ├── firebase.js Connexion à Firebase
│ ├── index.css Styles de l'application
│ └── main.jsx Point d'entrée
├── .env Clés Firebase (non publié sur GitHub)
├── package.json Liste des dépendances et des commandes
└── vite.config.js Configuration de Vite

Base de données (Firestore)

Collection

users Utilisateurs de l'application : nom, e-mail, rôle

departements Départements (filières)

enseignants Enseignants et leur département

cours Cours : intitulé, crédits, département, enseignant

etudiants Étudiants : nom, e-mail, filière, niveau, boursier

inscriptions Inscription d'un étudiant à un cours pour une année, avec sa note

historique Journal des actions (ajout, modification, suppression)
