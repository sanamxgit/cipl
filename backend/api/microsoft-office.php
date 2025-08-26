<?php
// Load CORS helper if present; otherwise set minimal CORS headers inline
if (file_exists(__DIR__ . '/cors.php')) {
    require_once __DIR__ . '/cors.php';
    setCorsHeaders();
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Authorization');
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json; charset=UTF-8');
}

// Early response to CORS preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

require_once '../config/database.php';

// Create database connection
$database = new Database();
$conn = $database->getConnection();

if (!$conn) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed'
    ]);
    exit;
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Handle video actions first
        if (isset($input['action'])) {
            switch ($input['action']) {
                case 'add_video':
                    // Validate video fields
                    if (!isset($input['title']) || !isset($input['video_url']) || !isset($input['thumbnail_url'])) {
                        throw new Exception('Required video fields are missing');
                    }
                    
                    $result = addMicrosoftVideo([
                        'title' => $input['title'],
                        'description' => $input['description'] ?? '',
                        'video_url' => $input['video_url'],
                        'thumbnail_url' => $input['thumbnail_url'],
                        'sort_order' => (int)($input['sort_order'] ?? 0)
                    ]);
                    
                    if ($result) {
                        echo json_encode([
                            'status' => 'success',
                            'message' => 'Video added successfully'
                        ]);
                    } else {
                        throw new Exception('Failed to add video');
                    }
                    exit;

                case 'update_video':
                    if (!isset($input['video_id'])) {
                        throw new Exception('Video ID is required');
                    }
                    
                    $result = updateMicrosoftVideo(
                        $input['video_id'],
                        [
                            'title' => $input['title'],
                            'description' => $input['description'],
                            'video_url' => $input['video_url'],
                            'thumbnail_url' => $input['thumbnail_url'],
                            'sort_order' => (int)($input['sort_order'] ?? 0)
                        ]
                    );
                    
                    if ($result) {
                        echo json_encode([
                            'status' => 'success',
                            'message' => 'Video updated successfully'
                        ]);
                    } else {
                        throw new Exception('Failed to update video');
                    }
                    exit;

                case 'delete_video':
                    if (!isset($input['video_id'])) {
                        throw new Exception('Video ID is required');
                    }
                    
                    $result = deleteMicrosoftVideo($input['video_id']);
                    
                    if ($result) {
                        echo json_encode([
                            'status' => 'success',
                            'message' => 'Video deleted successfully'
                        ]);
                    } else {
                        throw new Exception('Failed to delete video');
                    }
                    exit;
            }
        }
        
        // Only page updates (no explicit action) – allow partial updates
        if (!isset($input['action'])) {
            try {
                $conn->beginTransaction();

                // Ensure base row exists
                $conn->exec("INSERT IGNORE INTO microsoft_office_page (id) VALUES (1)");

                // Map acceptable input keys to DB columns and transformers
                $fieldMap = [
                    'title' => ['col' => 'title'],
                    'subtitle' => ['col' => 'subtitle'],
                    'banner_image' => ['col' => 'banner_image'],
                    'isImageUrl' => ['col' => 'is_image_url', 'transform' => fn($v) => $v ? 1 : 0],
                    'main_heading' => ['col' => 'main_heading'],
                    'main_description' => ['col' => 'main_description'],
                    'floating_icons' => ['col' => 'floating_icons', 'transform' => fn($v) => json_encode($v ?? [])],
                    'plans' => ['col' => 'plans', 'transform' => fn($v) => json_encode($v ?? [])],
                    'microsoftLogo' => ['col' => 'microsoft_logo'],
                    'video_title' => ['col' => 'video_title'],
                    'video_description' => ['col' => 'video_description'],
                    'video_url' => ['col' => 'video_url'],
                    'video_thumbnail_url' => ['col' => 'video_thumbnail_url']
                ];

                $updateParts = [];
                $params = [];

                foreach ($fieldMap as $inputKey => $info) {
                    if (array_key_exists($inputKey, $input)) {
                        $col = $info['col'];
                        $val = $input[$inputKey];
                        if (isset($info['transform']) && is_callable($info['transform'])) {
                            $val = $info['transform']($val);
                        }
                        $updateParts[] = "$col = :$col";
                        $params[":$col"] = $val;
                    }
                }

                if (empty($updateParts)) {
                    // Nothing to update
                    $conn->commit();
                    echo json_encode([
                        'status' => 'success',
                        'message' => 'No changes provided'
                    ]);
                    exit;
                }

                $sql = "UPDATE microsoft_office_page SET " . implode(', ', $updateParts) . " WHERE id = 1";
                $stmt = $conn->prepare($sql);
                $result = $stmt->execute($params);

                if (!$result) {
                    throw new Exception('Database query failed: ' . implode(' ', $stmt->errorInfo()));
                }

                $conn->commit();

                // Return the latest state
                $fetch = $conn->prepare("SELECT * FROM microsoft_office_page WHERE id = 1");
                $fetch->execute();
                $latest = $fetch->fetch(PDO::FETCH_ASSOC);

                if ($latest) {
                    $latest['floating_icons'] = isset($latest['floating_icons']) ? (json_decode($latest['floating_icons'], true) ?? []) : [];
                    $latest['plans'] = isset($latest['plans']) ? (json_decode($latest['plans'], true) ?? [
                        'home' => ['title' => 'For Home', 'cards' => []],
                        'business' => ['title' => 'For Business', 'cards' => []]
                    ]) : [
                        'home' => ['title' => 'For Home', 'cards' => []],
                        'business' => ['title' => 'For Business', 'cards' => []]
                    ];
                    $latest['features'] = isset($latest['features']) ? (json_decode($latest['features'], true) ?? []) : [];
                }

                echo json_encode([
                    'status' => 'success',
                    'message' => 'Page updated successfully',
                    'data' => $latest
                ]);

            } catch (PDOException $e) {
                $conn->rollBack();
                throw new Exception('Database error: ' . $e->getMessage());
            }
        }
    }
    else if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        try {
            $stmt = $conn->prepare("SELECT * FROM microsoft_office_page WHERE id = 1");
            $stmt->execute();
            $data = $stmt->fetch(PDO::FETCH_ASSOC);
            
            error_log('Raw database data: ' . print_r($data, true));

            if ($data) {
                // Decode JSON fields safely
                $data['floating_icons'] = isset($data['floating_icons']) ? (json_decode($data['floating_icons'], true) ?? []) : [];
                $data['plans'] = isset($data['plans']) ? (json_decode($data['plans'], true) ?? [
                    'home' => ['title' => 'For Home', 'cards' => []],
                    'business' => ['title' => 'For Business', 'cards' => []]
                ]) : [
                    'home' => ['title' => 'For Home', 'cards' => []],
                    'business' => ['title' => 'For Business', 'cards' => []]
                ];
                $data['features'] = isset($data['features']) ? (json_decode($data['features'], true) ?? []) : [];

                // Clean and validate video URL
                if (!empty($data['video_url'])) {
                    $data['video_url'] = filter_var(trim($data['video_url']), FILTER_SANITIZE_URL);
                    
                    // Verify if URL is accessible and get content type
                    $headers = get_headers($data['video_url'], 1);
                    if ($headers) {
                        error_log('Content-Type: ' . ($headers['Content-Type'] ?? 'unknown'));
                    }
                }

                error_log('Processed video data: ' . json_encode([
                    'video_url' => $data['video_url'] ?? null,
                    'video_title' => $data['video_title'] ?? '',
                    'video_description' => $data['video_description'] ?? ''
                ]));
            }

            echo json_encode([
                'status' => 'success',
                'data' => $data
            ]);
        } catch (Exception $e) {
            error_log('Error in GET request: ' . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }
    else {
        throw new Exception('Invalid request method');
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
} 

// Add these functions to handle videos

function getMicrosoftVideos() {
    global $conn;
    try {
        $stmt = $conn->prepare("SELECT * FROM microsoft_videos ORDER BY sort_order ASC");
        $stmt->execute();
        $videos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Debug log
        error_log('Videos from database: ' . print_r($videos, true));
        
        return $videos;
    } catch (PDOException $e) {
        error_log('Database error: ' . $e->getMessage());
        return [];
    }
}

function addMicrosoftVideo($data) {
    global $conn;
    try {
        // Debug log
        error_log('Adding video with data: ' . print_r($data, true));
        
        $stmt = $conn->prepare("INSERT INTO microsoft_videos (title, description, video_url, thumbnail_url, sort_order) VALUES (?, ?, ?, ?, ?)");
        $result = $stmt->execute([
            $data['title'],
            $data['description'],
            $data['video_url'],
            $data['thumbnail_url'],
            $data['sort_order']
        ]);
        
        if ($result) {
            error_log('Video added successfully with ID: ' . $conn->lastInsertId());
        } else {
            error_log('Failed to add video. Error: ' . print_r($stmt->errorInfo(), true));
        }
        
        return $result;
    } catch (PDOException $e) {
        error_log('Database error adding video: ' . $e->getMessage());
        throw $e;
    }
}

function updateMicrosoftVideo($id, $data) {
    global $conn;
    $stmt = $conn->prepare("UPDATE microsoft_videos SET title = ?, description = ?, video_url = ?, thumbnail_url = ?, sort_order = ? WHERE id = ?");
    return $stmt->execute([
        $data['title'],
        $data['description'],
        $data['video_url'],
        $data['thumbnail_url'],
        $data['sort_order'],
        $id
    ]);
}

function deleteMicrosoftVideo($id) {
    global $conn;
    $stmt = $conn->prepare("DELETE FROM microsoft_videos WHERE id = ?");
    return $stmt->execute([$id]);
} 