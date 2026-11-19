<?php
// Respuesta JSON para el formulario
header('Content-Type: application/json; charset=utf-8');

function responder($exito, $mensaje, $codigo = 200) {
    http_response_code($codigo);
    echo json_encode([
        'success' => $exito,
        'message' => $mensaje
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Aceptar únicamente solicitudes POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método no permitido.', 405);
}

// Cargar configuración privada
$configFile = dirname(__DIR__) . '/alebo_private/config.php';

if (!file_exists($configFile)) {
    error_log('ALEBO: No se encontró el archivo de configuración.');
    responder(false, 'No se pudo procesar el registro.', 500);
}

$config = require $configFile;

// Cargar PHPMailer
$phpmailer = __DIR__ . '/librerias/PHPMailer-6.10.0/src/';

require_once $phpmailer . 'Exception.php';
require_once $phpmailer . 'PHPMailer.php';
require_once $phpmailer . 'SMTP.php';


// Recoger y limpiar los datos
$nombre = trim($_POST['nombre'] ?? '');
$distrito = trim($_POST['distrito'] ?? '');
$email = trim($_POST['email'] ?? '');
$telefono = trim($_POST['telefono'] ?? '');
$edad = trim($_POST['edad'] ?? '');
$profesion = trim($_POST['profesion'] ?? '');
$movilidad = trim($_POST['movilidad_propia'] ?? '');
$disponibilidad = trim($_POST['disponibilidad'] ?? '');
$tipoLabor = trim($_POST['tipo_labor_preferida'] ?? '');
$comentario = trim($_POST['comentario'] ?? '');

// Validar campos obligatorios
$obligatorios = [
    $nombre,
    $distrito,
    $email,
    $telefono,
    $edad,
    $movilidad,
    $disponibilidad,
    $tipoLabor
];

foreach ($obligatorios as $campo) {
    if ($campo === '') {
        responder(false, 'Completa todos los campos obligatorios.', 400);
    }
}

// Validaciones adicionales
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    responder(false, 'El correo electrónico no es válido.', 400);
}

if (!ctype_digit($edad) || (int)$edad < 12 || (int)$edad > 99) {
    responder(false, 'La edad debe estar entre 12 y 99 años.', 400);
}

if (strlen($nombre) > 150 || strlen($distrito) > 120 ||
    strlen($telefono) > 40 || strlen($profesion) > 150 ||
    strlen($disponibilidad) > 200 || strlen($tipoLabor) > 250 ||
    strlen($comentario) > 2000) {
    responder(false, 'Uno de los campos supera la longitud permitida.', 400);
}

// Preparar el contenido del correo
$campos = [
    'Nombre y apellido' => $nombre,
    'Distrito' => $distrito,
    'Correo electrónico' => $email,
    'Teléfono / WhatsApp' => $telefono,
    'Edad' => $edad,
    'Profesión u ocupación' => $profesion ?: 'No indicado',
    'Movilidad propia' => $movilidad,
    'Disponibilidad' => $disponibilidad,
    'Tipo de labor preferida' => $tipoLabor,
    'Comentario adicional' => $comentario ?: 'Sin comentarios'
];

$filasHTML = '';

foreach ($campos as $etiqueta => $valor) {
    $filasHTML .= '<tr>
        <td style="padding:9px;border:1px solid #ddd;"><strong>'
        . htmlspecialchars($etiqueta, ENT_QUOTES, 'UTF-8') .
        '</strong></td>
        <td style="padding:9px;border:1px solid #ddd;">'
        . nl2br(htmlspecialchars($valor, ENT_QUOTES, 'UTF-8')) .
        '</td>
    </tr>';
}

// Enviar mediante Zoho SMTP
try {
    $mail = new \PHPMailer\PHPMailer\PHPMailer(true);

    $mail->isSMTP();
    $mail->Host = $config['smtp_host'];
    $mail->Port = (int)$config['smtp_port'];

    $mail->SMTPAuth = false;
    $mail->SMTPSecure = '';
    $mail->SMTPAutoTLS = false;

    $mail->CharSet = 'UTF-8';

    $mail->setFrom(
    'formulario@legadobotanico.org',
    'ALEBO - Registro de voluntariado'
    );

    $mail->addAddress($config['mail_to']);
    $mail->addReplyTo($email, $nombre);

    $mail->isHTML(true);
    $mail->Subject = 'Nuevo registro de voluntariado - ALEBO';

    $mail->Body = '
        <div style="font-family:Arial,sans-serif;color:#333;">
            <h2 style="color:#52734D;">Nuevo registro de voluntariado</h2>
            <p>Se ha recibido una nueva solicitud desde la página web de ALEBO.</p>
            <table style="border-collapse:collapse;width:100%;">
                ' . $filasHTML . '
            </table>
            <p style="margin-top:20px;color:#777;">
                Mensaje automático del sitio web de Asociación Legado Botánico.
            </p>
        </div>
    ';

    $mail->AltBody = "Nuevo registro de voluntariado\n\n";

    foreach ($campos as $etiqueta => $valor) {
        $mail->AltBody .= $etiqueta . ': ' . $valor . "\n";
    }

    $mail->send();

    responder(true, 'Registro enviado correctamente.');

} catch (\PHPMailer\PHPMailer\Exception $e) {
    error_log('ALEBO PHPMailer: ' . $e->getMessage());
    responder(false, 'No pudimos enviar tu registro. Inténtalo nuevamente.', 500);
}
