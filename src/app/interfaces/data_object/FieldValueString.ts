import {FieldValue} from './FieldValue';

export class FieldValueString extends FieldValue<string> {

  convertFromString(dataStr: string) {
    return dataStr;
  }

}
