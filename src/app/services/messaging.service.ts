import {Injectable} from '@angular/core';
import {SocketService} from './socket.service';
import {Store} from '@ngxs/store';
import _ from 'underscore';
import {LoggerService} from './logger.service';
import {AddGlobalPlatform, UpdateGlobalPlatform} from '../actions/global.platform.action';
import {AddAvailableGamePlatforms, AddGameToMyCollection, AddGlobalGame} from '../actions/game.action';
import {GameData} from '../interfaces/ModelData/GameData';
import {MyGamePlatformData} from '../interfaces/ModelData/MyGamePlatformData';
import {AvailableGamePlatformData} from '../interfaces/Model/AvailableGamePlatform';
import {UpdateGlobalPlatformMessage} from '../../shared/UpdateGlobalPlatformMessage';
import {MyGameAddedMessage} from '../../shared/MyGameAddedMessage';

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

  private addSingleActionListener<T>(channelName: string, createAction: (msg: T) => any): void {
    this.addListener<T>(channelName, msg => [createAction(msg)]);
  }

  private addListener<T>(channelName: string, createActions: (msg: T) => any[]): void {
    this.socket.on(channelName, msg => {
      this.logger.log(`Received ${channelName} message: ${JSON.stringify(msg)}`);
      const actions = createActions(msg);
      _.each(actions, action => this.store.dispatch(action));
    });
  }

  private maybeInitListeners(): void {
    if (!this.listenersInitialized) {

      this.addSingleActionListener<UpdateGlobalPlatformMessage>(
        'update_global_platform',
        msg => new UpdateGlobalPlatform(
          msg.global_platform_id,
          msg.full_name,
          msg.short_name,
          msg.metacritic_uri
        ));

      this.addListener<MyGameAddedMessage>('my_game_added', msg => {
        const actions = [];
        const globalPlatforms = msg.addedGlobalPlatforms;
        _.each(globalPlatforms, platform => actions.push(new AddGlobalPlatform(
          platform.full_name,
          platform.short_name,
          platform.igdb_name,
          platform.igdb_platform_id
        )));

        const game: GameData = msg.newGame;
        const availablePlatforms: AvailableGamePlatformData[] = msg.addedAvailablePlatforms;
        const myGamePlatform: MyGamePlatformData = msg.myPlatform;

        if (!!game) {
          if (!!myGamePlatform) {
            const availableWhichWillBeMine: AvailableGamePlatformData = _.findWhere(availablePlatforms, {id: myGamePlatform.available_game_platform_id});
            availableWhichWillBeMine.myGamePlatform = myGamePlatform;
          }
          game.availablePlatforms = availablePlatforms;
          actions.push(new AddGlobalGame(game));
        } else {
          if (availablePlatforms.length > 0) {
            actions.push(new AddAvailableGamePlatforms(availablePlatforms, msg.game_id));
          }
          if (!!myGamePlatform) {
            actions.push(new AddGameToMyCollection(myGamePlatform, msg.game_id));
          }
        }
        return actions;
      });

      this.listenersInitialized = true;
    }
  }

}
