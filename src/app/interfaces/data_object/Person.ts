import {DataObject} from './DataObject';

export class Person extends DataObject {
  email = this.registerStringField('email', true);
  user_role = this.registerStringField('user_role', false);
}
