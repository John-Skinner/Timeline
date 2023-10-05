import { TestBed } from '@angular/core/testing';

import { TimelineService } from './timeline.service';

describe('TimelineService', () => {
  let service: TimelineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimelineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
  it('timesecs',() => {
    const epoch1=service.dateTimeToEpicSecs('03/09/23', '11:54:52','-5:00');
    console.log(`epoch:${epoch1}`);
    const epoch2=service.dateTimeToEpicSecs('03/09/23','11:54:51','-5:00');
    const diff = epoch1-epoch2;
    expect(diff).toEqual(1);
  });
  it('timecurve',() => {
    service.setStartOfTimeline('04/01/00', '09:00:00', '-5:00');
    const start=service.dateTimeToEpicSecs('04/01/00','06:00:00','-5:00');
    service.setTimeOfInterest(start);
    const poi = service.dateTimeToEpicSecs('04/01/00', '06:00:00', '-5:00');
    let coord= service.getCoordFor(poi);
    console.log('coord:',coord);
    expect(coord[0]).toEqual(100);
    expect(coord[1]).toBeCloseTo(0,3);
    expect(coord[2]).toEqual(6.25);
  });

});
