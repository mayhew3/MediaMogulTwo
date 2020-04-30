/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';
import {GamePlatform} from './GamePlatform';
import {PlatformService} from '../../services/platform.service';
import {ArrayUtil} from '../../utility/ArrayUtil';
import * as _ from 'underscore';
import {MyGamePlatform} from './MyGamePlatform';
import {Game} from './Game';

export class PersonGame extends DataObject {
  last_played = this.registerDateField('last_played', false);
  tier = this.registerIntegerField('tier', true);
  rating = this.registerDecimalField('rating', false);
  final_score = this.registerDecimalField('final_score', false);
  replay_score = this.registerDecimalField('replay_score', false);
  minutes_played = this.registerIntegerField('minutes_played', false);
  finished_date = this.registerDateField('finished_date', false);
  replay_reason = this.registerStringField('replay_reason', false);
  person_id = this.registerIntegerField('person_id', true);
  game_id = this.registerIntegerField('game_id', true);

  private _myPlatforms: MyGamePlatform[] = [];

  constructor(private platformService: PlatformService,
              private allPlatforms: GamePlatform[],
              private game: Game) {
    super();
    this.minutes_played.value = 0;
    this.tier.value = 2;
    this.game_id.value = game.id.value;
  }

  get myPlatforms(): MyGamePlatform[] {
    return ArrayUtil.cloneArray(this._myPlatforms);
  }

  protected makeChangesToInsertPayload(json: any): any {
    const base = super.makeChangesToInsertPayload(json);
    base.myPlatforms = this.getPlatformsPayload();
    return base;
  }

  getPlatformsPayload(): any {
    const myPlatforms = [];
    _.forEach(this.myPlatforms, myPlatform => {
      if (!myPlatform.platform.id.value) {
        myPlatforms.push(myPlatform.platform.getChangedFields());
      } else {
        myPlatforms.push({game_platform_id: myPlatform.platform.id.value});
      }
    });
    return myPlatforms;
  }

  getApiMethod(): string {
    return 'personGames';
  }

}
