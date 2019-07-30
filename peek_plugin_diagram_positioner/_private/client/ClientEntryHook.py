import logging

from peek_plugin_base.client.PluginClientEntryHookABC import PluginClientEntryHookABC

logger = logging.getLogger(__name__)


class ClientEntryHook(PluginClientEntryHookABC):

    def load(self) -> None:
        logger.debug("Loaded")

    def start(self):
        logger.debug("Started")

    def stop(self):
        logger.debug("Stopped")

    def unload(self):
        logger.debug("Unloaded")
