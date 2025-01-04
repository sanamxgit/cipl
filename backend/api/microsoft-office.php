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
                    (id, title, subtitle, banner_image, is_image_url, main_heading, main_description, floating_icons, plans, microsoft_logo) 
                    VALUES (1, :title, :subtitle, :banner_image, :is_image_url, :main_heading, :main_description, :floating_icons, :plans, :microsoft_logo)
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
                    ':title' => $input['title'],
                    ':subtitle' => $input['subtitle'],
                    ':banner_image' => $input['banner_image'] ?? '',
                    ':is_image_url' => $input['isImageUrl'] ? 1 : 0,
                    ':main_heading' => $input['main_heading'],
                    ':main_description' => $input['main_description'],
                    ':floating_icons' => json_encode($input['floating_icons'] ?? []),
                    ':plans' => json_encode($input['plans']),
                    ':microsoft_logo' => $input['microsoftLogo'] ?? '/images/microsoft-logo.png'
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
        $stmt = $conn->prepare("SELECT * FROM microsoft_office_page WHERE id = 1");
        $stmt->execute();
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            // Return default values if no data exists
            $data = [
                'title' => 'Get started with Microsoft Office 365 today',
                'subtitle' => 'Collaborate, create, and achieve more with the world\'s leading productivity suite.',
                'banner_image' => '',
                'is_image_url' => false,
                'main_heading' => 'Unlock productivity, creativity, and generative AI for your organization.',
                'main_description' => 'Microsoft 365 empowers your employees to do their best work with the power of generative AI in the apps they use daily.',
                'floating_icons' => '[]',
                'plans' => '{"home":{"title":"For Home","cards":[]},"business":{"title":"For Business","cards":[]}}',
                'microsoft_logo' => '/images/microsoft-logo.png'
            ];
        }

        // Decode JSON fields
        $data['floating_icons'] = json_decode($data['floating_icons'], true) ?? [];
        $data['plans'] = json_decode($data['plans'], true);
        
        // Ensure microsoftLogo field is present
        $data['microsoftLogo'] = $data['microsoft_logo'] ?? '/images/microsoft-logo.png';

        $videos = getMicrosoftVideos();
        error_log('Fetched videos: ' . print_r($videos, true));  // Debug log

        $data['videos'] = $videos;

        echo json_encode([
            'status' => 'success',
            'data' => $data
        ]);
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
    $stmt = $conn->prepare("SELECT * FROM microsoft_videos ORDER BY sort_order ASC");
    $stmt->execute();
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

function addMicrosoftVideo($data) {
    global $conn;
    $stmt = $conn->prepare("INSERT INTO microsoft_videos (title, description, video_url, thumbnail_url, sort_order) VALUES (?, ?, ?, ?, ?)");
    return $stmt->execute([
        $data['title'],
        $data['description'],
        $data['video_url'],
        $data['thumbnail_url'],
        $data['sort_order']
    ]);
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