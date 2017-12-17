import { Injectable, Optional } from "@angular/core";
import { Observable, Subject } from "rxjs";
import {
    DiagramItemPopupContextI,
    DiagramItemPopupService
} from "@peek/peek_plugin_diagram/DiagramItemPopupService";

import { pofDiagramModelSetKey } from "@peek/peek_plugin_pof_diagram/_private/PluginNames";

import { GisDiagramPositionService } from "@peek/peek_plugin_gis_diagram/GisDiagramPositionService";

/** Position On GIS Service
 *
 * This service will position on the GIS diagram.
 *
 */
@Injectable()
export class PositionOnGisService {

    constructor(private diagramService: DiagramItemPopupService,
        private gisPos: GisDiagramPositionService) {
        this.diagramService
            .itemPopupObservable()
            .subscribe((context: DiagramItemPopupContextI) => {
                if (context.modelSetKey != pofDiagramModelSetKey)
                    return;

                this.addLocateOnGisMenu(context);
            });

    }


    private addLocateOnGisMenu(context: DiagramItemPopupContextI): void {
        if (this.gisPos == null)
            return;

        this.gisPos.canPositionByKey(context.key)
            .then((value) => {
                if (!value)
                    return;

                context.addMenuItem({
                    name: "Locate in GIS Diagram",
                    tooltip: null,
                    icon: 'map-marker',
                    callback: () => this.gisPos.positionByKey(context.key),
                    children: []
                });

            });
    }

}