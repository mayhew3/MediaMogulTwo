import {FieldValue} from './FieldValue';

export class FieldValueBoolean extends FieldValue<boolean> {

  convertFromString(dataStr: string): boolean {
    return !!dataStr;
  }

}
