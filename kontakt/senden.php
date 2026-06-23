<?php
/**
 * Kontaktformular-Versand für di-fugen.de
 * Nimmt die POST-Daten des Formulars entgegen und sendet sie per E-Mail
 * an info@di-fugen.de. Kein Drittanbieter, läuft direkt auf dem Server.
 */

$EMPFAENGER    = 'info@di-fugen.de';
$ABSENDER      = 'info@di-fugen.de';            // From: muss eine Adresse der eigenen Domain sein
$REDIRECT_OK   = '/kontakt/danke/';
$REDIRECT_FAIL = '/kontakt/?fehler=1';

// Nur POST-Anfragen zulassen
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: /kontakt/', true, 303);
    exit;
}

// Spam-Honeypot: ist das versteckte Feld ausgefüllt, war es ein Bot -> still verwerfen
if (!empty($_POST['_honey'])) {
    header('Location: ' . $REDIRECT_OK, true, 303);
    exit;
}

// Eingaben säubern
function feld($key) {
    return isset($_POST[$key]) ? trim((string) $_POST[$key]) : '';
}
// Schutz gegen E-Mail-Header-Injection (keine Zeilenumbrüche in Kopf-Feldern)
function kopf_sicher($v) {
    return str_replace(array("\r", "\n", "%0a", "%0d", "%0A", "%0D"), ' ', $v);
}

$name      = kopf_sicher(feld('Name'));
$telefon   = kopf_sicher(feld('Telefon'));
$email     = kopf_sicher(feld('email'));
$leistung  = kopf_sicher(feld('Leistung'));
$nachricht = feld('Nachricht');

// Pflichtfelder prüfen
if ($name === '' || $telefon === '') {
    header('Location: ' . $REDIRECT_FAIL, true, 303);
    exit;
}

// Absender-E-Mail nur als Reply-To verwenden, wenn gültig
$reply = filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : '';

// Nachrichtentext zusammenbauen
$betreff = 'Neue Anfrage über di-fugen.de';
$body  = "Neue Anfrage über das Kontaktformular von di-fugen.de\n\n";
$body .= "Name:     " . $name . "\n";
$body .= "Telefon:  " . $telefon . "\n";
$body .= "E-Mail:   " . ($email !== '' ? $email : '(keine Angabe)') . "\n";
$body .= "Leistung: " . ($leistung !== '' ? $leistung : '(keine Angabe)') . "\n\n";
$body .= "Nachricht:\n" . ($nachricht !== '' ? $nachricht : '(keine Angabe)') . "\n";

// Kopfzeilen
$headers  = 'From: DI Fugentechnik <' . $ABSENDER . ">\r\n";
if ($reply !== '') {
    $headers .= 'Reply-To: ' . $reply . "\r\n";
}
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "MIME-Version: 1.0\r\n";

// Betreff UTF-8-sicher kodieren
$betreff_enc = '=?UTF-8?B?' . base64_encode($betreff) . '?=';

// Senden (5. Parameter setzt den Envelope-Absender für bessere Zustellbarkeit)
$ok = @mail($EMPFAENGER, $betreff_enc, $body, $headers, '-f' . $ABSENDER);

header('Location: ' . ($ok ? $REDIRECT_OK : $REDIRECT_FAIL), true, 303);
exit;
