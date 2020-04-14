import {DataObject} from '../DataObject/DataObject';

export class Person extends DataObject {
  email = this.registerStringField('email', true);
  user_role = this.registerStringField('user_role', false);

  getApiMethod(): string {
    return 'persons';
  }
}
