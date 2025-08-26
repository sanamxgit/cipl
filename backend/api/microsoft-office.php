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
        
        // Only validate page fields if not handling video actions
        if (!isset($input['action'])) {
            // Treat as full page update only; ignore any incidental video_* fields

            // Validate presence of required keys (allow empty strings)
            $requiredFields = ['title', 'subtitle', 'main_heading', 'main_description', 'plans'];
            foreach ($requiredFields as $field) {
                if (!array_key_exists($field, $input)) {
                    throw new Exception("Field '$field' is required");
                }
            }

            try {
                $conn->beginTransaction();

                $sql = "INSERT INTO microsoft_office_page 
                    (id, title, subtitle, banner_image, is_image_url, main_heading, 
                    main_description, floating_icons, plans, microsoft_logo) 
                    VALUES (1, :title, :subtitle, :banner_image, :is_image_url, :main_heading,
                    :main_description, :floating_icons, :plans, :microsoft_logo)
                    ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    subtitle = VALUES(subtitle),
                    banner_image = VALUES(banner_image),
                    is_image_url = VALUES(is_image_url),
                    main_heading = VALUES(main_heading),
                    main_description = VALUES(main_description),
                    floating_icons = VALUES(floating_icons),
                    plans = VALUES(plans),
                    microsoft_logo = VALUES(microsoft_logo)";

                $stmt = $conn->prepare($sql);

                $params = [
                    ':title' => (string)($input['title'] ?? ''),
                    ':subtitle' => (string)($input['subtitle'] ?? ''),
                    ':banner_image' => (string)($input['banner_image'] ?? ''),
                    ':is_image_url' => !empty($input['isImageUrl']) ? 1 : 0,
                    ':main_heading' => (string)($input['main_heading'] ?? ''),
                    ':main_description' => (string)($input['main_description'] ?? ''),
                    ':floating_icons' => json_encode($input['floating_icons'] ?? []),
                    ':plans' => json_encode($input['plans'] ?? []),
                    ':microsoft_logo' => (string)($input['microsoftLogo'] ?? '/images/microsoft-logo.png')
                ];

                $result = $stmt->execute($params);

                if (!$result) {
                    throw new Exception('Database query failed: ' . implode(' ', $stmt->errorInfo()));
                }

                $conn->commit();

                echo json_encode([
                    'status' => 'success',
                    'message' => 'Page updated successfully'
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

                // Build a normalized response shape expected by the frontend
                $normalized = [
                    'id' => $data['id'] ?? null,
                    'title' => $data['title'] ?? '',
                    'subtitle' => $data['subtitle'] ?? '',
                    'banner_image' => $data['banner_image'] ?? '',
                    'is_image_url' => (string)($data['is_image_url'] ?? '0'),
                    'main_heading' => $data['main_heading'] ?? '',
                    'main_description' => $data['main_description'] ?? '',
                    'floating_icons' => $data['floating_icons'],
                    'plans' => $data['plans'],
                    // map snake_case to camelCase for frontend
                    'microsoftLogo' => $data['microsoft_logo'] ?? '',
                    'created_at' => $data['created_at'] ?? null,
                    'updated_at' => $data['updated_at'] ?? null,
                    // Videos array loaded from videos table
                    'videos' => [],
                    'features' => $data['features']
                ];

                // Load videos from dedicated table
                $normalized['videos'] = getMicrosoftVideos();

                $data = $normalized;
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