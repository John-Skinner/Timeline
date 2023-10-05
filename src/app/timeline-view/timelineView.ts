// Copyright (c) 2023 John Skinner
// All rights reserved.

//     Redistribution and use in source and binary forms, with or without
// modification, are permitted without any need to contact the author.
import '@kitware/vtk.js/Rendering/Profiles/Geometry'
import '@kitware/vtk.js/Rendering/Profiles/Volume'
import vtkRenderWindowInteractor from "@kitware/vtk.js/Rendering/Core/RenderWindowInteractor";
import vtkInteractorStyleTrackballCamera from "@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera";
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkOpenGLRenderWindow from "@kitware/vtk.js/Rendering/OpenGL/RenderWindow";
import vtkRenderWindow from "@kitware/vtk.js/Rendering/Core/RenderWindow";
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkConeSource from "@kitware/vtk.js/Filters/Sources/ConeSource";
import vtkPoints from "@kitware/vtk.js/Common/Core/Points";
import vtkPolyLine from "@kitware/vtk.js/Common/DataModel/PolyLine";
import vtkCellArray from "@kitware/vtk.js/Common/Core/CellArray";
import vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData";
import {Subject} from "rxjs";
import {TimelineService} from "../services/timeline.service";

export class TimelineView
{
    cameraUpdateSubject:Subject<void> = new Subject<void>();
    timelineService:TimelineService | null = null;
    curvePoints:vtkPoints = vtkPoints.newInstance();
    curvePointIDs:number[] = [];
    polyLine = vtkPolyLine.newInstance();
    cellArray:vtkCellArray = vtkCellArray.newInstance();
    polyData=vtkPolyData.newInstance();
    polyDataMapper:vtkMapper = vtkMapper.newInstance();
    actor = vtkActor.newInstance();
    nexti = 0;
    windowWidth=0;
    windowHeight=0;
    vtkRenderWindow:vtkRenderWindow = vtkRenderWindow.newInstance();
    // @ts-ignore
    openglRenderWindow =
        vtkOpenGLRenderWindow.newInstance();
    renderer = vtkRenderer.newInstance();
    overlayCanvas:HTMLCanvasElement | null = null;
    onCameraChanged() {
        return this.cameraUpdateSubject.asObservable();
    }
    resetPoints() {
        this.curvePoints = vtkPoints.newInstance();
        this.nexti = 0;
    }
    addPoint(x,y,z) {
        this.curvePoints.insertNextPoint(x,y,z);
        this.curvePointIDs.push(this.nexti);
        this.nexti++;

    }
    constructor(timelineService:TimelineService) {
        this.timelineService = timelineService;
    }
    displayTimeCurve() {
        console.log(`display the curve`);
        this.polyLine.initialize(this.curvePoints,this.curvePointIDs);
        this.cellArray = vtkCellArray.newInstance();
        this.cellArray.insertNextCell(this.curvePointIDs);
        this.polyData.setPoints(this.curvePoints);
        this.polyData.setLines(this.cellArray);
        this.polyDataMapper.setInputData(this.polyData);
        this.vtkRenderWindow.render();
        this.renderer.resetCamera();
        this.vtkRenderWindow.render();
    }


    Initialize(Div:HTMLDivElement)
    {
        this.windowWidth = Div.clientWidth;
        this.windowHeight = Div.clientHeight;
        // without setting the canvas's width and height, the browser will scale the canvas
        // to fit the css's width and height.
        this.overlayCanvas.width=this.windowWidth;
        this.overlayCanvas.height=this.windowHeight;


        const initialValues = {background: [0, 0, 0]};

        this.openglRenderWindow.setContainer(Div);
        this.openglRenderWindow.setSize(this.windowWidth, this.windowHeight);
        this.vtkRenderWindow.addView(this.openglRenderWindow);


        this.actor.setMapper(this.polyDataMapper);
        this.polyDataMapper.setInputData(this.polyData);

        this.vtkRenderWindow.addRenderer(this.renderer);
        const interactor = vtkRenderWindowInteractor.newInstance();
        interactor.setInteractorStyle(
            vtkInteractorStyleTrackballCamera.newInstance()
        );
        interactor.setView(this.openglRenderWindow);
        interactor.initialize();
        interactor.bindEvents(Div);

        this.renderer.addActor(this.actor);
        this.renderer.resetCamera();
        let cam=this.renderer.getActiveCamera();
        cam.onModified((instance)=> {
            console.log('cam changed');
            let view=this.renderer.getRenderWindow().getViews()[0];
            this.cameraUpdateSubject.next();
            let nearFar=cam.getClippingRange();
            let angle=cam.getViewAngle();
            let vup = cam.getViewUp();
            let position=cam.getPosition();
            let focalPoint=cam.getFocalPoint();
            console.log(`position:${position} focal point:${focalPoint}`);
            console.log(`camera clip range:${nearFar} angle:${angle} vup:${vup}`);

        })
        this.vtkRenderWindow.render();
    }
    public drawTimeEntries() {
        this.clearCanvas();
    let midNightSecsGMT =
    this.timelineService.startOfDay(this.timelineService.T0Date,this.timelineService.tz);
    this.timelineService.timeLine.forEach((timePoint,i)=> {
    let timeOfEntry=timePoint.secondsFromEpoch;
    let fromT0Midnight=timeOfEntry-midNightSecsGMT;
    let worldCoord = this.timelineService.getCoordFor(fromT0Midnight);
    this.plotLabel(worldCoord,timePoint.label);


})
}
    public computeWorldToDisplay(x,y,z) {
        let view=this.renderer.getRenderWindow().getViews()[0];
        let coord=view.worldToDisplay(x,y,z,this.renderer);
        return coord;
    }

    setOverlay(overlayCanvas: HTMLCanvasElement) {
        this.overlayCanvas = overlayCanvas;

    }
    clearCanvas() {
        const ctxt = this.overlayCanvas.getContext('2d');
        ctxt.fillStyle = 'rgba(0,0,0,1)';
        const origComposite=ctxt.globalCompositeOperation;
        ctxt.globalCompositeOperation = 'destination-out';
        ctxt.fillRect(0,0,this.overlayCanvas.width,this.overlayCanvas.height);
        ctxt.globalCompositeOperation = origComposite;
    }

    plotLabel(worldCoord: number[], label: string) {

        const ctxt=this.overlayCanvas.getContext('2d');

      //  ctxt.font = '16px calibri';
        ctxt.fillStyle = 'orange';
        let displayCoord = this.computeWorldToDisplay(worldCoord[0],
            worldCoord[1],
            worldCoord[2]);
        let yflip = this.overlayCanvas.height-displayCoord[1];
        ctxt.fillText(label,displayCoord[0],yflip);


    }
}
