import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = "t_p50854163_task_tracker_agent"


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    """CRUD API для задач агента: GET список, POST создание, PATCH обновление статуса, DELETE удаление."""

    cors = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    task_id = params.get("id")

    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)

    try:
        # GET — список задач
        if method == "GET":
            status_filter = params.get("status")
            if status_filter:
                cur.execute(
                    f"SELECT * FROM {SCHEMA}.tasks WHERE status = %s ORDER BY created_at DESC",
                    (status_filter,),
                )
            else:
                cur.execute(
                    f"SELECT * FROM {SCHEMA}.tasks ORDER BY created_at DESC"
                )
            rows = cur.fetchall()
            tasks = []
            for r in rows:
                t = dict(r)
                t["created_at"] = t["created_at"].isoformat() if t["created_at"] else None
                t["completed_at"] = t["completed_at"].isoformat() if t["completed_at"] else None
                t["reminder"] = str(t["reminder"])[:5] if t["reminder"] else None
                t["id"] = str(t["id"])
                tasks.append(t)
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"tasks": tasks})}

        # POST — создать задачу
        if method == "POST":
            body = json.loads(event.get("body") or "{}")
            title = body.get("title", "").strip()
            if not title:
                return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "title required"})}
            description = body.get("description", "")
            priority = body.get("priority", "medium")
            reminder = body.get("reminder") or None
            cur.execute(
                f"""INSERT INTO {SCHEMA}.tasks (title, description, priority, reminder)
                    VALUES (%s, %s, %s, %s) RETURNING *""",
                (title, description, priority, reminder),
            )
            row = dict(cur.fetchone())
            conn.commit()
            row["created_at"] = row["created_at"].isoformat() if row["created_at"] else None
            row["completed_at"] = row["completed_at"].isoformat() if row["completed_at"] else None
            row["reminder"] = str(row["reminder"])[:5] if row["reminder"] else None
            row["id"] = str(row["id"])
            return {"statusCode": 201, "headers": cors, "body": json.dumps({"task": row})}

        # PATCH — обновить статус
        if method == "PATCH":
            if not task_id:
                return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "id required"})}
            body = json.loads(event.get("body") or "{}")
            status = body.get("status")
            if status not in ("active", "done", "closed"):
                return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "invalid status"})}
            if status in ("done", "closed"):
                cur.execute(
                    f"UPDATE {SCHEMA}.tasks SET status = %s, completed_at = NOW() WHERE id = %s RETURNING *",
                    (status, task_id),
                )
            else:
                cur.execute(
                    f"UPDATE {SCHEMA}.tasks SET status = %s, completed_at = NULL WHERE id = %s RETURNING *",
                    (status, task_id),
                )
            row = cur.fetchone()
            conn.commit()
            if not row:
                return {"statusCode": 404, "headers": cors, "body": json.dumps({"error": "not found"})}
            row = dict(row)
            row["created_at"] = row["created_at"].isoformat() if row["created_at"] else None
            row["completed_at"] = row["completed_at"].isoformat() if row["completed_at"] else None
            row["reminder"] = str(row["reminder"])[:5] if row["reminder"] else None
            row["id"] = str(row["id"])
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"task": row})}

        # DELETE — удалить задачу
        if method == "DELETE":
            if not task_id:
                return {"statusCode": 400, "headers": cors, "body": json.dumps({"error": "id required"})}
            cur.execute(f"DELETE FROM {SCHEMA}.tasks WHERE id = %s", (task_id,))
            conn.commit()
            return {"statusCode": 200, "headers": cors, "body": json.dumps({"ok": True})}

        return {"statusCode": 405, "headers": cors, "body": json.dumps({"error": "method not allowed"})}

    finally:
        cur.close()
        conn.close()
