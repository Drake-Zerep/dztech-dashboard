<?php
header('Content-Type: application/json');

// CONFIGURACIÓN
define('CREDENTIALS_FILE', __DIR__ . '/credentials.json'); // El mismo JSON que usaste para Sheets
define('CALENDAR_ID', 'primary'); // 'primary' es tu calendario principal

// Función para obtener Token (Idéntica a la de Sheets, asegurando scope correcto)
function getCalendarAccessToken() {
    $creds = json_decode(file_get_contents(CREDENTIALS_FILE), true);
    $jwtHeader = base64_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    $now = time();
    $exp = $now + 3600;
    
    // SCOPE DIFERENTE: Calendar Events
    $jwtPayload = base64_encode(json_encode([
        'iss' => $creds['client_email'],
        'scope' => 'https://www.googleapis.com/auth/calendar.events', 
        'aud' => 'https://oauth2.googleapis.com/token',
        'exp' => $exp,
        'iat' => $now
    ]));

    $signature = $jwtHeader . '.' . $jwtPayload;
    openssl_sign($signature, $binarySignature, $creds['private_key'], OPENSSL_ALGO_SHA256);
    $jwt = $signature . '.' . base64_encode($binarySignature);

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion' => $jwt
    ]));
    
    $res = json_decode(curl_exec($ch), true);
    return $res['access_token'];
}

function callCalendar($method, $body = null, $eventId = null) {
    $token = getCalendarAccessToken();
    $url = "https://www.googleapis.com/calendar/v3/calendars/" . CALENDAR_ID . "/events";
    
    if ($eventId) $url .= "/$eventId";
    // Parametros para listar (próximos 10 eventos ordenados por fecha)
    if ($method === 'GET' && !$eventId) $url .= "?maxResults=10&orderBy=startTime&singleEvents=true&timeMin=" . date('c');

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token", "Content-Type: application/json"]);
    
    if ($method === 'POST' && $body) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }

    return json_decode(curl_exec($ch), true);
}

$action = $_GET['action'] ?? '';

if ($action === 'list') {
    echo json_encode(callCalendar('GET'));
} elseif ($action === 'add') {
    $data = json_decode(file_get_contents('php://input'), true);
    // Formato Google Calendar: start.dateTime debe ser ISO 8601
    $body = [
        'summary' => $data['summary'],
        'start' => ['dateTime' => $data['dateTime']],
        'end' => ['dateTime' => $data['dateTime']] // Por defecto 1 hora o mismo momento
    ];
    echo json_encode(callCalendar('POST', $body));
}
?>
