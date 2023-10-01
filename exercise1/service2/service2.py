from flask import Flask, request
import datetime
import os

app = Flask(__name__)

# Set the log file name
log_file = "/usr/src/logs/service2.log"
# log_file = "/var/log/logs/service2.log"


os.makedirs(os.path.dirname(log_file), exist_ok=True)


@app.route("/", methods=["GET"])
def handle_request():
    try:
        if "message" in request.args:
            message = request.args["message"]
            timestamp = datetime.datetime.utcnow().isoformat() + "Z"
            remote_address = request.remote_addr + ":" + \
                str(request.environ.get("REMOTE_PORT"))
            log_message = f"{message} {timestamp} {remote_address}\n"

            # Write the log message to the log file
            with open(log_file, "a") as f:
                f.write(log_message)

            # If the received text was "STOP," close the log file and exit
            if message == "STOP":
                with open(log_file, "a") as f:
                    f.write("Service 2 stopped\n")
                return "Service 2 stopped\n"

            return log_message

        return "Invalid request", 400

    except Exception as e:
        error_message = f"Internal Server Error: {str(e)}"
        with open(log_file, "a") as f:
            f.write(error_message + "\n")
        return error_message, 500


if __name__ == "__main__":
    app.run(host="172.20.0.2", port=8000)
