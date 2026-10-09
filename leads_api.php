<?php
// Server-side leads API for Crofton admin panel.
// Uses JSON files on the server as the lead database.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
session_start();

if (empty($_SESSION['crofton_admin'])) {
  http_response_code(401);
  echo json_encode(['ok'=>false,'error'=>'Unauthorized'], JSON_UNESCAPED_UNICODE);
  exit;
}

$LEADS_FILE = __DIR__ . '/leads.json';
$TRASH_FILE = __DIR__ . '/leads_trash.json';

function read_json_file($file) {
  if (!file_exists($file)) return [];
  $data = json_decode(file_get_contents($file), true);
  return is_array($data) ? $data : [];
}
function write_json_file($file, $data) {
  $json = json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
  if ($json === false) throw new Exception('JSON encode failed');
  if (@file_put_contents($file, $json) !== false) return;
  $fp = @fopen($file, 'c+');
  if ($fp) {
    @rewind($fp); @ftruncate($fp, 0);
    $written = @fwrite($fp, $json);
    @fflush($fp); @fclose($fp);
    if ($written !== false) return;
  }
  $tmp = @tempnam(dirname($file), basename($file).'.tmp.');
  if ($tmp) {
    if (@file_put_contents($tmp, $json) !== false && @rename($tmp, $file)) return;
    @unlink($tmp);
  }
  throw new Exception('Cannot write '.basename($file));
}
function input_json() {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : $_POST;
}
function find_index_by_number($items, $number) {
  foreach ($items as $i => $item) {
    if ((string)($item['number'] ?? '') === (string)$number) return $i;
  }
  return -1;
}

$action = $_GET['action'] ?? ($_POST['action'] ?? 'list');
$leads = read_json_file($LEADS_FILE);
$trash = read_json_file($TRASH_FILE);

foreach ($leads as &$lead) {
  if (empty($lead['status'])) $lead['status'] = 'Новая';
}
unset($lead);

try {
  if ($action === 'list') {
    // Do not write on list: listing must work even if filesystem permissions are temporarily broken.
    echo json_encode(['ok'=>true,'leads'=>$leads,'trash'=>$trash], JSON_UNESCAPED_UNICODE);
    exit;
  }

  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok'=>false,'error'=>'POST required'], JSON_UNESCAPED_UNICODE);
    exit;
  }

  $data = input_json();
  $number = $data['number'] ?? null;

  if ($action === 'status') {
    $status = trim((string)($data['status'] ?? 'Новая'));
    if (!in_array($status, ['Новая', 'В процессе', 'Выполнено'], true)) $status = 'Новая';
    $idx = find_index_by_number($leads, $number);
    if ($idx < 0) throw new Exception('Lead not found');
    $leads[$idx]['status'] = $status;
    $leads[$idx]['updatedAt'] = date('c');
    write_json_file($LEADS_FILE, $leads);
    echo json_encode(['ok'=>true,'leads'=>$leads,'trash'=>$trash], JSON_UNESCAPED_UNICODE);
    exit;
  }


  if ($action === 'rename') {
    $idx = find_index_by_number($leads, $number);
    if ($idx < 0) throw new Exception('Lead not found');
    $product = trim((string)($data['product'] ?? 'Заявка'));
    if ($product === '') $product = 'Заявка';
    $leads[$idx]['product'] = strip_tags($product);
    $leads[$idx]['updatedAt'] = date('c');
    write_json_file($LEADS_FILE, $leads);
    echo json_encode(['ok'=>true,'leads'=>$leads,'trash'=>$trash], JSON_UNESCAPED_UNICODE);
    exit;
  }

  if ($action === 'delete') {
    $idx = find_index_by_number($leads, $number);
    if ($idx < 0) throw new Exception('Lead not found');
    $item = $leads[$idx];
    $item['deletedAt'] = date('c');
    array_splice($leads, $idx, 1);
    array_unshift($trash, $item);
    write_json_file($LEADS_FILE, $leads);
    write_json_file($TRASH_FILE, $trash);
    echo json_encode(['ok'=>true,'leads'=>$leads,'trash'=>$trash], JSON_UNESCAPED_UNICODE);
    exit;
  }

  if ($action === 'restore') {
    $idx = find_index_by_number($trash, $number);
    if ($idx < 0) throw new Exception('Trash item not found');
    $item = $trash[$idx];
    unset($item['deletedAt']);
    if (empty($item['status'])) $item['status'] = 'Новая';
    array_splice($trash, $idx, 1);
    array_unshift($leads, $item);
    write_json_file($TRASH_FILE, $trash);
    write_json_file($LEADS_FILE, $leads);
    echo json_encode(['ok'=>true,'leads'=>$leads,'trash'=>$trash], JSON_UNESCAPED_UNICODE);
    exit;
  }

  if ($action === 'hard_delete') {
    $idx = find_index_by_number($trash, $number);
    if ($idx < 0) throw new Exception('Trash item not found');
    array_splice($trash, $idx, 1);
    write_json_file($TRASH_FILE, $trash);
    echo json_encode(['ok'=>true,'leads'=>$leads,'trash'=>$trash], JSON_UNESCAPED_UNICODE);
    exit;
  }

  http_response_code(400);
  echo json_encode(['ok'=>false,'error'=>'Unknown action'], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
}
