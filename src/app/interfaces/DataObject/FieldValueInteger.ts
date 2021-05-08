import {FieldValue} from './FieldValue';

export class FieldValueInteger extends FieldValue<number> {

  convertFromString(dataStr: string): number {
    return !!dataStr ? +dataStr : null;
  }
}
