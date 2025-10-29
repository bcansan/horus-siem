import smtplib
from email.mime.text import MIMEText
import os


def send_email(subject: str, body: str, to_email: str):
    server = os.getenv("SMTP_SERVER")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASSWORD")

    if not server or not user or not password:
        return False

    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = user
    msg["To"] = to_email

    with smtplib.SMTP(server, port) as s:
        s.starttls()
        s.login(user, password)
        s.sendmail(user, [to_email], msg.as_string())
    return True


