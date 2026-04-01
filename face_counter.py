"""
face_counter.py

Install:
  pip install opencv-python Flask flask-cors

Run:
  python face_counter.py

API:
  GET http://127.0.0.1:5000/api/face-count
  -> {"count": 3}
"""

from __future__ import annotations

import signal
import sys
import threading
import time
from dataclasses import dataclass

import cv2
from flask import Flask, jsonify
from flask_cors import CORS


@dataclass
class SharedState:
    face_count: int = 0
    last_updated_ts: float = 0.0
    running: bool = True


state = SharedState()
lock = threading.Lock()


def _best_effort_set_face_count(count: int) -> None:
    now = time.time()
    with lock:
        state.face_count = int(count)
        state.last_updated_ts = now


def _get_face_count() -> int:
    with lock:
        return int(state.face_count)


def _set_running(value: bool) -> None:
    with lock:
        state.running = bool(value)


def _is_running() -> bool:
    with lock:
        return bool(state.running)


def camera_worker(
    camera_index: int = 0,
    detect_every_n_frames: int = 2,
    min_face_size: tuple[int, int] = (60, 60),
    scale_factor: float = 1.1,
    min_neighbors: int = 5,
) -> None:
    """
    Capture frames from webcam and update face_count continuously.
    Runs in a background thread.
    """
    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    face_cascade = cv2.CascadeClassifier(cascade_path)
    if face_cascade.empty():
        raise RuntimeError(f"Failed to load Haar cascade at: {cascade_path}")

    cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW if sys.platform.startswith("win") else 0)
    if not cap.isOpened():
        raise RuntimeError(
            f"Could not open camera index {camera_index}. "
            f"Try setting camera_index=1 or closing other apps using the camera."
        )

    # Reduce latency; safe no-ops on some backends.
    cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)

    frame_i = 0
    last_printed = None

    try:
        while _is_running():
            ok, frame = cap.read()
            if not ok or frame is None:
                time.sleep(0.05)
                continue

            frame_i += 1
            if frame_i % max(1, detect_every_n_frames) != 0:
                continue

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            gray = cv2.equalizeHist(gray)

            faces = face_cascade.detectMultiScale(
                gray,
                scaleFactor=scale_factor,
                minNeighbors=min_neighbors,
                minSize=min_face_size,
                flags=cv2.CASCADE_SCALE_IMAGE,
            )

            count = int(len(faces))
            _best_effort_set_face_count(count)

            if count != last_printed:
                print(f"[face_counter] face_count={count}")
                last_printed = count

            # Small sleep prevents CPU overuse on high-FPS cameras.
            time.sleep(0.01)
    finally:
        cap.release()


app = Flask(__name__)
CORS(app)


@app.get("/api/face-count")
def api_face_count():
    return jsonify({"count": _get_face_count()})


def _handle_shutdown(_sig, _frame) -> None:
    print("[face_counter] Shutting down...")
    _set_running(False)


def main() -> None:
    signal.signal(signal.SIGINT, _handle_shutdown)
    signal.signal(signal.SIGTERM, _handle_shutdown)

    worker = threading.Thread(target=camera_worker, name="camera_worker", daemon=True)
    worker.start()

    # Flask dev server is OK for local exhibition LAN. Use threaded=True for concurrency.
    # Note: This call blocks until interrupted.
    try:
        app.run(host="127.0.0.1", port=5000, debug=False, threaded=True, use_reloader=False)
    finally:
        _set_running(False)
        worker.join(timeout=2.0)


if __name__ == "__main__":
    main()

