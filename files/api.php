<?php
/**
 * api.php — Backend central Info PED
 * Gère : authentification, gestion des utilisateurs, contenu éditable
 *
 * CONFIGURATION : modifier les constantes DB_* ci-dessous
 * avant de déployer sur votre serveur.
 */

// ─────────────────────────────────────────────
//  CONFIGURATION BASE DE DONNÉES
// ─────────────────────────────────────────────
define('DB_HOST', 'localhost');
define('DB_NAME', 'infoped');
define('DB_USER', 'root');         // ← à modifier
define('DB_PASS', '');             // ← à modifier
define('DB_CHARSET', 'utf8mb4');

// ─────────────────────────────────────────────
//  CONFIGURATION SÉCURITÉ
// ─────────────────────────────────────────────
define('SESSION_NAME', 'ped_session');
define('SESSION_LIFETIME', 7200); // 2 heures

// Origines autorisées (adapter si frontend sur un autre domaine)
$allowed_origins = ['http://localhost', 'http://127.0.0.1'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowed_origins) || empty($origin)) {
    header('Access-Control-Allow-Origin: ' . ($origin ?: '*'));
}
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// ─────────────────────────────────────────────
//  SESSION
// ─────────────────────────────────────────────
ini_set('session.cookie_httponly', 1);
ini_set('session.use_strict_mode', 1);
session_name(SESSION_NAME);
session_set_cookie_params(['lifetime' => SESSION_LIFETIME, 'samesite' => 'Lax']);
session_start();

// ─────────────────────────────────────────────
//  CONNEXION PDO
// ─────────────────────────────────────────────
function getDB(): PDO {
    static $pdo = null;
    if ($pdo) return $pdo;
    try {
        $dsn = sprintf('mysql:host=%s;dbname=%s;charset=%s', DB_HOST, DB_NAME, DB_CHARSET);
        $pdo = new PDO($dsn, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    } catch (PDOException $e) {
        respond(500, ['error' => 'Connexion base de données impossible : ' . $e->getMessage()]);
    }
    return $pdo;
}

// ─────────────────────────────────────────────
//  UTILITAIRES
// ─────────────────────────────────────────────
function respond(int $code, array $data): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

function getBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function requireAuth(): array {
    if (empty($_SESSION['user'])) {
        respond(401, ['error' => 'Non authentifié']);
    }
    return $_SESSION['user'];
}

function requireAdmin(): array {
    $user = requireAuth();
    if ($user['role'] !== 'admin') {
        respond(403, ['error' => 'Accès réservé aux administrateurs']);
    }
    return $user;
}

function sanitize(string $s): string {
    return trim(htmlspecialchars($s, ENT_QUOTES, 'UTF-8'));
}

// ─────────────────────────────────────────────
//  INSTALLATION AUTOMATIQUE DES TABLES
// ─────────────────────────────────────────────
function installTables(): void {
    $db = getDB();

    // Table utilisateurs
    $db->exec("CREATE TABLE IF NOT EXISTS users (
        id       INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(80)  NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role     ENUM('admin','user') NOT NULL DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Table contenu (sections du dashboard)
    $db->exec("CREATE TABLE IF NOT EXISTS content_items (
        id         INT AUTO_INCREMENT PRIMARY KEY,
        section    VARCHAR(60)  NOT NULL,
        texte      TEXT         NOT NULL,
        lien       VARCHAR(500) DEFAULT '',
        type       ENUM('normal','alert') DEFAULT 'normal',
        position   INT          DEFAULT 0,
        updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Table agenda
    $db->exec("CREATE TABLE IF NOT EXISTS agenda (
        id           INT AUTO_INCREMENT PRIMARY KEY,
        jour         VARCHAR(2)   NOT NULL,
        mois         VARCHAR(10)  NOT NULL,
        titre        VARCHAR(200) NOT NULL,
        heure        VARCHAR(50)  DEFAULT '',
        lieu         VARCHAR(200) DEFAULT '',
        participants VARCHAR(300) DEFAULT '',
        position     INT          DEFAULT 0,
        updated_at   DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Créer l'admin par défaut si aucun utilisateur n'existe
    $count = $db->query("SELECT COUNT(*) FROM users")->fetchColumn();
    if ($count == 0) {
        $hash = password_hash('@@RG(45@@DFgld43345fdfgDFGDFG@@@', PASSWORD_DEFAULT);
        $stmt = $db->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, 'admin')");
        $stmt->execute(['admin', $hash]);

        $hash2 = password_hash('ped2026', PASSWORD_DEFAULT);
        $stmt->execute(['user0', $hash2]);
    }

    // Contenu par défaut si vide
    $countContent = $db->query("SELECT COUNT(*) FROM content_items")->fetchColumn();
    if ($countContent == 0) {
        $defaults = [
            ['medicaments', 'Protocole Doliprane mis à jour', '', 'normal', 1],
            ['medicaments', 'Amoxicilline — nouvelle posologie', '', 'normal', 2],
            ['medicaments', 'Ibuprofène pédiatrique : dosages révisés', '', 'alert', 3],
            ['hygiene', 'Informations et rappels liés à l\'hygiène', '', 'normal', 1],
            ['hygiene', 'Protocoles de désinfection mis à jour', '', 'normal', 2],
            ['divers', 'Ne plus préparer le dossier bleu (géré par le secrétariat)', '', 'normal', 1],
            ['projets', 'Projets en cours de développement', '', 'normal', 1],
            ['projets', 'Nouvelles initiatives du service', '', 'normal', 2],
            ['rh', 'Informations ressources humaines', '', 'normal', 1],
            ['rh', 'PDE : Vous pouvez consulter votre planning du mois d\'Avril à partir du 03/03', '', 'alert', 2],
        ];
        $stmt = $db->prepare("INSERT INTO content_items (section, texte, lien, type, position) VALUES (?,?,?,?,?)");
        foreach ($defaults as $row) $stmt->execute($row);
    }

    // Agenda par défaut si vide
    $countAgenda = $db->query("SELECT COUNT(*) FROM agenda")->fetchColumn();
    if ($countAgenda == 0) {
        $defaultAgenda = [
            ['03','FÉV','Réunion CA PUER','14h00 - 16h00','Salle de réunion A, Bâtiment principal','Dr. Martin, Dr. Dupont, Mme Lefebvre',1],
            ['04','FÉV','Réunion CA AP','10h30 - 12h30','Amphithéâtre, 2ème étage','Équipe administrative complète',2],
            ['05','MAR','GRE – La Brise','9h00 - 17h00','Centre La Brise, Vannes','Groupe de travail GRE',3],
            ['09','AVR','CREX','13h00 - 15h00','Salle de conférence, Bloc pédiatrique','Équipe médicale',4],
        ];
        $stmt = $db->prepare("INSERT INTO agenda (jour, mois, titre, heure, lieu, participants, position) VALUES (?,?,?,?,?,?,?)");
        foreach ($defaultAgenda as $row) $stmt->execute($row);
    }
}

// ─────────────────────────────────────────────
//  ROUTEUR
// ─────────────────────────────────────────────
$method = $_SERVER['REQUEST_METHOD'];
$path   = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
// Extraire la partie après "api.php"
$parts  = explode('/', $path);
$apiIdx = array_search('api.php', $parts);
$route  = $apiIdx !== false ? implode('/', array_slice($parts, $apiIdx + 1)) : '';

// Installer les tables au premier appel
try { installTables(); } catch (Throwable $e) {
    respond(500, ['error' => 'Erreur installation BDD : ' . $e->getMessage()]);
}

match(true) {

    // ── AUTH ──────────────────────────────────
    $route === 'auth/login'  && $method === 'POST'   => handleLogin(),
    $route === 'auth/logout' && $method === 'POST'   => handleLogout(),
    $route === 'auth/me'     && $method === 'GET'    => handleMe(),

    // ── USERS (admin uniquement) ──────────────
    $route === 'users'       && $method === 'GET'    => handleGetUsers(),
    $route === 'users'       && $method === 'POST'   => handleCreateUser(),
    preg_match('#^users/(\d+)$#', $route, $m) && $method === 'PUT'    => handleUpdateUser((int)$m[1]),
    preg_match('#^users/(\d+)$#', $route, $m) && $method === 'DELETE' => handleDeleteUser((int)$m[1]),

    // ── CONTENT ──────────────────────────────
    $route === 'content'            && $method === 'GET'    => handleGetContent(),
    $route === 'content'            && $method === 'POST'   => handleCreateContent(),
    preg_match('#^content/(\d+)$#', $route, $m) && $method === 'PUT'    => handleUpdateContent((int)$m[1]),
    preg_match('#^content/(\d+)$#', $route, $m) && $method === 'DELETE' => handleDeleteContent((int)$m[1]),

    // ── AGENDA ───────────────────────────────
    $route === 'agenda'             && $method === 'GET'    => handleGetAgenda(),
    $route === 'agenda'             && $method === 'POST'   => handleCreateAgenda(),
    preg_match('#^agenda/(\d+)$#', $route, $m) && $method === 'PUT'    => handleUpdateAgenda((int)$m[1]),
    preg_match('#^agenda/(\d+)$#', $route, $m) && $method === 'DELETE' => handleDeleteAgenda((int)$m[1]),

    default => respond(404, ['error' => 'Route introuvable : ' . $route])
};

// ═════════════════════════════════════════════
//  HANDLERS AUTH
// ═════════════════════════════════════════════
function handleLogin(): void {
    $body = getBody();
    $username = trim($body['username'] ?? '');
    $password = trim($body['password'] ?? '');

    if (!$username || !$password) {
        respond(400, ['error' => 'Identifiants manquants']);
    }

    $db   = getDB();
    $stmt = $db->prepare("SELECT id, username, password, role FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();

    if (!$user || !password_verify($password, $user['password'])) {
        respond(401, ['error' => 'Identifiant ou mot de passe incorrect']);
    }

    session_regenerate_id(true);
    $_SESSION['user'] = ['id' => $user['id'], 'username' => $user['username'], 'role' => $user['role']];

    respond(200, ['user' => ['id' => $user['id'], 'username' => $user['username'], 'role' => $user['role']]]);
}

function handleLogout(): void {
    session_destroy();
    respond(200, ['message' => 'Déconnecté']);
}

function handleMe(): void {
    if (empty($_SESSION['user'])) respond(401, ['error' => 'Non authentifié']);
    respond(200, ['user' => $_SESSION['user']]);
}

// ═════════════════════════════════════════════
//  HANDLERS USERS
// ═════════════════════════════════════════════
function handleGetUsers(): void {
    requireAdmin();
    $db   = getDB();
    $rows = $db->query("SELECT id, username, role, created_at FROM users ORDER BY id")->fetchAll();
    respond(200, ['users' => $rows]);
}

function handleCreateUser(): void {
    requireAdmin();
    $body     = getBody();
    $username = sanitize($body['username'] ?? '');
    $password = trim($body['password'] ?? '');
    $role     = in_array($body['role'] ?? '', ['admin','user']) ? $body['role'] : 'user';

    if (!$username || !$password) respond(400, ['error' => 'Champs requis manquants']);
    if (strlen($password) < 4)   respond(400, ['error' => 'Mot de passe trop court (min. 4 caractères)']);

    $db   = getDB();
    $check = $db->prepare("SELECT id FROM users WHERE username = ?");
    $check->execute([$username]);
    if ($check->fetch()) respond(409, ['error' => 'Ce nom d\'utilisateur existe déjà']);

    $hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $db->prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)");
    $stmt->execute([$username, $hash, $role]);

    respond(201, ['message' => 'Utilisateur créé', 'id' => (int)$db->lastInsertId()]);
}

function handleUpdateUser(int $id): void {
    $me   = requireAdmin();
    $body = getBody();
    $db   = getDB();

    $stmt = $db->prepare("SELECT id, username, role FROM users WHERE id = ?");
    $stmt->execute([$id]);
    $existing = $stmt->fetch();
    if (!$existing) respond(404, ['error' => 'Utilisateur introuvable']);

    $username = sanitize($body['username'] ?? $existing['username']);
    $role     = in_array($body['role'] ?? '', ['admin','user']) ? $body['role'] : $existing['role'];
    $password = trim($body['password'] ?? '');

    // Empêcher de retirer le rôle admin à soi-même
    if ((int)$me['id'] === $id && $role !== 'admin') {
        respond(400, ['error' => 'Vous ne pouvez pas retirer votre propre rôle admin']);
    }

    // Vérif unicité username
    if ($username !== $existing['username']) {
        $check = $db->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
        $check->execute([$username, $id]);
        if ($check->fetch()) respond(409, ['error' => 'Ce nom d\'utilisateur existe déjà']);
    }

    if ($password) {
        if (strlen($password) < 4) respond(400, ['error' => 'Mot de passe trop court']);
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $db->prepare("UPDATE users SET username=?, password=?, role=? WHERE id=?")->execute([$username, $hash, $role, $id]);
    } else {
        $db->prepare("UPDATE users SET username=?, role=? WHERE id=?")->execute([$username, $role, $id]);
    }

    respond(200, ['message' => 'Utilisateur mis à jour']);
}

function handleDeleteUser(int $id): void {
    $me = requireAdmin();
    if ((int)$me['id'] === $id) respond(400, ['error' => 'Vous ne pouvez pas vous supprimer vous-même']);

    $db   = getDB();
    $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) respond(404, ['error' => 'Utilisateur introuvable']);

    respond(200, ['message' => 'Utilisateur supprimé']);
}

// ═════════════════════════════════════════════
//  HANDLERS CONTENT
// ═════════════════════════════════════════════
function handleGetContent(): void {
    // Accessible à tous les utilisateurs authentifiés (et invités via GET public)
    $db   = getDB();
    $rows = $db->query("SELECT id, section, texte, lien, type, position FROM content_items ORDER BY section, position")->fetchAll();
    respond(200, ['items' => $rows]);
}

function handleCreateContent(): void {
    requireAdmin();
    $body    = getBody();
    $section = sanitize($body['section'] ?? '');
    $texte   = trim($body['texte'] ?? '');
    $lien    = filter_var(trim($body['lien'] ?? ''), FILTER_SANITIZE_URL);
    $type    = in_array($body['type'] ?? '', ['normal','alert']) ? $body['type'] : 'normal';

    if (!$section || !$texte) respond(400, ['error' => 'Section et texte requis']);

    $db = getDB();
    $maxPos = $db->prepare("SELECT COALESCE(MAX(position),0)+1 FROM content_items WHERE section=?");
    $maxPos->execute([$section]);
    $pos = (int)$maxPos->fetchColumn();

    $stmt = $db->prepare("INSERT INTO content_items (section, texte, lien, type, position) VALUES (?,?,?,?,?)");
    $stmt->execute([$section, $texte, $lien, $type, $pos]);

    respond(201, ['message' => 'Élément créé', 'id' => (int)$db->lastInsertId()]);
}

function handleUpdateContent(int $id): void {
    requireAdmin();
    $body  = getBody();
    $db    = getDB();

    $stmt = $db->prepare("SELECT id FROM content_items WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) respond(404, ['error' => 'Élément introuvable']);

    $fields = [];
    $params = [];

    if (isset($body['texte']))  { $fields[] = 'texte=?';   $params[] = trim($body['texte']); }
    if (isset($body['lien']))   { $fields[] = 'lien=?';    $params[] = filter_var(trim($body['lien']), FILTER_SANITIZE_URL); }
    if (isset($body['type']) && in_array($body['type'], ['normal','alert'])) {
        $fields[] = 'type=?'; $params[] = $body['type'];
    }

    if (empty($fields)) respond(400, ['error' => 'Aucun champ à mettre à jour']);

    $params[] = $id;
    $db->prepare("UPDATE content_items SET " . implode(', ', $fields) . " WHERE id=?")->execute($params);

    respond(200, ['message' => 'Élément mis à jour']);
}

function handleDeleteContent(int $id): void {
    requireAdmin();
    $db   = getDB();
    $stmt = $db->prepare("DELETE FROM content_items WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) respond(404, ['error' => 'Élément introuvable']);
    respond(200, ['message' => 'Élément supprimé']);
}

// ═════════════════════════════════════════════
//  HANDLERS AGENDA
// ═════════════════════════════════════════════
function handleGetAgenda(): void {
    $db   = getDB();
    $rows = $db->query("SELECT id, jour, mois, titre, heure, lieu, participants FROM agenda ORDER BY position, id")->fetchAll();
    respond(200, ['events' => $rows]);
}

function handleCreateAgenda(): void {
    requireAdmin();
    $body  = getBody();
    $jour  = sanitize($body['jour']  ?? '');
    $mois  = strtoupper(sanitize($body['mois']  ?? ''));
    $titre = sanitize($body['titre'] ?? '');

    if (!$jour || !$mois || !$titre) respond(400, ['error' => 'Jour, mois et titre requis']);

    $db = getDB();
    $maxPos = (int)$db->query("SELECT COALESCE(MAX(position),0)+1 FROM agenda")->fetchColumn();

    $stmt = $db->prepare("INSERT INTO agenda (jour, mois, titre, heure, lieu, participants, position) VALUES (?,?,?,?,?,?,?)");
    $stmt->execute([
        $jour, $mois, $titre,
        sanitize($body['heure']        ?? ''),
        sanitize($body['lieu']         ?? ''),
        sanitize($body['participants'] ?? ''),
        $maxPos
    ]);

    respond(201, ['message' => 'Évènement créé', 'id' => (int)$db->lastInsertId()]);
}

function handleUpdateAgenda(int $id): void {
    requireAdmin();
    $body = getBody();
    $db   = getDB();

    $stmt = $db->prepare("SELECT id FROM agenda WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) respond(404, ['error' => 'Évènement introuvable']);

    $fields = []; $params = [];
    $map = ['jour','mois','titre','heure','lieu','participants'];
    foreach ($map as $f) {
        if (isset($body[$f])) {
            $fields[] = "$f=?";
            $params[] = $f === 'mois' ? strtoupper(sanitize($body[$f])) : sanitize($body[$f]);
        }
    }
    if (empty($fields)) respond(400, ['error' => 'Aucun champ à mettre à jour']);

    $params[] = $id;
    $db->prepare("UPDATE agenda SET " . implode(', ', $fields) . " WHERE id=?")->execute($params);

    respond(200, ['message' => 'Évènement mis à jour']);
}

function handleDeleteAgenda(int $id): void {
    requireAdmin();
    $db   = getDB();
    $stmt = $db->prepare("DELETE FROM agenda WHERE id = ?");
    $stmt->execute([$id]);
    if ($stmt->rowCount() === 0) respond(404, ['error' => 'Évènement introuvable']);
    respond(200, ['message' => 'Évènement supprimé']);
}
