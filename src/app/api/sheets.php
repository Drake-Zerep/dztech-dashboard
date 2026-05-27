<?php
header('Content-Type: application/json');

// CONFIGURACIÓN
define('1n2M7Ua-DTCWAYmgLR8ejCXrNDHuky518Ib0xcxroOAY', 'TU_ID_DE_HOJA_DE_CALCULO_AQUI');
define('CREDENTIALS_FILE', __DIR__ . '/credentials.json');

function getAccessToken() {
    $creds = json_decode(file_get_contents(CREDENTIALS_FILE), true);
    $jwtHeader = base64_encode(json_encode(['alg' => 'RS256', 'typ' => 'JWT']));
    $now = time();
    $exp = $now + 3600;
    
    $jwtPayload = base64_encode(json_encode([
        'iss' => $creds['client_email'],
        'scope' => 'https://www.googleapis.com/auth/spreadsheets',
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

function callSheets($method, $range, $body = null) {
    $token = getAccessToken();
    $url = "https://sheets.googleapis.com/v4/spreadsheets/" . SPREADSHEET_ID . "/values/$range?valueInputOption=RAW";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token", "Content-Type: application/json"]);
    
    if ($method === 'PUT' && $body) {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    } elseif ($method === 'POST' && $body) {
         curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
         curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
    }

    return json_decode(curl_exec($ch), true);
}

$action = $_GET['action'] ?? '';

if ($action === 'get_notes') {
    echo json_encode(callSheets('GET', 'Notas!A1'));
} elseif ($action === 'update_notes') {
    $data = json_decode(file_get_contents('php://input'), true);
    echo json_encode(callSheets('PUT', 'Notas!A1', ['values' => [[$data['content']]]]));
} elseif ($action === 'get_links') {
    echo json_encode(callSheets('GET', 'Enlaces!A:A'));
} elseif ($action === 'add_link') {
    $data = json_decode(file_get_contents('php://input'), true);
    // Añade al final
    echo json_encode(callSheets('POST', 'Enlaces!A:A', ['values' => [[$data['url']]]]));
}
?>
