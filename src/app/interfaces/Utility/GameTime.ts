import * as moment from "moment";

export class GameTime {
  // tslint:disable-next-line:variable-name
  private _duration: moment.Duration;
  // tslint:disable-next-line:variable-name
  private _hours: number;
  // tslint:disable-next-line:variable-name
  private _minutes: number;

  initialize(minutesPlayed: number) {
    this._duration = moment.duration(minutesPlayed, 'minutes');
    this.updateHoursAndMinutes();
  }

  get hours(): number {
    return this._hours;
  }

  set hours(newHours: number) {
    this._hours = newHours;
    this.updateDuration();
  }

  get minutes(): number {
    return this._minutes;
  }

  set minutes(newMinutes: number) {
    this._minutes = newMinutes;
    this.updateDuration();
  }

  get duration(): moment.Duration {
    return this._duration;
  }

  set duration(newDuration: moment.Duration) {
    this._duration = newDuration;
    this.updateHoursAndMinutes();
  }

  getDurationClone(): moment.Duration {
    return this._duration.clone();
  }

  asMinutes(): number {
    return this._duration?.asMinutes();
  }

  private updateDuration() {
    const hoursDuration = moment.duration(!this._hours ? 0 : this._hours, 'hours');
    const minutesDuration = moment.duration(!this._minutes ? 0 : this._minutes, 'minutes');

    this._duration = hoursDuration.add(minutesDuration);
  }

  private updateHoursAndMinutes() {
    this._hours = Math.floor(this._duration.asHours());
    this._minutes = this._duration.minutes();
  }
}
