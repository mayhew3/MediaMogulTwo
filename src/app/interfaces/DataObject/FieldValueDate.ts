import {FieldValue} from './FieldValue';

export class FieldValueDate extends FieldValue<Date> {

  convertFromString(dataStr: string): Date {
    return !!dataStr ? new Date(dataStr) : null;
  }
}
