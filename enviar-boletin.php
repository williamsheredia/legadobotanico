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

// Recibir correo
$email = trim($_POST['email'] ?? '');

// Validar correo
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Introduce una dirección de correo válida.'
    ]);
    exit;
}

if (strlen($email) > 254) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'La dirección de correo es demasiado larga.'
    ]);
    exit;
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
        'ALEBO - Boletín informativo'
    );

    $mail->addAddress('info@legadobotanico.org');

    // Permite responder al suscriptor
    $mail->addReplyTo($email);

    // Asunto
    $mail->Subject = 'Nueva suscripción al boletín - ALEBO';

    // Contenido HTML
    $mail->isHTML(true);

    $emailSeguro = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');

    $mail->Body = "
        <h2>Nueva suscripción al boletín informativo</h2>

        <p>Una persona desea recibir novedades de ALEBO.</p>

        <p><strong>Correo electrónico:</strong> {$emailSeguro}</p>

        <hr>
        <p><small>
            Registro recibido desde el formulario del boletín
            del sitio web de ALEBO.
        </small></p>
    ";

    $mail->AltBody =
        "Nueva suscripción al boletín informativo - ALEBO\n\n" .
        "Correo electrónico: {$email}";

    // Enviar
    $mail->send();

    echo json_encode([
        'success' => true,
        'message' => 'Suscripción recibida correctamente.'
    ]);

} catch (\PHPMailer\PHPMailer\Exception $e) {

    error_log('ALEBO PHPMailer Boletin: ' . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'No se pudo procesar la suscripción. Inténtalo nuevamente.'
    ]);

} catch (\Throwable $e) {

    error_log('ALEBO Error Boletin: ' . $e->getMessage());

    http_response_code(500);

    echo json_encode([
        'success' => false,
        'message' => 'Ocurrió un error interno al procesar la suscripción.'
    ]);
}
