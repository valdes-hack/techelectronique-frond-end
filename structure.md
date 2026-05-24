techstore-ui/
├── .env                        # Contiendra VITE_API_URL=http://localhost:8080/api/v1
├── tailwind.config.js          # Config des couleurs Apple (White, Black, Blue, Gray)
├── vite.config.js              # Optimisation des builds
├── index.html                  # Import des polices Inter ou SF Pro
│
└── src/
    ├── main.jsx                # Point d'entrée avec StrictMode
    ├── App.jsx                 # Setup des routes et du Layout principal
    │
    ├── 📂 api/
    │   ├── axiosConfig.js      # Intercepteur JWT pour injecter "Bearer {token}"
    │   └── endpoints.js        # Constantes (AUTH_URL, PRODUCTS_URL, CART_URL, etc.)
    │
    ├── 📂 assets/
    │   ├── 📂 images/          # Placeholders, bannières Apple-style
    │   └── 📂 icons/           # SVGs personnalisés
    │
    ├── 📂 components/
    │   ├── 📂 layout/
    │   │   ├── Navbar.jsx      # Navigation floue avec effet Glassmorphism
    │   │   ├── Footer.jsx      # Épuré avec colonnes par catégories
    │   │   └── Layout.jsx      # Container qui englobe les pages
    │   │
    │   ├── 📂 common/          # Composants réutilisables (Boutons Apple, Inputs)
    │   │   ├── Button.jsx      # Bouton bleu arrondi "Apple Style"
    │   │   ├── Input.jsx       # Champs de texte modernes avec labels animés
    │   │   ├── Loader.jsx      # Skeleton screens pour les chargements
    │   │   └── Toast.jsx       # Petites bulles de notif (Success/Error)
    │   │
    │   ├── 📂 product/
    │   │   ├── ProductCard.jsx # Carte produit avec zoom au survol
    │   │   ├── ProductGrid.jsx # Grille responsive
    │   │   ├── VariantPicker.jsx # Sélecteur (Couleurs, RAM, Stockage)
    │   │   └── ProductSpecs.jsx# Tableau des caractéristiques techniques
    │   │
    │   ├── 📂 cart/
    │   │   ├── CartDrawer.jsx  # Panier coulissant sur le côté droit
    │   │   └── CartItem.jsx    # Ligne d'article dans le panier
    │   │
    │   ├── 📂 chat/
    │   │   ├── ChatWidget.jsx  # Le widget flottant en bas à droite
    │   │   └── ChatMessage.jsx # Bulle de texte (Bot vs Utilisateur)
    │   │
    │   └── 📂 admin/
    │       ├── AdminSidebar.jsx
    │       ├── StatCard.jsx    # Pour le Dashboard (Chiffre d'affaires, etc.)
    │       └── OrderTable.jsx  # Liste des commandes avec statuts colorés
    │
    ├── 📂 context/
    │   ├── AuthContext.jsx     # Logique de connexion, stockage du JWT
    │   └── CartContext.jsx     # Logique du panier (ajout/suppression, prix total)
    │
    ├── 📂 hooks/
    │   ├── useAuth.js          # Pour accéder facilement à l'utilisateur partout
    │   ├── useCart.js          # Pour manipuler le panier partout
    │   └── useScroll.js        # Pour détecter le scroll et changer le style de la Navbar
    │
    ├── 📂 pages/
    │   ├── 📂 public/
    │   │   ├── Home.jsx        # Hero banner géante et produits tendances
    │   │   ├── Catalog.jsx     # Liste avec filtres intelligents
    │   │   ├── ProductDetail.jsx # La page star du site (Immersion produit)
    │   │   └── SearchResults.jsx # Page dédiée aux résultats de recherche
    │   │
    │   ├── 📂 auth/
    │   │   ├── Login.jsx       # Design minimaliste avec connexion Google
    │   │   └── Register.jsx    # Inscription propre et simple
    │   │
    │   ├── 📂 client/          # Espace "Mon Compte"
    │   │   ├── Profile.jsx     # Infos perso
    │   │   ├── MyOrders.jsx    # Historique de tes tâches Phase 4
    │   │   ├── OrderDetail.jsx # Détail + Facture PDF
    │   │   └── Wishlist.jsx    # Liste de souhaits
    │   │
    │   ├── 📂 checkout/
    │   │   ├── CartSummary.jsx # Récapitulatif
    │   │   ├── Shipping.jsx    # Choix de l'adresse
    │   │   └── Payment.jsx     # Numéro de transaction Mobile Money
    │   │
    │   └── 📂 admin/           # Espace d'administration
    │       ├── Dashboard.jsx   # Vue d'ensemble (KPIs)
    │       ├── Inventory.jsx   # Gestion des stocks (Phase 6)
    │       ├── OrdersManage.jsx # Expédition et facturation
    │       └── CustomerCare.jsx # Tickets SAV (Phase 6)
    │
    ├── 📂 routes/
    │   ├── PrivateRoute.jsx    # Protection pour les clients connectés
    │   ├── AdminRoute.jsx      # Protection pour les accès Admin uniquement
    │   └── AppRouter.jsx       # Liste de toutes les routes (mapping URLs/Pages)
    │
    ├── 📂 services/            # Tes appels à l'API de façon isolée
    │   ├── auth.service.js
    │   ├── product.service.js
    │   ├── order.service.js
    │   └── review.service.js
    │
    ├── 📂 utils/
    │   ├── formatCurrency.js   # Pour transformer "250000" en "250 000 FCFA"
    │   ├── formatDate.js       # Formatage des dates des commandes
    │   └── validators.js       # Schémas Zod pour la validation de formulaires
    │
    └── 📂 styles/
        ├── index.css           # Directives Tailwind
        └── animations.css      # Keyframes personnalisées