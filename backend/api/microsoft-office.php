<?php
header('Content-Type: application/json');
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
            // Validate required fields for page update
            $requiredFields = ['title', 'subtitle', 'main_heading', 'main_description', 'plans'];
            foreach ($requiredFields as $field) {
                if (!isset($input[$field]) || empty($input[$field])) {
                    throw new Exception("Field '$field' is required");
                }
            }
            
            try {
                $conn->beginTransaction();

                $sql = "INSERT INTO microsoft_office_page 
                    (id, title, subtitle, banner_image, is_image_url, main_heading, 
                    main_description, floating_icons, plans, microsoft_logo,
                    video_title, video_description, video_url, video_thumbnail_url) 
                    VALUES (1, :title, :subtitle, :banner_image, :is_image_url, :main_heading,
                    :main_description, :floating_icons, :plans, :microsoft_logo,
                    :video_title, :video_description, :video_url, :video_thumbnail_url)
                    ON DUPLICATE KEY UPDATE
                    title = VALUES(title),
                    subtitle = VALUES(subtitle),
                    banner_image = VALUES(banner_image),
                    is_image_url = VALUES(is_image_url),
                    main_heading = VALUES(main_heading),
                    main_description = VALUES(main_description),
                    floating_icons = VALUES(floating_icons),
                    plans = VALUES(plans),
                    microsoft_logo = VALUES(microsoft_logo),
                    video_title = VALUES(video_title),
                    video_description = VALUES(video_description),
                    video_url = VALUES(video_url),
                    video_thumbnail_url = VALUES(video_thumbnail_url)";

                $stmt = $conn->prepare($sql);

                $params = [
                    ':title' => $input['title'],
                    ':subtitle' => $input['subtitle'],
                    ':banner_image' => $input['banner_image'] ?? '',
                    ':is_image_url' => $input['isImageUrl'] ? 1 : 0,
                    ':main_heading' => $input['main_heading'],
                    ':main_description' => $input['main_description'],
                    ':floating_icons' => json_encode($input['floating_icons'] ?? []),
                    ':plans' => json_encode($input['plans']),
                    ':microsoft_logo' => $input['microsoftLogo'] ?? '/images/microsoft-logo.png',
                    ':video_title' => $input['video_title'] ?? '',
                    ':video_description' => $input['video_description'] ?? '',
                    ':video_url' => $input['video_url'] ?? '',
                    ':video_thumbnail_url' => $input['video_thumbnail_url'] ?? ''
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
                // Decode JSON fields
                $data['floating_icons'] = json_decode($data['floating_icons'], true) ?? [];
                $data['plans'] = json_decode($data['plans'], true) ?? [
                    'home' => ['title' => 'For Home', 'cards' => []],
                    'business' => ['title' => 'For Business', 'cards' => []]
                ];
                $data['features'] = json_decode($data['features'], true) ?? [];

                // Clean and validate video URL
                if (!empty($data['video_url'])) {
                    $data['video_url'] = filter_var(trim($data['video_url']), FILTER_SANITIZE_URL);
                    
                    // Set proper headers for CORS
                    header('Access-Control-Allow-Origin: *');
                    header('Access-Control-Allow-Methods: GET');
                    header('Access-Control-Allow-Headers: Content-Type');
                    
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