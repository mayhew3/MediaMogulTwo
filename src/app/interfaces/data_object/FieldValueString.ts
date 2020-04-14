import {FieldValue} from './FieldValue';

export class FieldValueString extends FieldValue<string> {

  convertFromString(dataStr: string) {
    return dataStr;
  }

  initializeValue(value: string) {
    super.initializeValue(value);
    this.isText = true;
  }

  initializeValueFromString(valueString: string) {
    super.initializeValueFromString(valueString);
    this.isText = true;
  }
}
