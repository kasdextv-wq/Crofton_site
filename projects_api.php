<?php
// Server-side projects API for Crofton.
// Public list endpoint; authenticated save/upload endpoints.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }
session_start();

$PROJECTS_FILE = __DIR__ . '/projects.json';
$UPLOAD_DIR = __DIR__ . '/uploads/projects';
$UPLOAD_URL = 'uploads/projects';

function read_json_file($file, $fallback = []) {
  if (!file_exists($file)) return $fallback;
  $data = json_decode(file_get_contents($file), true);
  return is_array($data) ? $data : $fallback;
}
function write_json_file($file, $data) {
  $tmp = $file . '.tmp';
  file_put_contents($tmp, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), LOCK_EX);
  rename($tmp, $file);
}
function input_json() {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true);
  return is_array($data) ? $data : $_POST;
}
function slugify($value) {
  $value = function_exists('mb_strtolower') ? mb_strtolower((string)$value, 'UTF-8') : strtolower((string)$value);
  $value = preg_replace('~[^\pL\d]+~u', '-', $value);
  $value = trim($value, '-');
  return $value ?: ('project-' . time());
}
function normalise_state($state) {
  $projects = isset($state['projects']) && is_array($state['projects']) ? $state['projects'] : [];
  $projects = array_values(array_map(function($p) {
    $title = trim((string)($p['title'] ?? 'Новый проект'));
    $id = trim((string)($p['id'] ?? '')) ?: slugify($title) . '-' . substr(md5(uniqid('', true)), 0, 6);
    $images = isset($p['images']) && is_array($p['images']) ? array_values(array_filter(array_map('trim', $p['images']))) : [];
    return [
      'id' => $id,
      'title' => $title,
      'category' => trim((string)($p['category'] ?? 'Веб-сайт')),
      'description' => trim((string)($p['description'] ?? '')),
      'task' => trim((string)($p['task'] ?? '')),
      'result' => trim((string)($p['result'] ?? '')),
      'format' => trim((string)($p['format'] ?? '')),
      'images' => $images ?: ['uploads/projects/img1.jpg']
    ];
  }, $projects));
  if (!$projects) $projects = read_json_file(__DIR__.'/projects.json', ['projects'=>[]])['projects'] ?? [];
  $ids = array_map(fn($p) => $p['id'], $projects);
  $showcase = isset($state['showcaseIds']) && is_array($state['showcaseIds']) ? array_values($state['showcaseIds']) : array_slice($ids, 0, 3);
  $showcase = array_values(array_filter($showcase, fn($id) => in_array($id, $ids, true)));
  while (count($showcase) < 3 && isset($ids[count($showcase)])) $showcase[] = $ids[count($showcase)];
  $defaultTestimonials = [
    ['text'=>'Студия создала для нас не просто сайт, а полноценный инструмент продаж. Конверсия выросла в 2.5 раза за первый месяц.','author'=>'Алексей Морозов','position'=>'CEO, TechStart'],
    ['text'=>'Профессиональный подход на всех этапах. Ребята не только разработали визуал, но и помогли с позиционированием бренда.','author'=>'Екатерина Волкова','position'=>'Основатель, Beauty Lab'],
    ['text'=>'Наконец-то нашли команду, которая понимает бизнес-задачи и создаёт дизайн, который работает на результат.','author'=>'Дмитрий Соколов','position'=>'CMO, Retail Group']
  ];
  $testimonials = isset($state['testimonials']) && is_array($state['testimonials']) ? $state['testimonials'] : $defaultTestimonials;
  $testimonials = array_values(array_map(function($t) {
    return [
      'text' => trim((string)($t['text'] ?? '')),
      'author' => trim((string)($t['author'] ?? '')),
      'position' => trim((string)($t['position'] ?? '')),
      'avatar' => trim((string)($t['avatar'] ?? '')),
      'workType' => trim((string)($t['workType'] ?? ''))
    ];
  }, $testimonials));
  if (!$testimonials) $testimonials = $defaultTestimonials;
  return ['showcaseIds' => array_slice($showcase, 0, 3), 'projects' => $projects, 'testimonials' => $testimonials];
}

function optimise_uploaded_image($tmp, $mime, $destBase) {
  // Optimise large uploaded raster images. Keeps SVG as-is.
  if ($mime === 'image/svg+xml') return [false, null];
  if (!function_exists('imagecreatetruecolor')) return [false, null];
  $src = null;
  if ($mime === 'image/jpeg') $src = @imagecreatefromjpeg($tmp);
  elseif ($mime === 'image/png') $src = @imagecreatefrompng($tmp);
  elseif ($mime === 'image/webp' && function_exists('imagecreatefromwebp')) $src = @imagecreatefromwebp($tmp);
  else return [false, null];
  if (!$src) return [false, null];
  $w = imagesx($src); $h = imagesy($src);
  $maxW = 1600; $maxH = 1200;
  $ratio = min(1, $maxW / max(1, $w), $maxH / max(1, $h));
  $nw = max(1, (int)round($w * $ratio));
  $nh = max(1, (int)round($h * $ratio));
  $dst = imagecreatetruecolor($nw, $nh);
  imagealphablending($dst, false);
  imagesavealpha($dst, true);
  imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
  if (function_exists('imagewebp')) {
    $file = $destBase . '.webp';
    imagewebp($dst, $file, 82);
    imagedestroy($src); imagedestroy($dst);
    return [true, $file];
  }
  $file = $destBase . '.jpg';
  imagejpeg($dst, $file, 82);
  imagedestroy($src); imagedestroy($dst);
  return [true, $file];
}

function require_admin() {
  if (empty($_SESSION['crofton_admin'])) {
    http_response_code(401);
    echo json_encode(['ok'=>false,'error'=>'Unauthorized'], JSON_UNESCAPED_UNICODE);
    exit;
  }
}

$action = $_GET['action'] ?? 'list';

try {
  if ($action === 'list') {
    $state = normalise_state(read_json_file($PROJECTS_FILE, ['showcaseIds'=>[], 'projects'=>[]]));
    echo json_encode(['ok'=>true] + $state, JSON_UNESCAPED_UNICODE);
    exit;
  }

  require_admin();

  if ($action === 'save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = input_json();
    $state = normalise_state($data);
    write_json_file($PROJECTS_FILE, $state);
    echo json_encode(['ok'=>true] + $state, JSON_UNESCAPED_UNICODE);
    exit;
  }

  if ($action === 'upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!is_dir($UPLOAD_DIR)) mkdir($UPLOAD_DIR, 0775, true);
    if (empty($_FILES['images'])) throw new Exception('No files uploaded');
    $files = $_FILES['images'];
    $urls = [];
    $allowed = ['image/jpeg'=>'jpg', 'image/png'=>'png', 'image/webp'=>'webp', 'image/gif'=>'gif', 'image/svg+xml'=>'svg'];
    $count = is_array($files['name']) ? count($files['name']) : 1;
    for ($i=0; $i<$count; $i++) {
      $name = is_array($files['name']) ? $files['name'][$i] : $files['name'];
      $tmp = is_array($files['tmp_name']) ? $files['tmp_name'][$i] : $files['tmp_name'];
      $err = is_array($files['error']) ? $files['error'][$i] : $files['error'];
      if ($err !== UPLOAD_ERR_OK) continue;
      $mime = mime_content_type($tmp) ?: '';
      if (!isset($allowed[$mime])) continue;
      $base = preg_replace('~[^a-zA-Z0-9_-]+~', '-', pathinfo($name, PATHINFO_FILENAME));
      $nameBase = ($base ?: 'image') . '-' . date('YmdHis') . '-' . substr(md5(uniqid('', true)), 0, 6);
      [$optimised, $optimisedPath] = optimise_uploaded_image($tmp, $mime, $UPLOAD_DIR . '/' . $nameBase);
      if ($optimised && $optimisedPath) {
        $urls[] = $UPLOAD_URL . '/' . basename($optimisedPath);
        continue;
      }
      $file = $nameBase . '.' . $allowed[$mime];
      $dest = $UPLOAD_DIR . '/' . $file;
      if (!move_uploaded_file($tmp, $dest)) continue;
      $urls[] = $UPLOAD_URL . '/' . $file;
    }
    echo json_encode(['ok'=>true,'urls'=>$urls], JSON_UNESCAPED_UNICODE);
    exit;
  }

  http_response_code(400);
  echo json_encode(['ok'=>false,'error'=>'Unknown action'], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok'=>false,'error'=>$e->getMessage()], JSON_UNESCAPED_UNICODE);
}
