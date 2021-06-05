import {Injectable} from '@angular/core';
import {SocketService} from './socket.service';
import {Store} from '@ngxs/store';
import _ from 'underscore';
import {LoggerService} from './logger.service';
import {
  AddGlobalPlatforms,
  AddToMyGlobalPlatforms, MyGlobalPlatformsChangeRanks,
  RemoveFromMyGlobalPlatforms,
  UpdateGlobalPlatform
} from '../actions/global.platform.action';
import {AddAvailableGamePlatforms, AddGameToMyCollection, AddGlobalGame} from '../actions/game.action';
import {GameData} from '../interfaces/ModelData/GameData';
import {MyGamePlatformData} from '../interfaces/ModelData/MyGamePlatformData';
import {AvailableGamePlatformData} from '../interfaces/Model/AvailableGamePlatform';
import {UpdateGlobalPlatformMessage} from '../../shared/UpdateGlobalPlatformMessage';
import {MyGameAddedMessage} from '../../shared/MyGameAddedMessage';
import {GlobalGameAddedMessage} from '../../shared/GlobalGameAddedMessage';
import {MyGlobalPlatformAddedMessage} from '../../shared/MyGlobalPlatformAddedMessage';
import {MyGlobalPlatformRemovedMessage} from '../../shared/MyGlobalPlatformRemovedMessage';
import {MyGlobalPlatformsRanksChangedMessage} from '../../shared/MyGlobalPlatformsRanksChangedMessage';

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

  private maybeInitListeners(): void {
    if (!this.listenersInitialized) {

      this.updateGlobalPlatform();
      this.addGameToMyCollection();
      this.addGlobalGame();
      this.addPlatformToMyPlatforms();
      this.removePlatformFromMyPlatforms();
      this.changeMyPlatformRanks();

      this.listenersInitialized = true;
    }
  }

  // Extracted methods

  private changeMyPlatformRanks(): void {
    this.addSingleActionListener<MyGlobalPlatformsRanksChangedMessage>('my_global_ranks_changed', msg => {
      return new MyGlobalPlatformsChangeRanks(msg.changes);
    });
  }

  private removePlatformFromMyPlatforms(): void {
    this.addSingleActionListener<MyGlobalPlatformRemovedMessage>('my_platform_removed', msg => {
      return new RemoveFromMyGlobalPlatforms(msg.game_platform_id);
    });
  }

  private addPlatformToMyPlatforms(): void {
    this.addSingleActionListener<MyGlobalPlatformAddedMessage>('my_platform_added', msg => {
      return new AddToMyGlobalPlatforms(msg.myGlobalPlatform);
    });
  }

  private addGlobalGame(): void {
    this.addListener<GlobalGameAddedMessage>('global_game_added', msg => {
      const actions = [];
      const globalPlatforms = msg.addedGlobalPlatforms;
      if (globalPlatforms.length > 0) {
        actions.push(new AddGlobalPlatforms(globalPlatforms));
      }

      const game: GameData = msg.newGame;
      const availablePlatforms: AvailableGamePlatformData[] = msg.addedAvailablePlatforms;

      if (!!game) {
        game.availablePlatforms = availablePlatforms;
        actions.push(new AddGlobalGame(game));
      } else if (!!msg.game_id && availablePlatforms.length > 0) {
        actions.push(new AddAvailableGamePlatforms(availablePlatforms, msg.game_id));
      }
      return actions;
    });
  }

  private addGameToMyCollection(): void {
    this.addListener<MyGameAddedMessage>('my_game_added', msg => {
      const actions = [];
      const globalPlatforms = msg.addedGlobalPlatforms;
      if (globalPlatforms.length > 0) {
        actions.push(new AddGlobalPlatforms(globalPlatforms));
      }

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
  }

  private updateGlobalPlatform(): void {
    this.addSingleActionListener<UpdateGlobalPlatformMessage>(
      'update_global_platform',
      msg => new UpdateGlobalPlatform(
        msg.global_platform_id,
        msg.full_name,
        msg.short_name,
        msg.metacritic_uri
      ));
  }

  // Generic helper methods

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

}
