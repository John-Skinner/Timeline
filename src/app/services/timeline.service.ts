import {Injectable} from '@angular/core';
import {Subject} from "rxjs";

export interface TimeElement {
  date:string,
  time:string,
  secondsFromEpoch:number,
  label:string
}
export interface TimeCurve {
  xyz:number[];
}
@Injectable({
  providedIn: 'root'
})


export class TimelineService {
  timeLine:TimeElement[] = [];
  timeCurve:TimeCurve[] = [];
  timelineUpdatedSubject:Subject<TimeElement[]> = new Subject<TimeElement[]>();
  timeCurveUpdatedSubject:Subject<TimeCurve[]> = new Subject<TimeCurve[]>();
  timeOfInterestChangedSubject:Subject<number> = new Subject<number>();
  timeOfInterest:number=0;
  secsPerDay=60*60*24;
  secsPer2Pi=this.secsPerDay/(2*Math.PI);
  T0Date = '';
  T0Time = '';
  TNDate = '';
  TNTime = '';
  T0Secs=-1; // secs *1000 serves as infinity
  TNSecs=0;
  startOfDayT0=0;
  radius = 100;
  feedRate=25;
  tz='-5:00';
  tzHours = -5;
  tzMinutes  = 0;


  constructor() {


  }
  public formatDateTime(epochSecs:number) {
    let epoch=epochSecs*1000;
    let tzOffsetMinutes=new Date().getTimezoneOffset();

  }
  private parseDate(date:string) {
    let mdy=date.split('/');
    if (mdy.length !== 3) {
      return [0,0,0];
    }
    let month=Number(mdy[0])-1;
    let day=Number(mdy[1]);
    let y1 = Number(mdy[2]);
    let year = 0;
    if (y1 > 50) {
      year = 1900+y1;
    }
    else {
      year = 2000+y1;
    }
    return [month,day,year];
  }
  private parseTime(time:string) {
    let hms=time.split(':');
    if (hms.length !== 3) {
      return [0,0,0];
    }
    let hour=Number(hms[0]);
    let minute = Number(hms[1]);
    let second = Number(hms[2]);
    return [hour,minute,second];
  }
  private parseLine(line:string):TimeElement | null {
    let cleanWhite=line.replaceAll(' ','');
    const items=cleanWhite.split(',');
    if (items.length < 5) {
      return null;
    }
    let label1=items[0];
    let label2 = items[1];
    let label3 = items[2];
    let theDate=items[3];
    let theTime=items[4];
    let label4=items[5];

    let theLabel=label1+':' + label2 + ':' + label3 + ':' + label4;
    let time=this.dateTimeToEpicSecs(theDate,theTime,this.tz);

    if (this.T0Secs === -1) {
      this.T0Secs = time;
      this.T0Date = theDate.slice();
      this.T0Time = theTime.slice();
    }

    if (time < this.T0Secs) {
      this.T0Date = theDate.slice();
      this.T0Time = theTime.slice();

      this.T0Secs = time;
    }
    if (time > this.TNSecs) {
      this.TNSecs = time;
      this.TNDate = theDate.slice();
      this.TNTime = theTime.slice();
    }
    let ele:TimeElement = {
      date: theDate, label: theLabel, secondsFromEpoch: time, time: theTime
    }

    return ele;

  }

  setStartOfTimeline(date:string,time:string,timeZone:string) {
    let epochTime=this.dateTimeToEpicSecs(date,time,timeZone);
    let startOfDayEpoch=this.startOfDay(date,timeZone);
    this.T0Secs=epochTime;
    this.startOfDayT0=startOfDayEpoch;
  }
  public loadTimeLineFile(file:File) {
    this.timeLine = [];
    file.text().then((inputFileString:string)=> {
      let eos=false;

      let fileString = inputFileString + '\n';
      while(!eos) {

        let lineBreak=fileString.indexOf('\n');
        let line=fileString.substring(0,lineBreak);
        let remainder=fileString.substring(lineBreak+1);
        let ele=this.parseLine(line);
        if (ele) {
          this.timeLine.push(ele);
        }
        eos=remainder.length < 2;
        fileString=remainder;
      }
      this.timelineUpdatedSubject.next(this.timeLine);
    });

  }
  recalcCurve() {

  }
  loadTimeLine(times:TimeElement[]) {
    this.timeLine = [];
    times.forEach((element,i)=> {
      let copy:TimeElement = {
        date: element.date, time: element.time,
        secondsFromEpoch:element.secondsFromEpoch,
        label:element.label
      }
      this.timeLine.push(copy);
    });
    this.buildTimeCurve();
    this.timeCurveUpdatedSubject.next(this.timeCurve);
  }
  onLoadTimeUpdate() {
    return this.timelineUpdatedSubject.asObservable()
  }
  onLoadTimeCurve() {
    return this.timeCurveUpdatedSubject.asObservable();
  }
  setTimeOfInterest(time:number) {
    this.timeOfInterest = time;
    this.timeOfInterestChangedSubject.next(this.timeOfInterest);
  }
  getCoordFor(time:number) {
    let fromStart=time-this.startOfDayT0;
    let piUnits=fromStart/this.secsPer2Pi;
    let x=Math.sin(piUnits)*this.radius;
    let y = Math.cos(piUnits)*this.radius;
    let clockX = x;
    let clockY = y;
    let z = -((time-this.startOfDayT0)/this.secsPerDay)*this.feedRate;
    return [clockX,clockY,z];
  }
  startOfDay(date:string,timeZone:string) {
    let time="00:00:00";
    return this.dateTimeToEpicSecs(date, time, timeZone);
  }
  buildTimeCurve() {
    let firstCoord=true;
    console.log(` T0 Date:${this.T0Date} time: ${this.T0Time}`);
    let midNightSecsGMT = this.startOfDay(this.T0Date,this.tz);
    let base=midNightSecsGMT;

    let curMinute = 0;
    let lastMinute = (this.TNSecs-midNightSecsGMT)/60;
    console.log(`starting minute:${curMinute} last minute:${lastMinute}`)
    while (curMinute < lastMinute) {
      let curSecond = curMinute*60;
      let coord = this.getCoordFor(curSecond);
      if (firstCoord) {
        console.log(`first coord:${coord}`);
        firstCoord=false;
      }
      this.timeCurve.push({
        xyz:coord
      });
      curMinute++;
    }


    }




  /**
   *
   * @param date
   * @param time
   * @param timeZone for chicago: '-5:00' when daylight savings is on, '-6:00' otherwise
   * @param time in epoch seconds (not milliseconds)
   */
  dateTimeToEpicSecs(date:string, time:string, timeZone:string) {

    const dateValue = new Date(date + ' ' + time + timeZone);
    const epoch=dateValue.getTime();
    return epoch*0.001;
  }
}
