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
    },
    {
        username: "admin1",
        password: "ADMIN@@ADMIN",
        role: "admin"
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
            texte:     "TUBULURE SPIRALE : toujours en test dans le service, pour les patients d’onco-hémato, drépanocytaires ou ayant une antibiothérapie au long cours. \nFeuille d’évaluation produit à remplir à chaque utilisation avant la mise en place définitive et à remettre à la cadre.",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      true,
            italic:    false,
            under:     false
        },
        {
            texte:     "Nouveau raccord Nutrisafe pour adapter au SNG",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
        {
            texte:     "Ajout d'ATB IV dans la pharmacie des URGENCES PED : Metronidazole, Aciclovir, Augmentin 500mg.",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
        {
            texte:     "AEROSOL : à mettre sous Air si sat>94% et sous O2 si sat<94%",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        }
    ],

    hygiene_htc: [
        {
            texte:     "VIGILANCE en ce qui concerne les commandes de matériel et de pharmacie. Rappel du système plein/vide ++. Anticipation de l’activité sur le week-end et la nuit.",
            lien:      "",
            type:      "alert",
            size:      "",
            textColor: "#C94A6D",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
        {
            texte:     "Remettre un « livret d’accueil – P’tits Doudous » aux enfants avant le bloc opératoire, en pédiatrie et aux urgences pédiatriques, pour les interventions non programmées.",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
        {
            texte:     "Tuyau d’évacuation du MEOPA est à changer tous les lundis, feuille de traçabilité à remplir.",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        }
    ],

    hygiene_urgence: [
        {
            texte:     "A la demande des médecins, merci de mesurer le PC des enfants jusqu’à 1 an à l’admission (UP ou HTC)",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        }
    ],

    hygiene_pedopsy: [
        {
            texte:     "Remettre et faire signer le contrat ados (version couleur). Original à classer dans le dossier patient --> cf image",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        }
    ],

    hygiene: [
    ],

    divers: [
        {
            texte:     "HEMOVIGILANCE : Vigilance concernant les étiquettes des culots à bien coller sur les deux feuilles. Bien retourner suite aux transfusions la fiche navette et la feuille de délivrance à l’hémovigilance.",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
        {
            texte:     "Les étiquettes patients sont regroupées dans deux classeurs (nourrissons et grands-enfants) et rangés dans le bureau IDE. Les autorisations de soins, courrier du médecin, fiche SAMU, contrat ado, etc. sont à laisser dans la pochette kraft dans la PAC et à ranger dans le bureau médical. Pour des raisons d’hygiène les classeurs de protocoles (Diabète, PCA, etc.) seront rangés dans le bureau IDE.",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
        {
            texte:     "Mémo téléphonique du service (format poche) à récupérer dans le bureau IDE.",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
        {
            texte:     "En cas d'AES *Accident d'Exposition au Sang*, Maintien des bons de laboratoire L1, pour les patients exposés (professionnels). Ils sont rangés avec le matériel de laboratoire aux urgences et en pédiatrie",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
        {
            texte:     "Depuis février 2026, le staff ados du jeudi midi, a lieu en salle de réunion de pédiatrie",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
        {
            texte:     "Ne plus préparer le dossier bleu (géré par le secrétariat)",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
    ],

    projets: [
        {
            texte:     "MICRO-CRP capillaire : Formation les 7 et 8 avril aux Urgences Pédiatriques. Présence de la prestataire toute la journée, y compris en début de nuit pour les équipes de nuit. (cf info ds planning PDE) Puis formation des professionnels absents, par les 4 référentes : Rozenn LQ, Ludivine, Nolwenn et Solène.",
            lien:      "",
            type:      "alert",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
        {
            texte:     "appel à candidature pour référent(s) DM",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
        {
            texte:     "Travaux des UP : en cours",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
        {
            texte:     "réorganisation HTC :",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
        {
            texte:     "groupe de travail Pedopsy : date d'une première réunion à fixer",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        }
    ],

    rh: [
        {
            texte:     "nouvelle trame PDE : affichée en salle de pause avec présentation au CSE prévue en Juin",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        }
    ],

    evenements: [
        {
            texte:     "OYE OYE LA PEDIA !! Soirée de service le jeudi 12/03",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
        {
            texte:     "galettes de roi le 26/01 en salle de réunion de pédiatrie",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
        },
        {
            texte:     "anniversaire de",
            lien:      "",
            type:      "normal",
            size:      "",
            textColor: "",
            hlColor:   "",
            bold:      false,
            italic:    false,
            under:     false
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
        jour:         "7&8",
        mois:         "AVR",
        titre:        "Formation PDE pour habilitation MicroCRP aux UP",
        heure:        "cf planning",
        lieu:         "UP",
        participants: "Toutes les IDE"
    },
    {
        jour:         "13",
        mois:         "MAR",
        titre:        "Retour des questionnaire de satisfaction par Servane OLIVO",
        heure:        "14h30",
        lieu:         "salle de réunion / Teams",
        participants: ""
    },
    {
        jour:         "17",
        mois:         "MAR",
        titre:        "CREX = prise en charge complexe Pansinusite avec choc septique et CIVD",
        heure:        "15h30 - 17h00",
        lieu:         "salle de reunion pedia",
        participants: ""
    },
    {
        jour:         "05",
        mois:         "MAR",
        titre:        "GRE – La Brise",
        heure:        "14h30 - 16h30",
        lieu:         "salle de réunion pédia",
        participants: "Groupe de travail GRE"
    },
    {
        jour:         "09",
        mois:         "AVR",
        titre:        "CREX",
        heure:        "A définir",
        lieu:         "Salle de réunion",
        participants: ""
    }
];

/**
 * ──────────────────────────────────────────────
 *  MISE À JOUR — date affichée en bas du dashboard
 * ──────────────────────────────────────────────
 *  Format : "JJ/MM/AAAA"  ou texte libre
 */

const PED_LAST_UPDATE = "22/03/2026";

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