import {FieldValue} from './FieldValue';
import {FieldValueString} from './FieldValueString';
import {FieldValueInteger} from './FieldValueInteger';
import {FieldValueDecimal} from './FieldValueDecimal';
import {FieldValueDate} from './FieldValueDate';
import {FieldValueBoolean} from './FieldValueBoolean';
import * as _ from 'underscore';

enum EditMode {INSERT, UPDATE}


export abstract class DataObject {
  private editMode: EditMode;
  private initialized = false;
  private allFieldValues: FieldValue<any>[] = [];

  id = this.registerIntegerField('id', true);
  date_added = this.registerDateField('date_added', true);

  initializedFromJSON(jsonObj: any): DataObject {
    for (const fieldValue of this.allFieldValues) {
      const jsonField = jsonObj[fieldValue.getFieldName()];
      if (jsonField !== undefined) {
        if (typeof jsonField === 'string') {
          fieldValue.initializeValueFromString(jsonField);
        } else {
          fieldValue.initializeValue(jsonField);
        }
      }
    }
    return this;
  }

  getChangedFields(): any {
    const returnObj = {};
    for (const fieldValue of this.allFieldValues) {
      if (fieldValue.isChanged()) {
        returnObj[fieldValue.getFieldName()] = fieldValue.getChangedValue();
      }
    }
    return returnObj;
  }

  update(): void {
    for (const fieldValue of this.allFieldValues) {
      fieldValue.update();
    }
  }

  protected registerStringField(fieldName: string, required: boolean): FieldValueString {
    const fieldValue = new FieldValueString(fieldName, required);
    this.allFieldValues.push(fieldValue);
    return fieldValue;
  }

  protected registerIntegerField(fieldName: string, required: boolean): FieldValueInteger {
    const fieldValue = new FieldValueInteger(fieldName, required);
    this.allFieldValues.push(fieldValue);
    return fieldValue;
  }

  protected registerDecimalField(fieldName: string, required: boolean): FieldValueDecimal {
    const fieldValue = new FieldValueDecimal(fieldName, required);
    this.allFieldValues.push(fieldValue);
    return fieldValue;
  }

  protected registerDateField(fieldName: string, required: boolean): FieldValueDate {
    const fieldValue = new FieldValueDate(fieldName, required);
    this.allFieldValues.push(fieldValue);
    return fieldValue;
  }

  protected registerBooleanField(fieldName: string, required: boolean): FieldValueBoolean {
    const fieldValue = new FieldValueBoolean(fieldName, required);
    this.allFieldValues.push(fieldValue);
    return fieldValue;
  }


}
