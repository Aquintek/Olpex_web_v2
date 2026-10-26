<?php
/**
 * Receptor del formulario de contacto de olpex.net (para hosting con PHP, p. ej. HostGator).
 * Cambie aquí a quién llegan los mensajes.
 */
const CORREO_DESTINO = 'asesortecnico1@olpex.net';
const COPIA_A        = '';                  // p. ej. 'compras@olpex.net' (vacío = sin copia)
const CORREO_ORIGEN  = 'no-reply@olpex.net'; // debe ser una cuenta del mismo dominio del hosting

header('X-Content-Type-Options: nosniff');

$quiereJson = isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false;

function responder($ok, $mensaje, $codigo, $quiereJson) {
    http_response_code($codigo);
    if ($quiereJson) {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'mensaje' => $mensaje], JSON_UNESCAPED_UNICODE);
    } else {
        // Envío sin JavaScript: volver a la página con el resultado
        header('Location: index.html?' . ($ok ? 'enviado=1' : 'error=1') . '#contacto');
    }
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(false, 'Método no permitido.', 405, $quiereJson);
}

// Campo trampa: si viene lleno es un bot. Se responde "ok" para no darle pistas.
if (!empty($_POST['website'])) {
    responder(true, 'Mensaje enviado.', 200, $quiereJson);
}

function limpiar($valor, $max) {
    $valor = trim((string) $valor);
    $valor = str_replace(["\r", "\n", "%0a", "%0d"], ' ', $valor); // evita inyección de cabeceras
    return mb_substr($valor, 0, $max);
}

$nombre   = limpiar($_POST['nombre']   ?? '', 100);
$empresa  = limpiar($_POST['empresa']  ?? '', 120);
$correo   = limpiar($_POST['correo']   ?? '', 150);
$telefono = limpiar($_POST['telefono'] ?? '', 40);
$area     = limpiar($_POST['area']     ?? '', 60);
$mensaje  = mb_substr(trim((string) ($_POST['mensaje'] ?? '')), 0, 3000);

if ($nombre === '' || $mensaje === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
    responder(false, 'Faltan datos obligatorios o el correo no es válido.', 422, $quiereJson);
}

$asunto = 'Nuevo contacto desde la web' . ($area !== '' ? " - $area" : '') . ": $nombre";

$cuerpo  = "Nuevo mensaje desde el formulario de olpex.net\n\n";
$cuerpo .= "Nombre:   $nombre\n";
$cuerpo .= "Empresa:  " . ($empresa  !== '' ? $empresa  : '-') . "\n";
$cuerpo .= "Correo:   $correo\n";
$cuerpo .= "Teléfono: " . ($telefono !== '' ? $telefono : '-') . "\n";
$cuerpo .= "Área:     " . ($area     !== '' ? $area     : '-') . "\n\n";
$cuerpo .= "Mensaje:\n$mensaje\n";

$cabeceras   = [];
$cabeceras[] = 'From: OLPEX Web <' . CORREO_ORIGEN . '>';
$cabeceras[] = 'Reply-To: ' . $nombre . ' <' . $correo . '>';
if (COPIA_A !== '') $cabeceras[] = 'Cc: ' . COPIA_A;
$cabeceras[] = 'MIME-Version: 1.0';
$cabeceras[] = 'Content-Type: text/plain; charset=UTF-8';

$asuntoCodificado = '=?UTF-8?B?' . base64_encode($asunto) . '?=';

$enviado = mail(CORREO_DESTINO, $asuntoCodificado, $cuerpo, implode("\r\n", $cabeceras), '-f' . CORREO_ORIGEN);

if ($enviado) {
    responder(true, 'Mensaje enviado.', 200, $quiereJson);
}
responder(false, 'El servidor no pudo enviar el correo.', 500, $quiereJson);
