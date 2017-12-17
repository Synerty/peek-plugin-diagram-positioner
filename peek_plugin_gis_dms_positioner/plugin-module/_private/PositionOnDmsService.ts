import { Injectable, Optional } from "@angular/core";
import { Observable, Subject } from "rxjs";
import {
    DiagramItemPopupContextI,
    DiagramItemPopupService
} from "@peek/peek_plugin_diagram/DiagramItemPopupService";

import { gisDiagramModelSetKey } from "@peek/peek_plugin_gis_diagram/_private/PluginNames";

import { DmsDiagramPositionService } from "@peek/peek_plugin_pof_diagram/DmsDiagramPositionService";

/** Position On DMS Service
 *
 * This service will position on the DMS diagram.
 *
 */
@Injectable()
export class PositionOnDmsService {

    private _subject = new Subject<DiagramItemPopupContextI>();

    constructor(private diagramService: DiagramItemPopupService,
        private dmsPos: DmsDiagramPositionService) {
        this.diagramService
            .itemPopupObservable()
            .subscribe((context: DiagramItemPopupContextI) => {
                if (context.modelSetKey != gisDiagramModelSetKey)
                    return;

                this.addLocateOnDmsMenu(context);
            });

    }


    private addLocateOnDmsMenu(context: DiagramItemPopupContextI): void {
        if (this.dmsPos == null)
            return;

        this.dmsPos.canPositionByKey(context.key)
            .then((value) => {
                if (!value)
                    return;

                context.addMenuItem({
                    name: "Locate in DMS Diagram",
                    tooltip: null,
                    icon: 'map-marker',
                    callback: () => this.dmsPos.positionByKey(context.key),
                    children: []
                });

            });
    }

}