import {Component, ElementRef, ViewChild} from '@angular/core';
import { TimelineView} from "./timelineView";
import {TimelineService} from "../services/timeline.service";

@Component({
  selector: 'app-timeline-view',
  templateUrl: './timeline-view.component.html',
  styleUrls: ['./timeline-view.component.css']
})
export class TimelineViewComponent {
  @ViewChild('vtkDiv') vtkDiv!: ElementRef;
  @ViewChild('textCanvas') textCanvas!:ElementRef;
  timelineView:TimelineView | null = null;
  constructor(private timelineService:TimelineService) {
    timelineService.onLoadTimeCurve().subscribe((tc) => {
      console.log(`time curve size: ${tc.length}`);
      this.timelineView.resetPoints();
      tc.forEach((tc,i)=> {
        this.timelineView.addPoint(tc.xyz[0],tc.xyz[1],tc.xyz[2]);

      })
      this.timelineView.displayTimeCurve();
      this.timelineView.drawTimeEntries();

    })
    timelineService.onLoadTimeUpdate().subscribe((tl) => {
      let dateStart=new Date(timelineService.T0Secs*1000);
      let dateEnd = new Date(timelineService.TNSecs*1000);
      let dateStartDay = dateStart.toDateString();
      let dateEndDay=dateEnd.toDateString();
      let timeStart = dateStart.toTimeString();
      let timeEnd=dateEnd.toTimeString();
      console.log(`date range:${dateStartDay} ${timeStart} to ${dateEndDay} ${timeEnd}`);
      this.timelineService.loadTimeLine(tl);


    })
  }


  ngAfterViewInit() {
    let container = this.vtkDiv.nativeElement;
    let overlayCanvas=this.textCanvas.nativeElement as HTMLCanvasElement;
    this.timelineView = new TimelineView(this.timelineService);
    this.timelineView.setOverlay(overlayCanvas);
    this.timelineView.Initialize(container);
    this.timelineView.onCameraChanged().subscribe(()=> {
      this.timelineView.drawTimeEntries();

    })
  }
}
