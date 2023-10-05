import {Component, ElementRef, ViewChild} from '@angular/core';
import {TimelineService} from "../services/timeline.service";

@Component({
  selector: 'app-timeline-controls',
  templateUrl: './timeline-controls.component.html',
  styleUrls: ['./timeline-controls.component.css']
})
export class TimelineControlsComponent {
  @ViewChild('fileUploadID') fileUploadElement:ElementRef;

  constructor(private timelineService:TimelineService) {
  }
  updateView(e:Event) {
    let element = e.target as HTMLInputElement;
    console.log(' check with '+element.value);
    console.log(' setting:' + element.name)
  }
  fileUpload() {
    console.log('file upload selected');
    let fileSelector: HTMLInputElement = this.fileUploadElement.nativeElement as HTMLInputElement;
    let fileList = fileSelector.files;
    let selFile = fileList[0];
    this.timelineService.loadTimeLineFile(selFile);
  }

}
