// Copyright (c) 2023 John Skinner
// All rights reserved.

//     Redistribution and use in source and binary forms, with or without
// modification, are permitted without any need to contact the author.

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { TimelineViewComponent } from './timeline-view/timeline-view.component';
import { TimelineControlsComponent } from './timeline-controls/timeline-controls.component';
import {TimelineView} from "./timeline-view/timelineView";


@NgModule({
    declarations: [
        AppComponent,
        TimelineViewComponent,
        TimelineControlsComponent
    ],
    imports: [
        BrowserModule,
    ],
    providers: [],
    exports: [
        TimelineViewComponent,
        TimelineControlsComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
