import time
import threading
from typing import Callable

class LoopbackThread:
    def __init__(self, interval_sec: int, label: str, callback: Callable[[], None]):
        self.interval_sec = interval_sec
        self.label = label
        self.callback = callback
        self.thread = threading.Thread(target=self._run, daemon=True)
        self._running = False

    def _run(self):
        while self._running:
            try:
                self.callback()
            except Exception as e:
                print(f"[{self.label}] error: {e}")
            time.sleep(self.interval_sec)

    def start(self):
        if not self._running:
            self._running = True
            self.thread.start()
            print(f"[{self.label}] loopback started.")

    def stop(self):
        self._running = False
        print(f"[{self.label}] loopback stopped.")
