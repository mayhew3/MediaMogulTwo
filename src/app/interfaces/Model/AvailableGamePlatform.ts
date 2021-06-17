/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
import {GamePlatform} from './GamePlatform';
import {Game} from './Game';
import {MyGamePlatform} from './MyGamePlatform';
import {MyGamePlatformData} from '../ModelData/MyGamePlatformData';
import _ from 'underscore';

export class AvailableGamePlatform {
  myGamePlatform?: MyGamePlatform;
  gamePlatform: GamePlatform;

  constructor(public data: AvailableGamePlatformData,
              public game: Game,
              private globalPlatforms: GamePlatform[]) {
    this.gamePlatform = _.findWhere(globalPlatforms, {id: data.game_platform_id});
    if (!!data.myGamePlatform) {
      this.myGamePlatform = new MyGamePlatform(data.myGamePlatform, this);
    }
  }

  get id(): number {
    return this.data.id;
  }

  get platform_name(): string {
    return this.gamePlatform.platform_name;
  }

  get subscribed(): boolean {
    return !!this.myGamePlatform && !!this.gamePlatform.myGlobalPlatform;
  }

  get metacritic(): number {
    return this.data.metacritic;
  }
}

export interface AvailableGamePlatformData {

  myGamePlatform: MyGamePlatformData;

  id: number;
  game_platform_id: number;
  platform_name: string;
  metacritic: number;
  metacritic_page: string;
  metacritic_matched: Date;
  game_id: number;

}
