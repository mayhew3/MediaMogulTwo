/* tslint:disable:variable-name */
import {DataObject} from '../DataObject/DataObject';
import {AvailableGamePlatform} from './AvailableGamePlatform';
import {Person} from './Person';

export class MyGamePlatform extends DataObject {

  person: Person;
  availableGamePlatform: AvailableGamePlatform;

  getApiMethod(): string {
    return 'myPlatforms';
  }

}
