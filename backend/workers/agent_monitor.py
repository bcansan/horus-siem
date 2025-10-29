from celery import Celery
from datetime import datetime, timedelta
from backend.config import get_db_connection
import os


broker_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")
celery = Celery("horus", broker=broker_url, backend=broker_url)


@celery.task(name="check_offline_agents")
def check_offline_agents():
    conn = get_db_connection()
    cursor = conn.cursor()
    offline_threshold = datetime.now() - timedelta(minutes=5)
    cursor.execute(
        """
        UPDATE agents 
        SET status = 'offline', updated_at = NOW()
        WHERE last_heartbeat < %s AND status = 'online'
        RETURNING agent_name, hostname
        """,
        (offline_threshold,),
    )
    offline_agents = cursor.fetchall()
    conn.commit()
    cursor.close()
    conn.close()
    return {"offline_agents": len(offline_agents)}


celery.conf.beat_schedule = {
    'check-offline-agents': {
        'task': 'check_offline_agents',
        'schedule': 60.0,
    }
}


