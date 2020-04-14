

export abstract class FieldValue<T> {
  private readonly fieldName: string;

  protected originalValue: T;
  protected _value: T;
  strValue: string;
  private explicitNull = false;
  private required = false;

  private wasText = false;
  private isText = false;

  constructor(fieldName: string, required: boolean) {
    this.fieldName = fieldName;
    this.required = required;
  }

  getOriginalValue(): T {
    return this.originalValue;
  }

  get value(): T {
    return this._value;
  }

  set value(newValue: T) {
    if (newValue === null) {
      this.explicitNull = true;
    }
    this._value = newValue;
  }

  getFieldName(): string {
    return this.fieldName;
  }

  initializeValue(value: T) {
    this.originalValue = value;
    this._value = value;
  }

  initializeValueFromString(valueString: string) {
    const convertedValue = this.getConversion(valueString);
    this.initializeValue(convertedValue);
    this.wasText = true;
  }

  private getConversion(valueString: string): T {
    try {
      return this.convertFromString(valueString);
    } catch (err) {
      throw new Error(`Error converting ${this.fieldName} field with value ${valueString} to its type`);
    }
  }

  changeValueFromString(valueString: string) {
    this.value = this.getConversion(valueString);
  }

  discardChange() {
    this._value = this.originalValue;
  }

  nullValue() {
    this.explicitNull = true;
    this._value = null;
  }

  isChanged(): boolean {
    return this.shouldUpgradeText() || this.valueHasChanged();
  }

  private shouldUpgradeText(): boolean {
    return (this.originalValue !== null && this.wasText && !this.isText);
  }

  private valueHasChanged() {
    const converted = this.convertFromString(this.strValue);
    return !this.isSame(this.originalValue, this._value) || !this.isSame(this.originalValue, converted);
  }

  // noinspection JSMethodCanBeStatic
  private isSame(field1, field2): boolean {
    const normalized1 = field1 === '' || field1 === null ? undefined : field1;
    const normalized2 = field2 === '' || field2 === null ? undefined : field2;
    return normalized1 === normalized2;
  }

  getChangedValue(): T {
    const converted = this.convertFromString(this.strValue);
    if (!this.isSame(this.originalValue, this.value)) {
      return this.value;
    } else if (!this.isSame(this.originalValue, converted)) {
      return converted;
    }
  }

  update() {
    const converted = this.convertFromString(this.strValue);
    if (!Object.is(this.originalValue, this._value) &&
      !Object.is(this._value, converted) &&
      !Object.is(this._value, converted)) {
      throw new Error("Multiple changes to same field.")
    } else {
      const changed = this.getChangedValue();
      this.strValue = changed.toString();
      this._value = changed;
      this.originalValue = this._value;
    }
  }

  isExplicitNull(): boolean {
    return this.explicitNull;
  }

  // abstract methods

  abstract convertFromString(dataStr: string): T;
}
