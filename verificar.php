<?php
$output = [];
$returnCode = 0;

exec('php -l ' . escapeshellarg(__DIR__ . '/enviar-programas.php') . ' 2>&1', $output, $returnCode);

header('Content-Type: text/plain; charset=utf-8');

echo implode("\n", $output);

if ($returnCode !== 0) {
    http_response_code(500);
}