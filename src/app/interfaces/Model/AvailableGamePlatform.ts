/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
import {GamePlatform} from './GamePlatform';
import {Game} from './Game';
import {MyGamePlatform} from './MyGamePlatform';

export interface AvailableGamePlatform {

  myGamePlatform: MyGamePlatform;

  id: number;
  game_platform_id: number;
  platform_name: string;
  metacritic: number;
  metacritic_page: string;
  metacritic_matched: Date;
  game_id: number;

  platform: GamePlatform;
  game: Game;
  /*
  constructor(public platform: GamePlatform,
              public game: Game) {
    super();
    this.game_platform_id.value = platform.id;
    this.game_id.value = game.id.value;
    this.platform_name.value = platform.full_name;
  }
*/
/*

  initializedFromJSON(jsonObj: any): this {
    super.initializedFromJSON(jsonObj);
    if (!this.platform_name.value) {
      this.platform_name.initializeValue(this.platform.full_name);
    }
    if (!!jsonObj.myPlatform) {
      this.myGamePlatform = new MyGamePlatform(this).initializedFromJSON(jsonObj.myPlatform);
    }
    return this;
  }
*/

}
