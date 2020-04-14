import {FieldValue} from './FieldValue';
import {FieldValueString} from './FieldValueString';
import {FieldValueInteger} from './FieldValueInteger';
import {FieldValueDecimal} from './FieldValueDecimal';
import {FieldValueDate} from './FieldValueDate';
import {FieldValueBoolean} from './FieldValueBoolean';
import {HttpClient, HttpHeaders} from '@angular/common/http';

enum EditMode {INSERT, UPDATE}

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

export abstract class DataObject {
  private editMode = EditMode.INSERT;
  private initialized = false;
  private allFieldValues: FieldValue<any>[] = [];

  id = this.registerIntegerField('id', true);
  date_added = this.registerDateField('date_added', true);

  initializedFromJSON(jsonObj: any): this {
    this.editMode = EditMode.UPDATE;
    for (const fieldValue of this.allFieldValues) {
      const jsonField = this.getValueFromJSON(fieldValue.getFieldName(), jsonObj);
      if (typeof jsonField === 'string') {
        fieldValue.initializeValueFromString(jsonField);
      } else {
        fieldValue.initializeValue(jsonField);
      }
    }
    return this;
  }

  getValueFromJSON(fieldName: string, jsonObj: any): any {
    const jsonField = jsonObj[fieldName];
    return jsonField === undefined ? null : jsonField;
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

  commit(http: HttpClient): Promise<this> {
    if (this.editMode === EditMode.INSERT) {
      return this.insert(http);
    } else {
      return this.update(http);
    }
  }

  async insert(http: HttpClient): Promise<this> {
    const url = '/api/' + this.getApiMethod();
    const changedFields = this.getChangedFields();
    const returnObj = await http.post<any>(url, changedFields).toPromise();
    this.id.value = returnObj.id;
    this.date_added.value = returnObj.date_added;
    this.moveChanges();
    return this;
  }

  async update(http: HttpClient): Promise<this> {
    const url = '/api/' + this.getApiMethod();
    const changedFields = this.getChangedFields();
    const payload = {
      id: this.id.value,
      changedFields: changedFields
    }
    await http.put<any>(url, payload, httpOptions).toPromise();
    this.moveChanges();
    return this;
  }

  abstract getApiMethod(): string;

  moveChanges(): void {
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