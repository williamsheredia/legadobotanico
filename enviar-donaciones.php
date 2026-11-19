<?php

header('Content-Type: application/json; charset=UTF-8');

// Solo aceptar solicitudes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido.'
    ]);
    exit;
}

// Cargar configuración privada
$configFile = dirname(__DIR__) . '/alebo_private/config.php';

if (!file_exists($configFile)) {
    error_log('ALEBO: No se encontró config.php');
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de configuración del servidor.'
    ]);
    exit;
}

$config = require $configFile;

// Cargar PHPMailer
$phpmailerPath = __DIR__ . '/librerias/PHPMailer-6.10.0/src/';

require_once $phpmailerPath . 'Exception.php';
require_once $phpmailerPath . 'PHPMailer.php';
require_once $phpmailerPath . 'SMTP.php';

// Recibir y limpiar datos
$nombre = trim($_POST['nombre'] ?? '');
$email = trim($_POST['email'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$detalle = trim($_POST['detalle'] ?? '');

$tiposAporte = $_POST['tipo_aporte'] ?? [];

if (!is_array($tiposAporte)) {
    $tiposAporte = [];
}

$tiposPermitidos = [
    'Aporte economico',
    'Plantas y semillas',
    'Compost y materia organica',
    'Materiales y herramientas'
];

$tiposAporte = array_values(array_intersect(
    $tiposAporte,
    $tiposPermitidos
));

// Validaciones
if ($nombre === '' || $email === '' || $telefono === '') {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Completa todos los campos obligatorios.'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'El correo electrónico no es válido.'
    ]);
    exit;
}

if (count($tiposAporte) === 0) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Selecciona al menos un tipo de aporte.'
    ]);
    exit;
}

if (
    strlen($nombre) > 150 ||
    strlen($email) > 254 ||
    strlen($telefono) > 40 ||
    strlen($detalle) > 3000
) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Uno de los campos supera la longitud permitida.'
    ]);
    exit;
}

// Preparar contenido seguro
$nombreSeguro = htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8');
$emailSeguro = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$telefonoSeguro = htmlspecialchars($telefono, ENT_QUOTES, 'UTF-8');
$detalleSeguro = nl2br(
    htmlspecialchars($detalle, ENT_QUOTES, 'UTF-8')
);

$tiposHTML = '';

foreach ($tiposAporte as $tipo) {
    $tiposHTML .= '<li>' .
        htmlspecialchars($tipo, ENT_QUOTES, 'UTF-8') .
        '</li>';
}

try {

    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

    // Configuración local de Hosting Perú
    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->Port = (int) $config['smtp_port'];

    $mail->SMTPAuth = false;
    $mail->SMTPSecure = '';
    $mail->SMTPAutoTLS = false;

    $mail->CharSet = 'UTF-8';

    // Remitente y destinatario
    $mail->setFrom(
        'formulario@legadobotanico.org',
        'ALEBO - Propuestas de aporte'
    );

    $mail->addAddress('donaciones@legadobotanico.org');

    // Permite responder directamente al interesado
    $mail->addReplyTo($email, $nombre);

    // Asunto
    $mail->Subject = 'Nueva propuesta de aporte - ALEBO';

    // Correo HTML
    $mail->isHTML(true);

    $mail->Body = "
        <h2>Nueva propuesta de aporte</h2>

        <p><strong>Nombre o entidad:</strong> {$nombreSeguro}</p>

        <p><strong>Correo electrónico:</strong> {$emailSeguro}</p>

        <p><strong>Teléfono / WhatsApp:</strong> {$telefonoSeguro}</p>

        <p><strong>Tipos de aporte seleccionados:</strong></p>

        <ul>{$tiposHTML}</ul>

        <p><strong>Detalles del aporte / Mensaje:</strong></p>

        <p>{$detalleSeguro}</p>

        <hr>
        <p><small>
            Mensaje recibido desde el formulario de aportes
            del sitio web de ALEBO.
        </small></p>
    ";

    // Versión de texto
    $mail->AltBody =
        "Nueva propuesta de aporte - ALEBO\n\n" .
        "Nombre o entidad: {$nombre}\n" .
        "Correo: {$email}\n" .
        "Teléfono: {$telefono}\n\n" .
        "Tipos de aporte:\n- " .
        implode("\n- ", $tiposAporte) .
        "\n\nDetalles:\n{$detalle}";

    // Enviar
    $mail->send();

    echo json_encode([
        'success' => true,
        'message' => 'Tu propuesta de aporte fue enviada correctamente.'
    ]);

} catch (\PHPMailer\PHPMailer\Exception $e) {

    error_log('ALEBO PHPMailer Donaciones: ' . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'No se pudo enviar tu propuesta. Inténtalo nuevamente.'
    ]);

} catch (\Throwable $e) {

    error_log('ALEBO Error Donaciones: ' . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Ocurrió un error interno al procesar tu propuesta.'
    ]);
}
