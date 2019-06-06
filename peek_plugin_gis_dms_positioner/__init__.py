

from peek_plugin_base.client.PluginClientEntryHookABC import PluginClientEntryHookABC
from typing import Type

__version__ = '1.3.1.1'


def peekClientEntryHook() -> Type[PluginClientEntryHookABC]:
    from ._private.client.ClientEntryHook import ClientEntryHook
    return ClientEntryHook
