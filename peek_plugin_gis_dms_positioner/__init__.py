

from peek_plugin_base.client.PluginClientEntryHookABC import PluginClientEntryHookABC
from typing import Type

__version__ = '0.7.9.3'


def peekClientEntryHook() -> Type[PluginClientEntryHookABC]:
    from ._private.client.ClientEntryHook import ClientEntryHook
    return ClientEntryHook
