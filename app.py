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
        body="Hello! This is a test email from your Photobooth app."
    )
    mail.send(msg)
    return "Email sent!"

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/booth")
def booth():
    return render_template("booth.html")


@app.route("/template_select")
def template_select():
    return render_template("template_select.html")


@app.route("/filters", methods=["POST"])
def filters():
    template_id = request.form.get("template_id")
    session["template_id"] = template_id
    return render_template("filters.html", template_id=template_id)


@app.route("/capture", methods=["POST"])
def capture():
    filter_type = request.form.get("filter")
    session["filter_type"] = filter_type
    return render_template("capture.html",
                           template_id=session.get("template_id"),
                           filter_type=filter_type)

@app.route("/email", methods=["GET", "POST"])
def email_page():
    from flask_mail import Message
    import base64

    # GET: show first page expecting the base64 to be posted
    if request.method == "GET":
        return render_template("email.html", mode="capture")

    # POST: could be first POST (with photostrip_data) or second POST (with email)
    photostrip_data = request.form.get("photostrip_data")
    user_email = request.form.get("email")

    # --- FIRST POST: store photostrip and show email input ---
    if photostrip_data and not user_email:
        if "," not in photostrip_data:
            return "Error: Invalid photostrip data", 400

        session["photostrip_data"] = photostrip_data
        return render_template("email.html", mode="enter_email")

    # --- SECOND POST: has email but no new photostrip data ---
    if user_email:
        photostrip_data = session.get("photostrip_data")
        if not photostrip_data:
            return "Error: No photostrip data", 400

        header, encoded = photostrip_data.split(",", 1)
        binary = base64.b64decode(encoded)

        msg = Message(
            "Your Photostrip",
            recipients=[user_email],
            body="Thanks for using our photobooth!"
        )
        msg.attach("photostrip.png", "image/png", binary)
        mail.send(msg)

        return redirect(url_for("thank_page"))

    return "Error: Unexpected request", 400

# @app.route("/email", methods=["POST"])
# def email_page():
#     # receives final photostrip as base64
#     # photostrip_data = request.form.get("photostrip_data")
#     # session["photostrip_data"] = photostrip_data
#     session["photostrip_data"] = localStorage.getItem("last_photostrip")
#     return render_template("email.html")

# @app.route("/email", methods=["GET", "POST"])
# def email_page():
#     if request.method == "POST":
#         photostrip_data = request.form.get("photostrip_data")
#         session["photostrip_data"] = photostrip_data
#         return redirect(url_for("enter_email"))  # next step where user types email

#     return render_template("email.html")  # initial GET

# @app.route("/email", methods=["GET", "POST"])
# def email_page():
#     if request.method == "POST":
#         # Receive BASE64 data from hidden input
#         photostrip_data = request.form.get("photostrip_data", "")

#         if "," not in photostrip_data:
#             print("Invalid photostrip_data:", photostrip_data)
#             return "Error: Invalid photostrip data", 400

#         header, encoded = photostrip_data.split(",", 1)

#         session["photostrip_data"] = photostrip_data
#         return redirect(url_for("enter_email"))

#     return render_template("thanks.html")

# @app.route("/enter_email", methods=["GET", "POST"])
# def enter_email():
#     return render_template("enter_email.html")



# @app.route("/send", methods=["POST"])
# def send_email():
#     email = request.form.get("email")
#     data_url = session.get("photostrip_data")

#     if not data_url:
#         return "Error: no photostrip data", 400

#     # Extract base64 w/o header
#     # img_bytes = base64.b64decode(data_url.split(",")[1])

#     msg = Message("Your Photostrip!", recipients=[email])
#     msg.body = "Thanks for using our PhotoBooth!"
#     # msg.attach("photostrip.png", "image/png", img_bytes)
#     with app.open_resource("generated_strip.png") as fp:
#         msg.attach("photostrip.png", "image/png", fp.read())

#     mail.send(msg)

#     return redirect(url_for("thanks"))

@app.route("/send_email", methods=["POST"])
def send_email_route():
    email = request.form.get("email")
    photostrip_data = session.get("photostrip_data")

    # decode + attach below ...
    import base64
    from flask_mail import Message

    header, encoded = photostrip_data.split(",", 1)
    binary = base64.b64decode(encoded)

    msg = Message("Your Photostrip", recipients=[email])
    msg.body = "Thanks for using our photobooth!"
    msg.attach("photostrip.png", "image/png", binary)
    mail.send(msg)

    return redirect(url_for("thank_page"))

@app.route("/thank")
def thank_page():
    return render_template("thanks.html")



if __name__ == "__main__":
    app.run(debug=True)
