import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineControlsComponent } from './timeline-controls.component';

describe('TimelineControlsComponent', () => {
  let component: TimelineControlsComponent;
  let fixture: ComponentFixture<TimelineControlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimelineControlsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TimelineControlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
