import {Injectable} from '@angular/core';
import {Observable, of} from 'rxjs';
import {InMemoryDataService} from './in-memory-data.service';

@Injectable()
export class SocketServiceMock {
  iso8601 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/;

  constructor(private inMemoryDB: InMemoryDataService) {
  }

  on(channel, callback): (msg: any) => void {
    const dateWrappedCallback: (msg: any) => void = (msg: any) => callback(this.convertToDate(msg));
    this.inMemoryDB.on(channel, dateWrappedCallback);
    return dateWrappedCallback;
  }

  off(channel, callback): void {
    this.inMemoryDB.off(channel, callback);
  }

  isConnected(): boolean {
    return true;
  }

  get isConnected$(): Observable<boolean> {
    return of(true);
  }

  convertToDate(body): any {
    if (body === null || body === undefined) {
      return body;
    }

    if (typeof body !== 'object') {
      return body;
    }

    for (const key of Object.keys(body)) {
      const value = body[key];
      if (this.isIso8601(value)) {
        body[key] = new Date(value);
      } else if (typeof value === 'object') {
        this.convertToDate(value);
      }
    }
    return body;
  }

  isIso8601(value): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    return this.iso8601.test(value);
  }
  init(): void {}
}
