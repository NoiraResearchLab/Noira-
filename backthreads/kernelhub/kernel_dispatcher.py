from __future__ import annotations

import asyncio
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, Mapping, Optional, Protocol, Union

# Handler signatures
class SyncHandler(Protocol):
    def __call__(self, payload: Any, context: Optional[Mapping[str, Any]] = None) -> Any: ...

class AsyncHandler(Protocol):
    async def __call__(self, payload: Any, context: Optional[Mapping[str, Any]] = None) -> Any: ...

Handler = Union[SyncHandler, AsyncHandler]

# Simple logger protocol for DI
class Logger(Protocol):
    def info(self, msg: str, **meta: Any) -> None: ...
    def error(self, msg: str, **meta: Any) -> None: ...
    def debug(self, msg: str, **meta: Any) -> None: ...

class ConsoleLogger:
    def info(self, msg: str, **meta: Any) -> None:
        print({"level": "info", "msg": msg, "meta": meta})
    def error(self, msg: str, **meta: Any) -> None:
        print({"level": "error", "msg": msg, "meta": meta})
    def debug(self, msg: str, **meta: Any) -> None:
        print({"level": "debug", "msg": msg, "meta": meta})

# Custom exceptions
class TaskAlreadyRegistered(ValueError): ...
class TaskNotFound(KeyError): ...
class DispatchError(RuntimeError): ...

@dataclass
class TaskEntry:
    task_id: str
    handler: Handler
    description: Optional[str] = None
    tags: tuple[str, ...] = field(default_factory=tuple)

    @property
    def is_async(self) -> bool:
        return asyncio.iscoroutinefunction(self.handler)  # type: ignore[arg-type]

class KernelDispatcher:
    """
    A robust sync/async-aware dispatcher with metadata, replace/unregister,
    pre/post hooks, timeouts, and optional logging.
    """

    def __init__(self, logger: Optional[Logger] = None):
        self._registry: Dict[str, TaskEntry] = {}
        self._logger: Logger = logger or ConsoleLogger()
        self._pre_hook: Optional[Callable[[TaskEntry, Any, Optional[Mapping[str, Any]]], None]] = None
        self._post_hook: Optional[Callable[[TaskEntry, Any, Optional[Mapping[str, Any]]], None]] = None

    # Hooks
    def set_pre_hook(self, hook: Callable[[TaskEntry, Any, Optional[Mapping[str, Any]]], None]) -> None:
        self._pre_hook = hook

    def set_post_hook(self, hook: Callable[[TaskEntry, Any, Optional[Mapping[str, Any]]], None]) -> None:
        self._post_hook = hook

    # Registry ops
    def register(
        self,
        task_id: str,
        handler: Handler,
        *,
        replace: bool = False,
        description: Optional[str] = None,
        tags: Optional[list[str]] = None,
    ) -> None:
        if not task_id or not isinstance(task_id, str):
            raise ValueError("task_id must be a non-empty string")
        if (task_id in self._registry) and not replace:
            raise TaskAlreadyRegistered(f"Task '{task_id}' is already registered")
        self._registry[task_id] = TaskEntry(
            task_id=task_id,
            handler=handler,
            description=description,
            tags=tuple(tags or ()),
        )
        self._logger.info("task_registered", task_id=task_id, replace=replace)

    def unregister(self, task_id: str) -> bool:
        existed = task_id in self._registry
        self._registry.pop(task_id, None)
        if existed:
            self._logger.info("task_unregistered", task_id=task_id)
        return existed

    def describe(self, task_id: str) -> TaskEntry:
        entry = self._registry.get(task_id)
        if not entry:
            raise TaskNotFound(f"No handler found for task '{task_id}'")
        return entry

    def available_tasks(self) -> list[str]:
        return sorted(self._registry.keys())

    # Sync dispatch (runs sync handlers directly; runs async handlers in event loop)
    def dispatch(
        self,
        task_id: str,
        payload: Any,
        *,
        context: Optional[Mapping[str, Any]] = None,
        timeout: Optional[float] = None,
    ) -> Any:
        entry = self._registry.get(task_id)
        if not entry:
            raise TaskNotFound(f"No handler found for task '{task_id}'")

        self._logger.debug("dispatch_start", task_id=task_id, is_async=entry.is_async)

        try:
            if self._pre_hook:
                self._pre_hook(entry, payload, context)

            if entry.is_async:
                # Run async handler from sync context with timeout if provided
                coro = entry.handler(payload, context)  # type: ignore[call-arg]
                result = asyncio.run(asyncio.wait_for(coro, timeout=timeout) if timeout else coro)
            else:
                # Sync handler with no timeout at Python level
                result = entry.handler(payload, context)  # type: ignore[call-arg]

            if self._post_hook:
                self._post_hook(entry, result, context)

            self._logger.debug("dispatch_end", task_id=task_id)
            return result
        except asyncio.TimeoutError as e:
            self._logger.error("dispatch_timeout", task_id=task_id, timeout=timeout)
            raise DispatchError(f"Task '{task_id}' timed out after {timeout}s") from e
        except Exception as e:
            self._logger.error("dispatch_error", task_id=task_id, error=str(e))
            raise

    # Pure async dispatch (recommended if you are already in an event loop)
    async def adispatch(
        self,
        task_id: str,
        payload: Any,
        *,
        context: Optional[Mapping[str, Any]] = None,
        timeout: Optional[float] = None,
    ) -> Any:
        entry = self._registry.get(task_id)
        if not entry:
            raise TaskNotFound(f"No handler found for task '{task_id}'")

        self._logger.debug("adispatch_start", task_id=task_id, is_async=entry.is_async)
        try:
            if self._pre_hook:
                self._pre_hook(entry, payload, context)

            if entry.is_async:
                coro = entry.handler(payload, context)  # type: ignore[call-arg]
                result = await (asyncio.wait_for(coro, timeout=timeout) if timeout else coro)
            else:
                # Run sync handler in a thread pool to avoid blocking the loop
                loop = asyncio.get_running_loop()
                result = await loop.run_in_executor(None, entry.handler, payload, context)  # type: ignore[arg-type]

            if self._post_hook:
                self._post_hook(entry, result, context)

            self._logger.debug("adispatch_end", task_id=task_id)
            return result
        except asyncio.TimeoutError as e:
            self._logger.error("adispatch_timeout", task_id=task_id, timeout=timeout)
            raise DispatchError(f"Task '{task_id}' timed out after {timeout}s") from e
        except Exception as e:
            self._logger.error("adispatch_error", task_id=task_id, error=str(e))
            raise
