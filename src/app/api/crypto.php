<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Ojo: en producción pon tu dominio exacto

$symbols = 'BTCUSDT,ETHUSDT,SOLUSDT,ADAUSDT,AVAXUSDT,TONUSDT,SUIUSDT,XRPUSDT,ZECUSDT,BNBUSDT';
$url = "https://api.bybit.com/v5/market/tickers?category=spot&symbol=$symbols";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
