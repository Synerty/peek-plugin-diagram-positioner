import { Injectable } from "@angular/core"
import {
    DocDbPopupActionI,
    DocDbPopupContextI,
    DocDbPopupService,
    DocDbPopupTypeE
} from "@peek/peek_core_docdb"
import {
    DiagramCoordSetService,
    DiagramCoordSetTuple,
    DiagramPositionService,
    DispKeyLocation
} from "@peek/peek_plugin_diagram"
import { NgLifeCycleEvents } from "@synerty/peek-plugin-base-js"
import { Router } from "@angular/router"

/** Position On GIS Service
 *
 * This service will position on the GIS diagram.
 *
 */
@Injectable()
export class PositionOnDiagramService extends NgLifeCycleEvents {
    // These are hard coded because of dependency issues
    private readonly MODEL_SETS = {
        "pofDiagram": {name: "DMS Diagram", url: "peek_plugin_enmac_diagram"},
        "gisDiagram": {name: "GIS Diagram", url: "peek_plugin_gis_diagram"},
    }
    
    private coordSetsByModelSet: { [modelSetKey: string]: DiagramCoordSetTuple[] } = {}
    private coordSetsNameLookup: { [key: string]: string } = {}
    
    constructor(
        private router: Router,
        private objectPopupService: DocDbPopupService,
        private positionService: DiagramPositionService,
        private coordSetService: DiagramCoordSetService
    ) {
        super()
        
        this.objectPopupService
            .popupObservable(DocDbPopupTypeE.summaryPopup)
            .takeUntil(this.onDestroyEvent)
            .subscribe((c: DocDbPopupContextI) => this.addLocateOnActions(c))
        
        objectPopupService
            .popupObservable(DocDbPopupTypeE.detailPopup)
            .takeUntil(this.onDestroyEvent)
            .subscribe((c: DocDbPopupContextI) => this.addLocateOnActions(c))
        
        for (const modelSetKey of Object.keys(this.MODEL_SETS)) {
            this.coordSetService
                .diagramCoordSetTuples(modelSetKey)
                .takeUntil(this.onDestroyEvent)
                .subscribe((coordSets: DiagramCoordSetTuple[]) => {
                    this.coordSetsByModelSet[modelSetKey] = coordSets
                    this.rebuildCoordSetNameMap()
                })
        }
    }
    
    private rebuildCoordSetNameMap(): void {
        this.coordSetsNameLookup = {}
        for (const msKey of Object.keys(this.MODEL_SETS)) {
            for (const coordSet of (this.coordSetsByModelSet[msKey] || [])) {
                this.coordSetsNameLookup[`${msKey}-${coordSet.key}`]
                    = coordSet.name
            }
        }
    }
    
    private nameForCs(
        modelSetKey: string,
        coordSetKy: string
    ): string {
        return this.coordSetsNameLookup[`${modelSetKey}-${coordSetKy}`]
    }
    
    private async addLocateOnActions(context: DocDbPopupContextI): Promise<void> {
        const promises = []
        const positions = []
        
        for (const modelSetKey of Object.keys(this.MODEL_SETS))
            promises.push(this.loadPositions(modelSetKey, context, positions))
        
        await Promise.all(promises)
        
        if (positions.length == 0)
            return
        
        // If there is just one item, then just go straight there.
        if (positions.length == 1) {
            const action = positions[0]
            action.tooltip = action.name
            action.name = null
            action.icon = "environment"
            context.addAction(action)
            return
        }
        
        context.addAction({
            name: null,
            tooltip: "Goto Other Diagram Locations",
            icon: "environment",
            callback: null,
            children: positions,
        })
    }
    
    private async loadPositions(
        modelSetKey: string,
        context: DocDbPopupContextI,
        positions: DocDbPopupActionI[]
    ): Promise<void> {
        const coordSetKey = context.options.triggeredForContext
        const dispKey = context.key
        
        const locations: DispKeyLocation[] = await this.positionService
            .locationsForKey(modelSetKey, dispKey)
        
        for (const location of locations) {
            
            // Ignore positioning on the same coord set
            if (location.coordSetKey == coordSetKey)
                continue
            
            const name = this.MODEL_SETS[modelSetKey].name + " - "
                + this.nameForCs(modelSetKey, location.coordSetKey)
            
            positions.push({
                name: name,
                tooltip: null,
                icon: null,
                callback: () => this.updatePosition(location),
                children: []
            })
        }
    }
    
    private updatePosition(location: DispKeyLocation): void {
        this.positionService.isReadyObservable()
            .first()
            .subscribe(() => {
                this.positionService.positionByKey(
                    location.modelSetKey,
                    location.coordSetKey,
                    {highlightKey: location.dispKey}
                )
            })
        
        this.router.navigate([this.MODEL_SETS[location.modelSetKey].url])
    }
    
}
