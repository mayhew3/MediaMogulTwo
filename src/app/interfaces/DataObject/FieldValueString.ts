import {FieldValue} from './FieldValue';

export class FieldValueString extends FieldValue<string> {

  convertFromString(dataStr: string): string {
    return dataStr;
  }

  initializeValue(value: string): void {
    super.initializeValue(value);
    this.isText = true;
  }

  initializeValueFromString(valueString: string): void {
    super.initializeValueFromString(valueString);
    this.isText = true;
  }
}
