/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';

export class GamePlatform extends DataObject {
  full_name = this.registerStringField('full_name', false);
  short_name = this.registerStringField('short_name', false);
  igdb_platform_id = this.registerIntegerField('igdb_platform_id', false);
  igdb_name = this.registerStringField('igdb_name', false);

  parent: GamePlatform;

  getApiMethod(): string {
    return 'platforms';
  }

}
