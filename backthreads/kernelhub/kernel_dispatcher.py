from typing import Callable, Dict, Any

class KernelDispatcher:
    def __init__(self):
        self._registry: Dict[str, Callable[[Any], Any]] = {}

    def register(self, task_id: str, handler: Callable[[Any], Any]) -> None:
        if task_id in self._registry:
            raise ValueError(f"Task '{task_id}' already registered.")
        self._registry[task_id] = handler

    def dispatch(self, task_id: str, payload: Any) -> Any:
        if task_id not in self._registry:
            raise KeyError(f"No handler found for task '{task_id}'")
        return self._registry[task_id](payload)

    def available_tasks(self) -> list:
        return list(self._registry.keys())
