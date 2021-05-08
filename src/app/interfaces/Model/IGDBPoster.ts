/* eslint-disable @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match */
import {DataObject} from '../DataObject/DataObject';

export class IGDBPoster extends DataObject {
  image_id = this.registerStringField('image_id', true);
  default_for_game = this.registerBooleanField('default_for_game', true);
  width = this.registerIntegerField('width', false);
  height = this.registerIntegerField('height', false);
  game_id = this.registerIntegerField('game_id', true);

  getApiMethod(): string {
    return 'igdbPosters';
  }
}
