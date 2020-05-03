/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';

export class GamePlatform extends DataObject {
  full_name = this.registerStringField('full_name', false);
  short_name = this.registerStringField('short_name', false);
  igdb_platform_id = this.registerIntegerField('igdb_platform_id', false);
  igdb_name = this.registerStringField('igdb_name', false);
  metacritic_uri = this.registerStringField('metacritic_uri', false);

  parent: GamePlatform;

  getApiMethod(): string {
    return 'gamePlatforms';
  }

  canAddPlaytime(): boolean {
    return this.full_name.value !== 'Steam';
  }

  isTemporary(): boolean {
    return !this.id.value;
  }

}
