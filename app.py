from flask import Flask, render_template, request, redirect, url_for, session
from flask_mail import Mail, Message
import base64
from config import Config
from dotenv import load_dotenv

load_dotenv() 

app = Flask(__name__)
app.config.from_object(Config)
mail = Mail(app)

@app.route("/send_test_email")
def send_test_email():
    msg = Message(
        subject="Photobooth Test Email",
        recipients=["ivanwu010@gmail.com"],
        # body="Happy New Year🧧✨ \n\nThank you for celebrating with us and capturing this moment. \n\nDon’t forget to tag us on Instagram (https://www.instagram.com/groningen.tsa?igsh=amJ4ZXFra2hmZTRy) if you post your photo 📸 \n\nWarm wishes, \n\neveryone at GTSA + Charlie Bear"
    )
    msg.html = """
    <h1>Happy New Year 🧧✨</h1>
    <p>Thank you for celebrating with us and capturing this moment.</p>

    <p>
        Don’t forget to tag us on 
        <a href="https://www.instagram.com/groningen.tsa?igsh=amJ4ZXFra2hmZTRy">Instagram</a> 
        if you post your photo 📸
    </p>

    <p>Warm wishes,</p>
    <p>everyone at GTSA + Charlie Bear</p>
    """
    mail.send(msg)
    return "Email sent!"

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/booth")
def booth():
    # Home page already handles the coin + curtain animation.
    return redirect(url_for("template_select"))


@app.route("/template_select")
def template_select():
    return render_template("template_select.html")


@app.route("/filters", methods=["GET", "POST"])
def filters():
    if request.method == "POST":
        template_id = request.form.get("template_id")
    else:
        template_id = request.args.get("template_id") or session.get("template_id")

    if not template_id:
        return redirect(url_for("template_select"))

    session["template_id"] = template_id
    return render_template("filters.html", template_id=template_id)


@app.route("/capture", methods=["GET", "POST"])
def capture():
    template_id = session.get("template_id") or request.form.get("template_id")
    if not template_id:
        return redirect(url_for("template_select"))

    if request.method == "POST":
        filter_type = request.form.get("filter") or "none"
        session["filter_type"] = filter_type
    else:
        filter_type = session.get("filter_type") or "none"

    return render_template("capture.html", template_id=template_id, filter_type=filter_type)

@app.route("/email", methods=["GET", "POST"])
def email_page():
    # IMPORTANT: Flask's default session is cookie-based. Do NOT store base64 images in session.
    if request.method == "GET":
        return render_template("email.html")

    user_email = request.form.get("email")
    photostrip_data = request.form.get("photostrip_data")

    if not user_email:
        return "Error: Missing email", 400

    if not photostrip_data or "," not in photostrip_data:
        return "Error: Missing/invalid photostrip data", 400

    header, encoded = photostrip_data.split(",", 1)
    try:
        binary = base64.b64decode(encoded)
    except Exception:
        return "Error: Could not decode image", 400

    msg = Message(
        "Happy CNY! Your GTSA Photostrip is Here! 📸",
        recipients=[user_email],
        # body="Happy New Year🧧✨ \n Thank you for celebrating with us and capturing this moment. \n Don’t forget to tag us on Instagram (https://www.instagram.com/groningen.tsa?igsh=amJ4ZXFra2hmZTRy)if you post your photo 📸 \n Warm wishes, \n everyone at GTSA + Charlie Bear"
    )
    msg.html = """
    <h1>Happy New Year 🧧✨</h1>
    <p>Thank you for celebrating with us and capturing this moment.</p>

    <p>
        Don’t forget to tag us on 
        <a href="https://www.instagram.com/groningen.tsa?igsh=amJ4ZXFra2hmZTRy">Instagram</a> 
        if you post your photo 📸
    </p>

    <p>Warm wishes,</p>
    <p>everyone at GTSA + Charlie Bear</p>
    """
    msg.attach("photostrip.png", "image/png", binary)
    mail.send(msg)

    return redirect(url_for("thank_page"))

@app.route("/thank")
def thank_page():
    return render_template("thanks.html")



if __name__ == "__main__":
    import os
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=os.environ.get("FLASK_DEBUG", "False").lower() == "true"
    )
