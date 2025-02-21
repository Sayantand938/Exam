# from app import create_app
# import webbrowser
# import threading
# import time
# import os

# app = create_app()

# def open_browser():
#     time.sleep(1)
#     webbrowser.open('http://127.0.0.1:5000/')

# if __name__ == '__main__':
#     # Check if it's the main process (not the reloader)
#     if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':
#         browser_thread = threading.Thread(target=open_browser)
#         browser_thread.daemon = True
#         browser_thread.start()

#     app.run(debug=True)




from app import create_app
import webbrowser
import threading
import time
import os
import subprocess  # Import the subprocess module

app = create_app()

def run_node_script(script_path):
    """Runs a Node.js script using subprocess.

    Args:
        script_path: The path to the Node.js script.

    Returns:
        True if the script ran successfully, False otherwise.
    """
    try:
        # Use subprocess.run with error checking.
        result = subprocess.run(
            ["node", script_path],  # Command to run
            check=True,  # Raise an exception if the command fails
            capture_output=True,  # Capture stdout and stderr
            text=True,  # Decode output as text
        )
        print(f"Node script output:\n{result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error running Node script: {e}")
        print(f"  Return code: {e.returncode}")
        print(f"  Stdout: {e.stdout}")
        print(f"  Stderr: {e.stderr}")
        return False
    except FileNotFoundError:
        print(f"Error: Node.js (node) not found.  Ensure Node.js is installed and in your system's PATH.")
        return False


def open_browser():
    """Opens the default web browser to the application's URL."""
    time.sleep(1)  # Give the server a moment to start
    webbrowser.open('http://127.0.0.1:5000/')


if __name__ == '__main__':
    # Only run data conversion and browser opening in the main process
    if os.environ.get('WERKZEUG_RUN_MAIN') == 'true':

        # --- Data Conversion ---
        project_root = os.path.dirname(os.path.abspath(__file__))  # Get project root
        convert_2_json_path = os.path.join(project_root, "scripts", "convert_2_json.js")
        convert_2_text_path = os.path.join(project_root, "scripts", "convert_2_text.js")
        json_file_name = "Custom_Study_Session.json" # Not used directly here, but kept for clarity


        # Run convert_2_json.js
        print("Running convert_2_json.js...")
        if run_node_script(convert_2_json_path):
            print("convert_2_json.js completed successfully.")
        else:
            print("convert_2_json.js failed.  Exiting.")
            exit(1)  # Exit if data conversion fails

        #Optionally Run convert_2_text.js, if needed (uncomment to enable)
        print("Running convert_2_text.js...")
        if run_node_script(convert_2_text_path):
           print("convert_2_text.js completed successfully.")
        else:
           print("convert_2_text.js failed. Exiting.")
           exit(1)



        # --- Browser Opening ---
        browser_thread = threading.Thread(target=open_browser)
        browser_thread.daemon = True  # Allow the main thread to exit even if this thread is running
        browser_thread.start()

    # --- Flask App Start ---
    app.run(debug=True)