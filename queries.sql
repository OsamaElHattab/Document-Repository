
-- 1. Get all documents accessible to a user in their department. -------------------------------------------------

    -- Only documents from the user’s department.
    -- Skip private documents as they are private to other users.
    -- Include documents that are either:
    --      uploaded by someone in the same department and marked as "department" or "public", OR
    --      explicitly shared with the department in document_department_permissions.

    SELECT DISTINCT d.*
    FROM documents d
    JOIN users u ON u.id = :user_id
    LEFT JOIN users uploader ON uploader.id = d.uploader_id
    LEFT JOIN document_department_permissions ddp ON ddp.document_id = d.id AND ddp.department_id = u.department_id
    WHERE d.access_level != 'private'
    AND (
            (d.access_level = 'department' AND uploader.department_id = u.department_id)
        OR ddp.id IS NOT NULL
        );



-- 2. Get the 10 most recently uploaded documents tagged as Finance.-----------------------------------------------

    -- a) If we mean document creation order:
        SELECT d.*
        FROM documents d
        JOIN document_tags dt ON dt.document_id = d.id
        JOIN tags t ON t.id = dt.tag_id
        WHERE t.name = 'Finance'
        ORDER BY d.created_at DESC
        LIMIT 10;

    --b) If we instead mean last uploaded versions in general even if there are more than one version per document:
        SELECT d.*
        FROM documents d
        JOIN document_tags dt ON dt.document_id = d.id
        JOIN tags t ON t.id = dt.tag_id
        JOIN document_versions v ON v.document_id = d.id
        WHERE t.name = 'Finance'
        ORDER BY v.uploaded_at DESC
        LIMIT 10;



-- 3. Find all versions of a given document (by document ID). -----------------------------------------------------

    SELECT v.*
    FROM document_versions v
    WHERE v.document_id = :doc_id
    ORDER BY v.version_number ASC;



-- 4. Get the number of documents uploaded by each department in the last 30 days. --------------------------------

    SELECT d.department_id, COUNT(*) AS document_count
    FROM documents d
    WHERE d.created_at >= NOW() - INTERVAL '30 days'
    GROUP BY d.department_id
    ORDER BY document_count DESC;