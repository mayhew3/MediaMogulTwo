import {Injectable} from '@angular/core';
import {SocketService} from './socket.service';
import {Store} from '@ngxs/store';
import _ from 'underscore';
import {LoggerService} from './logger.service';
import {UpdateGlobalPlatform} from '../actions/global.platform.action';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  listenersInitialized = false;

  constructor(private socket: SocketService,
              private store: Store,
              private logger: LoggerService) {
    this.maybeInitListeners();
  }

  private addSingleActionListener(channelName: string, createAction: (msg: any) => any): void {
    this.addListener(channelName, msg => [createAction(msg)]);
  }

  private addListener(channelName: string, createActions: (msg: any) => any[]): void {
    this.socket.on(channelName, msg => {
      this.logger.log(`Received ${channelName} message: ${JSON.stringify(msg)}`);
      const actions = createActions(msg);
      _.each(actions, action => this.store.dispatch(action));
    });
  }

  private maybeInitListeners(): void {
    if (!this.listenersInitialized) {

      this.addSingleActionListener('update_global_platform', msg => new UpdateGlobalPlatform(msg.global_platform_id, msg.full_name, msg.short_name, msg.metacritic_uri));
      this.socket.on('my_game_added', msg => {
        const poop = 0;
      })

      this.listenersInitialized = true;
    }
  }

}
