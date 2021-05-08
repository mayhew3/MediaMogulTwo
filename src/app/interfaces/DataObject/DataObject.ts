import {FieldValue} from './FieldValue';
import {FieldValueString} from './FieldValueString';
import {FieldValueInteger} from './FieldValueInteger';
import {FieldValueDecimal} from './FieldValueDecimal';
import {FieldValueDate} from './FieldValueDate';
import {FieldValueBoolean} from './FieldValueBoolean';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Subject} from 'rxjs';
import {Injectable, OnDestroy} from '@angular/core';
import {takeUntil} from 'rxjs/operators';
import {ArrayUtil} from '../../utility/ArrayUtil';
import * as _ from 'underscore';

enum EditMode {INSERT, UPDATE}

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export abstract class DataObject implements OnDestroy {
  private editMode = EditMode.INSERT;
  private initialized = false;
  private allFieldValues: FieldValue<any>[] = [];

  private _destroy$ = new Subject();

  id = this.registerIntegerField('id', true);
  date_added = this.registerDateField('date_added', true);

  initializedFromJSON(jsonObj: any): this {
    this.editMode = EditMode.UPDATE;
    for (const fieldValue of this.allFieldValues) {
      // initialize any fields set in constructor, so they can be changedFields for Insert and Initialized for Update.
      if (fieldValue.isChanged()) {
        fieldValue.update();
      }
      const jsonField = this.getValueFromJSON(fieldValue.getFieldName(), jsonObj);
      if (typeof jsonField === 'string') {
        fieldValue.initializeValueFromString(jsonField);
      } else {
        fieldValue.initializeValue(jsonField);
      }
    }
    return this;
  }

  get fieldValues(): FieldValue<any>[] {
    return ArrayUtil.cloneArray(this.allFieldValues);
  }

  getFieldWithName(fieldName: string): FieldValue<any> {
    return _.find(this.allFieldValues, fieldValue => fieldValue.getFieldName() === fieldName);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  getValueFromJSON(fieldName: string, jsonObj: any): any {
    const jsonField = jsonObj[fieldName];
    return jsonField === undefined ? null : jsonField;
  }

  hasChanges(): boolean {
    return _.some(this.allFieldValues, fieldValue => fieldValue.isChanged());
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

  async delete(http: HttpClient): Promise<any> {
    const url = '/api/' + this.getApiMethod() + '/' + this.id.value;
    await http.delete(url, httpOptions).toPromise();
  }

  protected makeChangesToInsertPayload(json: any): any {
    return json;
  }

  async insert(http: HttpClient): Promise<this> {
    const url = '/api/' + this.getApiMethod();
    const changedFields = this.getChangedFields();
    const insertPayload = this.makeChangesToInsertPayload(changedFields);
    const returnObj = await http.post<any>(url, insertPayload, httpOptions).toPromise();
    return this.initializedFromJSON(returnObj);
  }

  async update(http: HttpClient): Promise<this> {
    const url = '/api/' + this.getApiMethod();
    const changedFields = this.getChangedFields();
    // todo: check if changedFields is empty
    const payload = {
      id: this.id.value,
      changedFields
    };
    await http.put<any>(url, payload, httpOptions)
      .pipe(takeUntil(this._destroy$))
      .toPromise();
    this.moveChanges();
    return this;
  }

  abstract getApiMethod(): string;

  moveChanges(): void {
    for (const fieldValue of this.allFieldValues) {
      fieldValue.update();
    }
  }

  discardChanges(): void {
    for (const fieldValue of this.allFieldValues) {
      fieldValue.discardChange();
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
