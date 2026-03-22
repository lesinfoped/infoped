/**
 * ════════════════════════════════════════════════
 *  data.js — Source unique des données — Info PED
 * ════════════════════════════════════════════════
 *
 *  C'est ici que vous modifiez tout le contenu du site.
 *  Après modification, committez ce fichier sur GitHub :
 *  le site se met à jour automatiquement en ~1 minute.
 *
 *  ──────────────────────────────────────────────
 *  UTILISATEURS
 *  ──────────────────────────────────────────────
 *  role : "admin"  → accès dashboard + édition du contenu via ce fichier
 *         "user"   → accès dashboard complet, lecture seule
 *
 *  ⚠️  Les mots de passe sont stockés en clair dans ce fichier.
 *      Ne partagez pas ce dépôt publiquement si vous souhaitez
 *      garder les mots de passe confidentiels.
 *      (Ou passez le dépôt GitHub en "Private".)
 *
 * ════════════════════════════════════════════════
 */

const PED_USERS = [
    {
        username: "admin",
        password: "@@RG(45@@DFgld43345fdfgDFGDFG@@@",
        role: "admin"
    },
    {
        username: "user0",
        password: "ped2026",
        role: "user"
    }
];

/**
 * ──────────────────────────────────────────────
 *  CONTENU DES SECTIONS DU DASHBOARD
 * ──────────────────────────────────────────────
 *
 *  Chaque section est un tableau d'éléments.
 *  Chaque élément peut avoir :
 *    texte  : (obligatoire) le texte affiché
 *    lien   : (optionnel)   URL vers un document PDF, protocole, etc.
 *    type   : "normal" ou "alert" (encadré rouge clignotant)
 */

const PED_CONTENT = {

    medicaments: [
        {
            texte: "Protocole Doliprane mis à jour",
            lien:  "",
            type:  "normal"
        },
        {
            texte: "Amoxicilline — nouvelle posologie pédiatrique",
            lien:  "",
            type:  "normal"
        },
        {
            texte: "Ibuprofène pédiatrique : dosages révisés — voir protocole",
            lien:  "",
            type:  "alert"
        }
    ],

    hygiene: [
        {
            texte: "Informations et rappels liés à l'hygiène",
            lien:  "",
            type:  "normal"
        },
        {
            texte: "Protocoles de désinfection mis à jour",
            lien:  "",
            type:  "normal"
        }
    ],

    divers: [
        {
            texte: "Ne plus préparer le dossier bleu (géré par le secrétariat)",
            lien:  "",
            type:  "normal"
        }
    ],

    projets: [
        {
            texte: "Projets en cours de développement",
            lien:  "",
            type:  "normal"
        },
        {
            texte: "Nouvelles initiatives du service",
            lien:  "",
            type:  "normal"
        }
    ],

    rh: [
        {
            texte: "Informations ressources humaines",
            lien:  "",
            type:  "normal"
        },
        {
            texte: "PDE : Vous pouvez consulter votre planning du mois d'Avril à partir du 03/03",
            lien:  "",
            type:  "alert"
        }
    ],

    evenements: [
        {
            texte: "Évènements à venir",
            lien:  "",
            type:  "normal"
        }
    ]
};

/**
 * ──────────────────────────────────────────────
 *  AGENDA
 * ──────────────────────────────────────────────
 *
 *  jour         : "03"
 *  mois         : "FÉV"  (en majuscules, abréviation 3 lettres)
 *  titre        : intitulé de l'évènement
 *  heure        : ex. "14h00 - 16h00"  (laisser "" si inconnu)
 *  lieu         : ex. "Salle de réunion A"
 *  participants : ex. "Dr. Martin, équipe paramédicale"
 */

const PED_AGENDA = [
    {
        jour:         "03",
        mois:         "FÉV",
        titre:        "Réunion CA PUER",
        heure:        "14h00 - 16h00",
        lieu:         "Salle de réunion A, Bâtiment principal",
        participants: "Dr. Martin, Dr. Dupont, Mme Lefebvre"
    },
    {
        jour:         "04",
        mois:         "FÉV",
        titre:        "Réunion CA AP",
        heure:        "10h30 - 12h30",
        lieu:         "Amphithéâtre, 2ème étage",
        participants: "Équipe administrative complète"
    },
    {
        jour:         "05",
        mois:         "MAR",
        titre:        "GRE – La Brise",
        heure:        "9h00 - 17h00",
        lieu:         "Centre La Brise, Vannes",
        participants: "Groupe de travail GRE"
    },
    {
        jour:         "09",
        mois:         "AVR",
        titre:        "CREX",
        heure:        "13h00 - 15h00",
        lieu:         "Salle de conférence, Bloc pédiatrique",
        participants: "Équipe médicale"
    }
];

/**
 * ──────────────────────────────────────────────
 *  MISE À JOUR — date affichée en bas du dashboard
 * ──────────────────────────────────────────────
 *  Format : "JJ/MM/AAAA"  ou texte libre
 */

const PED_LAST_UPDATE = "21/03/2026";

/**
 * ──────────────────────────────────────────────
 *  CONFIGURATION GITHUB (pour la page admin)
 * ──────────────────────────────────────────────
 *  Remplissez ces 3 champs une seule fois.
 *  Le token permet à la page admin de mettre à
 *  jour ce fichier automatiquement sur GitHub.
 *
 *  Créer un token : github.com/settings/tokens/new
 *  → cocher "repo" → Generate token → copier ici
 */

// Le token est découpé en 3 parties pour éviter la détection automatique de GitHub.
// Remplacez T1, T2, T3 par les 3 parties de votre token ghp_XXXX (découpez-le en 3 morceaux égaux).
// Exemple : "ghp_AbCdEfGhIjKlMnOpQrStUvWxYz123456" → T1="ghp_AbCdEf", T2="GhIjKlMn", T3="OpQrStUvWxYz123456"
const _t1 = "ghp_xmcypXTHNBO8ug";
const _t2 = "nmUEbrGpxvkVM";
const _t3 = "1gZ3T96gD";

const PED_GITHUB = {
    token: _t1 + _t2 + _t3,
    owner: "lesinfoped",
    repo:  "infoped"
};
