Installation en Local

Prérequis

Avant de commencer, assurez vous d'avoir installé les outils suivants :

XAMPP : pour lancer un serveur Apache et une base de données MySQL.
Node : Pour exécuter JavaScript côté serveur et utiliser npm pour gérer les packages.
Firebase database et storage : pour pouvoir stocker les images
Visual Studio Code : éditeur de code recommandé. 

Installation :

1. XAMPP (Serveur Apache et Base de données MySQL)
XAMPP est une solution complète qui installe Apache, MySQL, PHP, et Perl pour vous. Il est utile si vous avez besoin de configurer un serveur local pour développer des applications web.

Installation :
Allez sur le site officiel de XAMPP : Apache Friends.
Téléchargez la version de XAMPP correspondant à votre système d'exploitation (Windows, macOS, ou Linux).
Lancez l'installateur et suivez les instructions à l'écran pour installer XAMPP.
Une fois installé, lancez le XAMPP Control Panel.
Démarrez Apache et MySQL à partir du panneau de contrôle de XAMPP.

2. Node.js
Node.js est un environnement d'exécution JavaScript côté serveur qui est essentiel pour de nombreuses tâches de développement, y compris l'utilisation de frameworks comme React ou Next.js.

Installation :
Allez sur le site officiel de Node.js : Node.js.

Téléchargez la version LTS (Long Term Support) recommandée pour votre système d'exploitation.

Lancez l'installateur et suivez les instructions à l'écran.

Pour vérifier l'installation, ouvrez un terminal et tapez : node -v /  npm -v
Vous devriez voir les versions de Node.js et npm (Node Package Manager) affichées.

3. Firebase (Database et Storage)
Firebase est une plateforme de développement d'applications proposée par Google, qui inclut des fonctionnalités de base de données et de stockage d'images.

Installation et configuration :
Allez sur le site officiel de Firebase : Firebase.

Créez un compte Google si vous n'en avez pas déjà un.

Créez un nouveau projet Firebase à partir de la console Firebase.

Activez Firebase Realtime Database ou Firestore (selon ce que vous préférez) et Firebase Storage pour le stockage d'images.

Pour connecter votre projet Node.js à Firebase, installez le SDK Firebase dans votre projet : npm install firebase

Configurez Firebase dans votre projet en suivant les instructions fournies dans la console Firebase pour obtenir les informations de configuration (API key, Auth domain, etc.).
--------------------------------
Étapes d'Installation 

Téléchargement et Configuration du Projet

Récupérez le projet depuis le dépôt GitHub et ouvrez le dans Visual Studio Code.
Assurez vous que le serveur Apache et MySQL sont en cours d'exécution via XAMPP.

--------------------------------
Installation des Dépendances
		
Ouvrez un terminal dans VS Code (ou un terminal séparé) et naviguez jusqu'au répertoire du projet.
Exécutez la commande suivante pour installer toutes les dépendances nécessaires : npm install
Si des vulnérabilités sont détectées lors de l'installation, exécutez la commande suivante pour les corriger automatiquement : npm audit fix

Configuration de la Base de Données MYSQL

Créez un fichier .env à la racine du projet (si ce n'est pas déjà fait).
Configurez les paramètres de connexion à la base de données dans un fichier .env en utilisant le format suivant :


DATABASEMYSQL_URL=mysql://root:@127.0.0.1:3306/final-arcadia

DEV_DB_DATABASE=final-arcadia
DEV_DB_USERNAME=root
DEV_DB_PASSWORD=
DEV_DB_HOST=127.0.0.1
DEV_DB_PORT=3306

Configuration de Firebase database et storage

Configurez les paramètres de connexion à la base de données dans le fichier .env en utilisant le format suivant :

NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
		
Note : Adaptez ces valeurs en fonction de votre configuration locale. Le nom de la base de données (DEV_DB_DATABASE) doit correspondre à celui que vous avez défini dans MySQL. Vous pouvez obtenir les informations nécessaires en accédant à l'interface de gestion MySQL via XAMPP (en cliquant sur "Admin" dans la ligne MySQL).

--------------------------------
Mise en place de la Base de Données

Vous avez deux options pour configurer la base de données :

Approche avec un ORM (Sequelize) : Exécutez la commande suivante pour créer les tables et appliquer les migrations 
npx sequelize-cli db:migrate

Approche SQL classique : Exécutez le script suivant pour supprimer et recréer les tables
node lib/db/mySQL/createDb.mjs

--------------------------------
Insertion de Données de Test
		
Une fois la base de données mise en place, vous pouvez insérer des données de test en exécutant le script suivant :
node lib/db/mySQL/insertData.mjs

Ce script ajoute des jeux de données pour les tests, y compris un compte admin préconfiguré qui ne peut pas être créé via l'application directement. Les informations de connexion pour les tests sont les suivantes :

Admin :
Email : admin@test.fr
Mot de passe : admin

Employé :
Email : employee@test.fr
Mot de passe : employee

Vétérinaire :
Email : veterinarian@test.fr
Mot de passe : veterinarian

--------------------------------		
Exécution du Projet

Une fois le projet installé et configuré, lancez le serveur de développement avec la commande suivante : npm run dev

 
