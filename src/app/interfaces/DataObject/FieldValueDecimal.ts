import {FieldValue} from './FieldValue';

export class FieldValueDecimal extends FieldValue<number> {

  convertFromString(dataStr: string): number {
    return !!dataStr ? parseFloat(dataStr) : null;
  }

}
