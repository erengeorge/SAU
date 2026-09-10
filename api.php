<?php
require_once __DIR__ . '/config.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $_REQUEST['action'] ?? ($input['action'] ?? '');

function param($key, $input, $default = null) {
    return $input[$key] ?? ($_REQUEST[$key] ?? $default);
}

try {
    switch ($action) {

        // ---------- INITIAL LOAD ----------
        case 'get_all': {
            $data = [];
            $data['complaints'] = $pdo->query("SELECT * FROM complaints ORDER BY created_at DESC")->fetchAll();
            $data['documents'] = $pdo->query("SELECT * FROM documents ORDER BY created_at DESC")->fetchAll();
            $data['records'] = $pdo->query("SELECT * FROM student_records ORDER BY name ASC")->fetchAll();
            $data['visitors'] = $pdo->query("SELECT * FROM visitors ORDER BY created_at DESC")->fetchAll();
            $data['tasks'] = $pdo->query("SELECT * FROM tasks ORDER BY done ASC, due_date ASC")->fetchAll();
            $data['departments'] = $pdo->query("SELECT * FROM departments ORDER BY name ASC")->fetchAll();
            $data['confiscated_ids'] = $pdo->query("SELECT * FROM confiscated_ids ORDER BY status ASC, created_at DESC")->fetchAll();

            $activities = $pdo->query("SELECT * FROM department_activities ORDER BY activity_date ASC")->fetchAll();
            $reqStmt = $pdo->prepare("SELECT * FROM activity_requirements WHERE activity_id = ?");
            foreach ($activities as &$act) {
                $reqStmt->execute([$act['id']]);
                $act['requirements'] = $reqStmt->fetchAll();
            }
            $data['activities'] = $activities;

            echo json_encode(['ok' => true, 'data' => $data]);
            break;
        }

        // ---------- COMPLAINTS ----------
        case 'add_complaint': {
            $stmt = $pdo->prepare("INSERT INTO complaints (name, course, type, description, status, date_added) VALUES (?,?,?,?,?,CURDATE())");
            $stmt->execute([
                param('name', $input), param('course', $input), param('type', $input, 'Complaint'),
                param('description', $input), 'open'
            ]);
            echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
            break;
        }
        case 'update_complaint_status': {
            $stmt = $pdo->prepare("UPDATE complaints SET status = ? WHERE id = ?");
            $stmt->execute([param('status', $input), param('id', $input)]);
            echo json_encode(['ok' => true]);
            break;
        }
        case 'delete_complaint': {
            $pdo->prepare("DELETE FROM complaints WHERE id = ?")->execute([param('id', $input)]);
            echo json_encode(['ok' => true]);
            break;
        }

        // ---------- DOCUMENT TRACKING (incoming / outgoing papers) ----------
        case 'add_document': {
            $stmt = $pdo->prepare("INSERT INTO documents (direction, tracking_no, subject, party, date_logged, status, notes) VALUES (?,?,?,?,CURDATE(),'pending',?)");
            $stmt->execute([
                param('direction', $input, 'incoming'), param('tracking_no', $input),
                param('subject', $input), param('party', $input), param('notes', $input)
            ]);
            echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
            break;
        }
        case 'update_document_status': {
            $stmt = $pdo->prepare("UPDATE documents SET status = ? WHERE id = ?");
            $stmt->execute([param('status', $input), param('id', $input)]);
            echo json_encode(['ok' => true]);
            break;
        }
        case 'delete_document': {
            $pdo->prepare("DELETE FROM documents WHERE id = ?")->execute([param('id', $input)]);
            echo json_encode(['ok' => true]);
            break;
        }

        // ---------- STUDENT RECORDS ----------
        case 'add_record': {
            $stmt = $pdo->prepare("INSERT INTO student_records (name, student_id, course, contact, notes) VALUES (?,?,?,?,?)");
            $stmt->execute([
                param('name', $input), param('student_id', $input), param('course', $input),
                param('contact', $input), param('notes', $input)
            ]);
            echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
            break;
        }
        case 'delete_record': {
            $pdo->prepare("DELETE FROM student_records WHERE id = ?")->execute([param('id', $input)]);
            echo json_encode(['ok' => true]);
            break;
        }

        // ---------- VISITORS ----------
        case 'add_visitor': {
            $stmt = $pdo->prepare("INSERT INTO visitors (name, purpose, visit_time, visit_date) VALUES (?,?,?,CURDATE())");
            $stmt->execute([param('name', $input), param('purpose', $input), param('visit_time', $input) ?: null]);
            echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
            break;
        }
        case 'delete_visitor': {
            $pdo->prepare("DELETE FROM visitors WHERE id = ?")->execute([param('id', $input)]);
            echo json_encode(['ok' => true]);
            break;
        }

        // ---------- TASKS ----------
        case 'add_task': {
            $stmt = $pdo->prepare("INSERT INTO tasks (title, due_date, done) VALUES (?,?,0)");
            $stmt->execute([param('title', $input), param('due_date', $input) ?: null]);
            echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
            break;
        }
        case 'toggle_task': {
            $stmt = $pdo->prepare("UPDATE tasks SET done = ? WHERE id = ?");
            $stmt->execute([param('done', $input) ? 1 : 0, param('id', $input)]);
            echo json_encode(['ok' => true]);
            break;
        }
        case 'delete_task': {
            $pdo->prepare("DELETE FROM tasks WHERE id = ?")->execute([param('id', $input)]);
            echo json_encode(['ok' => true]);
            break;
        }

        // ---------- CONFISCATED IDS ----------
        case 'add_confiscated_id': {
            $stmt = $pdo->prepare("INSERT INTO confiscated_ids (student_name, student_id_no, reason, date_confiscated, status) VALUES (?,?,?,CURDATE(),'held')");
            $stmt->execute([param('student_name', $input), param('student_id_no', $input), param('reason', $input)]);
            echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
            break;
        }
        case 'release_confiscated_id': {
            $stmt = $pdo->prepare("UPDATE confiscated_ids SET status = 'released', date_released = CURDATE(), released_by = ?, release_reason = ? WHERE id = ?");
            $stmt->execute([param('released_by', $input), param('release_reason', $input), param('id', $input)]);
            echo json_encode(['ok' => true]);
            break;
        }
        case 'delete_confiscated_id': {
            $pdo->prepare("DELETE FROM confiscated_ids WHERE id = ?")->execute([param('id', $input)]);
            echo json_encode(['ok' => true]);
            break;
        }

        // ---------- GLOBAL SEARCH ----------
        case 'search_all': {
            $q = '%' . param('q', $input, '') . '%';
            $results = [];

            $stmt = $pdo->prepare("SELECT id, name AS title, description AS subtitle FROM complaints WHERE name LIKE ? OR description LIKE ? LIMIT 8");
            $stmt->execute([$q, $q]);
            foreach ($stmt->fetchAll() as $row) {
                $results[] = ['type' => 'complaints', 'id' => $row['id'], 'title' => $row['title'], 'subtitle' => $row['subtitle']];
            }

            $stmt = $pdo->prepare("SELECT id, name AS title, CONCAT_WS(' · ', student_id, course) AS subtitle FROM student_records WHERE name LIKE ? OR student_id LIKE ? OR course LIKE ? LIMIT 8");
            $stmt->execute([$q, $q, $q]);
            foreach ($stmt->fetchAll() as $row) {
                $results[] = ['type' => 'records', 'id' => $row['id'], 'title' => $row['title'], 'subtitle' => $row['subtitle']];
            }

            $stmt = $pdo->prepare("SELECT id, subject AS title, CONCAT_WS(' · ', tracking_no, party) AS subtitle FROM documents WHERE subject LIKE ? OR tracking_no LIKE ? OR party LIKE ? LIMIT 8");
            $stmt->execute([$q, $q, $q]);
            foreach ($stmt->fetchAll() as $row) {
                $results[] = ['type' => 'documents', 'id' => $row['id'], 'title' => $row['title'], 'subtitle' => $row['subtitle']];
            }

            $stmt = $pdo->prepare("SELECT id, student_name AS title, CONCAT_WS(' · ', student_id_no, reason) AS subtitle FROM confiscated_ids WHERE student_name LIKE ? OR student_id_no LIKE ? OR reason LIKE ? LIMIT 8");
            $stmt->execute([$q, $q, $q]);
            foreach ($stmt->fetchAll() as $row) {
                $results[] = ['type' => 'confiscated', 'id' => $row['id'], 'title' => $row['title'], 'subtitle' => $row['subtitle']];
            }

            echo json_encode(['ok' => true, 'results' => $results]);
            break;
        }

        // ---------- DEPARTMENTS (settings) ----------
        case 'add_department': {
            $stmt = $pdo->prepare("INSERT INTO departments (name, color) VALUES (?, ?)");
            $stmt->execute([param('name', $input), param('color', $input, '#1f6f5c')]);
            echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
            break;
        }
        case 'update_department': {
            $stmt = $pdo->prepare("UPDATE departments SET name = ?, color = ? WHERE id = ?");
            $stmt->execute([param('name', $input), param('color', $input), param('id', $input)]);
            echo json_encode(['ok' => true]);
            break;
        }
        case 'delete_department': {
            $pdo->prepare("DELETE FROM departments WHERE id = ?")->execute([param('id', $input)]);
            echo json_encode(['ok' => true]);
            break;
        }

        // ---------- DEPARTMENT ACTIVITIES ----------
        case 'add_activity': {
            $stmt = $pdo->prepare("INSERT INTO department_activities (department, activity_name, activity_date, notes) VALUES (?,?,?,?)");
            $stmt->execute([
                param('department', $input), param('activity_name', $input),
                param('activity_date', $input) ?: null, param('notes', $input)
            ]);
            $activityId = $pdo->lastInsertId();

            $requirements = $input['requirements'] ?? [];
            if (is_array($requirements) && count($requirements)) {
                $reqStmt = $pdo->prepare("INSERT INTO activity_requirements (activity_id, requirement_name, submitted) VALUES (?,?,0)");
                foreach ($requirements as $reqName) {
                    $reqName = trim($reqName);
                    if ($reqName !== '') {
                        $reqStmt->execute([$activityId, $reqName]);
                    }
                }
            }
            echo json_encode(['ok' => true, 'id' => $activityId]);
            break;
        }
        case 'delete_activity': {
            $pdo->prepare("DELETE FROM department_activities WHERE id = ?")->execute([param('id', $input)]);
            echo json_encode(['ok' => true]);
            break;
        }
        case 'add_requirement': {
            $stmt = $pdo->prepare("INSERT INTO activity_requirements (activity_id, requirement_name, submitted) VALUES (?,?,0)");
            $stmt->execute([param('activity_id', $input), param('requirement_name', $input)]);
            echo json_encode(['ok' => true, 'id' => $pdo->lastInsertId()]);
            break;
        }
        case 'toggle_requirement': {
            $stmt = $pdo->prepare("UPDATE activity_requirements SET submitted = ? WHERE id = ?");
            $stmt->execute([param('submitted', $input) ? 1 : 0, param('id', $input)]);
            echo json_encode(['ok' => true]);
            break;
        }
        case 'delete_requirement': {
            $pdo->prepare("DELETE FROM activity_requirements WHERE id = ?")->execute([param('id', $input)]);
            echo json_encode(['ok' => true]);
            break;
        }

        default:
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'Unknown action.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => $e->getMessage()]);
}