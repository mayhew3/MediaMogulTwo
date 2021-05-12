import {Injectable} from '@angular/core';

import {Socket} from 'socket.io-client';
import _ from 'underscore';
import {ArrayUtil} from '../utility/ArrayUtil';
import {BehaviorSubject, Observable} from 'rxjs';
import {LoggerService} from './logger.service';

@Injectable()
export class SocketService {
// Migrated from AngularJS https://raw.githubusercontent.com/Ins87/angular-date-interceptor/master/src/angular-date-interceptor.js
  iso8601 = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?(([+-]\d\d:\d\d)|Z)?$/;

  private pendingListeners: PendingListener[] = [];
  private socket: Socket;
  private connectedSubject = new BehaviorSubject<boolean>(false);

  constructor(private logger: LoggerService) {
  }

  init(socket: Socket): void {
    this.socket = socket;
    this.socket.on('error', msg => {
      this.logger.log(`Connect Error: ${JSON.stringify(msg)}`);
    });
    this.socket.on('connect', () => {
      this.logger.log('Connected to socket!');
      const listeners = ArrayUtil.cloneArray(this.pendingListeners);
      _.each(listeners, (pendingListener: PendingListener) => {
        this.on(pendingListener.channel, pendingListener.callback);
        ArrayUtil.removeFromArray(this.pendingListeners, pendingListener);
      });
      this.connectedSubject.next(true);
    });
    this.socket.on('disconnect', () => this.connectedSubject.next(false));
  }

  on(channel, callback: (msg: any) => void): (msg: any) => void {
    const wrappedCallback: (msg: any) => void = (msg: any) => callback(this.convertToDate(msg));
    if (!this.socket) {
      this.pendingListeners.push(new PendingListener(channel, wrappedCallback));
    } else {
      this.socket.on(channel, wrappedCallback);
    }
    return wrappedCallback;
  }

  off(channel, callback): void {
    this.socket.off(channel, callback);
  }

  isConnected(): boolean {
    return !!this.socket && this.socket.connected;
  }

  get isConnected$(): Observable<boolean> {
    return this.connectedSubject.asObservable();
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
  }

  isIso8601(value): boolean {
    if (value === null || value === undefined) {
      return false;
    }

    return this.iso8601.test(value);
  }
}

class PendingListener {
  constructor(public channel: string,
              public callback: (msg: any) => void) {
  }
}
