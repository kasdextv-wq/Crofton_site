<?php
// Crofton form handler. Put this file next to index.html on a PHP server.
// Secrets are loaded from .env and are not present in HTML/JS.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['ok'=>false,'error'=>'Only POST allowed']); exit; }

function load_env_file($path) {
  $env = [];
  if (!file_exists($path)) return $env;
  foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
    $line = trim($line);
    if ($line === '' || $line[0] === '#') continue;
    $pos = strpos($line, '=');
    if ($pos === false) continue;
    $key = trim(substr($line, 0, $pos));
    $val = trim(substr($line, $pos + 1));
    $val = trim($val, " \t\n\r\0\x0B\"'");
    $env[$key] = $val;
  }
  return $env;
}
$ENV = load_env_file(__DIR__.'/.env');
$CONFIG = [
  'telegram_bot_token' => $ENV['TELEGRAM_BOT_TOKEN'] ?? '',
  'telegram_chat_id' => $ENV['TELEGRAM_CHAT_ID'] ?? '',
  'vk_token' => $ENV['VK_TOKEN'] ?? '',
  'vk_domain' => $ENV['VK_DOMAIN'] ?? 'ivancrofton',
  'smtp_host' => $ENV['SMTP_HOST'] ?? 'smtp.yandex.ru',
  'smtp_port' => intval($ENV['SMTP_PORT'] ?? 465),
  'smtp_user' => $ENV['SMTP_USER'] ?? '',
  'smtp_pass' => $ENV['SMTP_PASS'] ?? '',
  'mail_to' => $ENV['MAIL_TO'] ?? ($ENV['SMTP_USER'] ?? ''),
  'mail_from_name' => $ENV['MAIL_FROM_NAME'] ?? 'Crofton Site'
];

function clean($v, $max = 2000) {
  $v = is_string($v) ? trim($v) : '';
  $v = strip_tags($v);
  if (function_exists('mb_strlen')) {
    if (mb_strlen($v, 'UTF-8') > $max) $v = mb_substr($v, 0, $max, 'UTF-8');
  } else {
    if (strlen($v) > $max * 4) $v = substr($v, 0, $max * 4);
  }
  return $v;
}
function is_valid_method($method) {
  return in_array($method, ['telegram', 'vk', 'email', 'phone'], true);
}
function is_valid_contact($method, $contact) {
  if (!is_string($contact) || trim($contact) === '') return false;
  $contact = trim($contact);
  if ($method === 'email') return filter_var($contact, FILTER_VALIDATE_EMAIL) !== false;
  if ($method === 'phone') {
    $digits = preg_replace('/\D+/', '', $contact);
    if ($digits !== '' && $digits[0] === '8') $digits = '7' . substr($digits, 1);
    return strlen($digits) === 11 && $digits[0] === '7';
  }
  return in_array($method, ['vk', 'telegram'], true) && $contact !== '';
}
function normalize_contact($method, $contact) {
  $contact = trim((string)$contact);
  if ($method === 'phone') {
    $digits = preg_replace('/\D+/', '', $contact);
    if ($digits !== '' && $digits[0] === '8') $digits = '7' . substr($digits, 1);
    if (strlen($digits) === 11) return '+7 ' . substr($digits, 1, 3) . ' ' . substr($digits, 4, 3) . '-' . substr($digits, 7, 2) . '-' . substr($digits, 9, 2);
  }
  return $contact;
}
function tg_escape($text) { return htmlspecialchars((string)$text, ENT_QUOTES|ENT_SUBSTITUTE, 'UTF-8'); }
function write_leads_file($file, $leads, &$error = '') {
  $json = json_encode($leads, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
  if ($json === false) { $error = 'json_encode failed'; return false; }

  // Keep the original working behavior first.
  $ok = @file_put_contents($file, $json);
  if ($ok !== false) return true;

  // Fallback 1: direct handle write.
  $fp = @fopen($file, 'c+');
  if ($fp) {
    @rewind($fp);
    @ftruncate($fp, 0);
    $written = @fwrite($fp, $json);
    @fflush($fp);
    @fclose($fp);
    if ($written !== false) return true;
  }

  // Fallback 2: temp file in same directory.
  $dir = dirname($file);
  $tmp = @tempnam($dir, basename($file).'.tmp.');
  if ($tmp) {
    if (@file_put_contents($tmp, $json) !== false && @rename($tmp, $file)) return true;
    @unlink($tmp);
  }

  $error = 'file_exists='.(file_exists($file)?'yes':'no').', file_writable='.(is_writable($file)?'yes':'no').', dir_writable='.(is_writable($dir)?'yes':'no');
  return false;
}
function http_post($url, $data) {
  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [CURLOPT_POST=>true, CURLOPT_POSTFIELDS=>http_build_query($data), CURLOPT_RETURNTRANSFER=>true, CURLOPT_CONNECTTIMEOUT=>5, CURLOPT_TIMEOUT=>8]);
    $res = curl_exec($ch); $err = curl_error($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    return [$code, $res, $err];
  }
  $ctx = stream_context_create(['http'=>['method'=>'POST','header'=>'Content-Type: application/x-www-form-urlencoded','content'=>http_build_query($data),'timeout'=>8,'ignore_errors'=>true]]);
  $res = @file_get_contents($url, false, $ctx);
  return [$res === false ? 0 : 200, $res, $res === false ? 'request failed' : ''];
}
function telegram_send($cfg, $text) {
  if (!$cfg['telegram_bot_token'] || !$cfg['telegram_chat_id']) return [false, 'Telegram credentials missing'];

  $url = 'https://api.telegram.org/bot'.$cfg['telegram_bot_token'].'/sendMessage';
  $payload = ['chat_id'=>$cfg['telegram_chat_id'], 'text'=>$text, 'parse_mode'=>'HTML', 'disable_web_page_preview'=>1];
  $errors = [];

  // Fast path first: on this server the system curl route is the reliable one.
  if (function_exists('shell_exec')) {
    $cmd = 'curl -sS --max-time 4 -X POST '
      . escapeshellarg($url)
      . ' -d '.escapeshellarg('chat_id='.$cfg['telegram_chat_id'])
      . ' --data-urlencode '.escapeshellarg('text='.$text)
      . ' -d '.escapeshellarg('parse_mode=HTML')
      . ' -d '.escapeshellarg('disable_web_page_preview=1')
      . ' 2>&1';
    $res0 = @shell_exec($cmd);
    if ($res0 !== null && strpos((string)$res0, '"ok":true') !== false) return [true, $res0];
    $errors[] = 'shell curl: '.($res0 === null ? 'disabled or no output' : $res0);
  } else {
    $errors[] = 'shell curl: shell_exec disabled';
  }

  // Fallback POST request.
  [$code, $res, $err] = http_post($url, $payload);
  if ($code >= 200 && $code < 300 && strpos((string)$res, '"ok":true') !== false) return [true, $res];
  $errors[] = 'POST: '.($err ?: ('HTTP '.$code.' '.$res));

  // Last fallback GET via PHP streams.
  $getUrl = $url.'?'.http_build_query($payload);
  $ctx = stream_context_create(['http'=>['method'=>'GET','timeout'=>4,'ignore_errors'=>true]]);
  $res2 = @file_get_contents($getUrl, false, $ctx);
  if ($res2 !== false && strpos((string)$res2, '"ok":true') !== false) return [true, $res2];
  $errors[] = 'GET stream: '.($res2 === false ? 'request failed' : $res2);

  return [false, implode(' | ', array_map(fn($e)=>substr((string)$e,0,500), $errors))];
}
function vk_api($method, $params, $token) {
  $params['access_token'] = $token; $params['v'] = '5.199';
  return http_post('https://api.vk.com/method/'.$method, $params);
}
function vk_send($cfg, $text) {
  if (!$cfg['vk_token']) return [false, 'VK token missing'];
  [$c1, $r1] = vk_api('users.get', ['user_ids'=>$cfg['vk_domain']], $cfg['vk_token']);
  $userId = null; $j = json_decode((string)$r1, true);
  if (isset($j['response'][0]['id'])) $userId = $j['response'][0]['id'];
  if (!$userId) return [false, 'VK user not resolved: '.$r1];
  [$code, $res, $err] = vk_api('messages.send', ['user_id'=>$userId, 'random_id'=>random_int(1, PHP_INT_MAX), 'message'=>$text], $cfg['vk_token']);
  $jr = json_decode((string)$res, true);
  return isset($jr['response']) ? [true, $res] : [false, $err ?: $res];
}
function smtp_read($fp) { $data=''; while($str=fgets($fp,515)){ $data.=$str; if(substr($str,3,1)==' ') break; } return $data; }
function smtp_cmd($fp, $cmd, $expect = null) { if ($cmd !== null) fwrite($fp, $cmd."\r\n"); $res = smtp_read($fp); if ($expect && substr($res,0,3) != $expect) throw new Exception('SMTP error: '.$res); return $res; }
function smtp_send($cfg, $subject, $body) {
  if (!$cfg['smtp_user'] || !$cfg['smtp_pass'] || !$cfg['mail_to']) throw new Exception('SMTP credentials missing');
  $fp = fsockopen('ssl://'.$cfg['smtp_host'], $cfg['smtp_port'], $errno, $errstr, 20);
  if (!$fp) throw new Exception("SMTP connect failed: $errstr ($errno)");
  smtp_cmd($fp, null, '220'); smtp_cmd($fp, 'EHLO crofton.local', '250'); smtp_cmd($fp, 'AUTH LOGIN', '334');
  smtp_cmd($fp, base64_encode($cfg['smtp_user']), '334'); smtp_cmd($fp, base64_encode($cfg['smtp_pass']), '235');
  smtp_cmd($fp, 'MAIL FROM:<'.$cfg['smtp_user'].'>', '250'); smtp_cmd($fp, 'RCPT TO:<'.$cfg['mail_to'].'>', '250'); smtp_cmd($fp, 'DATA', '354');
  $encodedSubject = '=?UTF-8?B?'.base64_encode($subject).'?=';
  $headers = ['From: '.$cfg['mail_from_name'].' <'.$cfg['smtp_user'].'>','To: <'.$cfg['mail_to'].'>','Subject: '.$encodedSubject,'MIME-Version: 1.0','Content-Type: text/plain; charset=UTF-8','Content-Transfer-Encoding: 8bit'];
  fwrite($fp, implode("\r\n", $headers)."\r\n\r\n".$body."\r\n.\r\n"); smtp_read($fp); smtp_cmd($fp, 'QUIT'); fclose($fp); return true;
}

$raw = file_get_contents('php://input');
$input = json_decode($raw, true);
if (!is_array($input)) $input = $_POST;

$product = clean($input['product'] ?? 'Заявка');
$name = clean($input['name'] ?? 'Без имени', 200);
$comment = clean($input['comment'] ?? 'без комментария');
$method = clean($input['method'] ?? 'telegram', 50);
$contact = clean($input['contact'] ?? '', 500);
$channel = clean($input['channel'] ?? ($method === 'phone' ? 'telegram' : $method), 50);
$source = clean($input['source'] ?? 'Сайт Crofton', 200);
$number = intval($input['number'] ?? 0);

if ($name === '') { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Имя обязательно'], JSON_UNESCAPED_UNICODE); exit; }
if (!is_valid_method($method)) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Неверный способ связи'], JSON_UNESCAPED_UNICODE); exit; }
if (!is_valid_contact($method, $contact)) { http_response_code(400); echo json_encode(['ok'=>false,'error'=>'Неверный контакт для выбранного способа связи'], JSON_UNESCAPED_UNICODE); exit; }
$contact = normalize_contact($method, $contact);

$leadFile = __DIR__.'/leads.json';
$leads = [];
if (file_exists($leadFile)) { $leads = json_decode(file_get_contents($leadFile), true); if (!is_array($leads)) $leads = []; }
if ($number <= 0) { $max = 0; foreach ($leads as $l) $max = max($max, intval($l['number'] ?? 0)); $number = $max + 1; }

$message = "Заявка №{$number}. {$product}. {$name}, {$comment}\nМетод связи: {$method}\nКонтакт: {$contact}\nИсточник: {$source}";
$lead = ['number'=>$number,'product'=>$product,'name'=>$name,'comment'=>$comment,'method'=>$method,'contact'=>$contact,'channel'=>$channel,'source'=>$source,'status'=>'Новая','createdAt'=>date('c'),'message'=>$message];
array_unshift($leads, $lead);

$results = [];
$warnings = [];
$saveError = '';
if (write_leads_file($leadFile, $leads, $saveError)) $results['saved'] = true;
else $warnings['save'] = $saveError;

$telegramText = "<b>🟡 Заявка №{$number}</b>

"
  . "<b>Продукт:</b> ".tg_escape($product)."
"
  . "<b>Имя:</b> ".tg_escape($name)."
"
  . "<b>Комментарий:</b> ".tg_escape($comment ?: 'без комментария')."

"
  . "<b>Связь:</b> ".tg_escape($method)."
"
  . "<b>Контакт:</b> ".tg_escape($contact)."
"
  . "<b>Источник:</b> ".tg_escape($source)."
"
  . "<b>Время:</b> ".date('d.m.Y H:i');
if (!empty($warnings['save'])) $telegramText .= "

⚠️ <b>Не сохранилась в админку:</b> ".tg_escape($warnings['save']);

$response = ['ok'=>true,'saved'=>!empty($results['saved']),'number'=>$number,'results'=>$results,'warnings'=>$warnings,'telegram'=>'queued'];
echo json_encode($response, JSON_UNESCAPED_UNICODE);
if (function_exists('fastcgi_finish_request')) {
  fastcgi_finish_request();
} else {
  @ob_flush(); @flush();
}

try {
  [$tgOk, $tgInfo] = telegram_send($CONFIG, $telegramText);
  if (!$tgOk) {
    $warnings['telegram'] = (string)$tgInfo;
    if (!empty($results['saved']) && isset($leads[0])) {
      $leads[0]['telegramError'] = (string)$tgInfo;
      @write_leads_file($leadFile, $leads, $tmpSaveError);
    }
  } else {
    if (!empty($results['saved']) && isset($leads[0])) {
      unset($leads[0]['telegramError']);
      $leads[0]['telegramSentAt'] = date('c');
      @write_leads_file($leadFile, $leads, $tmpSaveError);
    }
  }
  if ($channel === 'email') {
    try { smtp_send($CONFIG, 'Заявка Crofton №'.$number, $message); }
    catch (Throwable $e) {}
  } elseif ($channel === 'vk') {
    vk_send($CONFIG, $message);
  }
} catch (Throwable $e) {}
