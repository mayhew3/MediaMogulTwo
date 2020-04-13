
export abstract class FieldValue<T> {
  private readonly fieldName: string;

  private originalValue: T;
  private changedValue: T;
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

  getValue(): T {
    return this.changedValue;
  }

  getFieldName(): string {
    return this.fieldName;
  }

  initializeValue(value: T) {
    this.originalValue = value;
    this.changedValue = value;
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

  changeValue(newValue: T) {
    if (newValue === null) {
      this.explicitNull = true;
    }
    this.changedValue = newValue;
  }

  changeValueFromString(valueString: string) {
    const convertedValue = this.getConversion(valueString);
    this.changeValue(convertedValue);
  }


  discardChange() {
    this.changedValue = this.originalValue;
  }

  nullValue() {
    this.explicitNull = true;
    this.changedValue = null;
  }

  isChanged(): boolean {
    return this.shouldUpgradeText() || this.valueHasChanged();
  }

  private shouldUpgradeText(): boolean {
    return (this.originalValue !== null && this.wasText && !this.isText);
  }

  private valueHasChanged() {
    return !Object.is(this.originalValue, this.changedValue);
  }

  update() {
    this.originalValue = this.changedValue;
  }

  isExplicitNull(): boolean {
    return this.explicitNull;
  }

  // abstract methods

  abstract convertFromString(dataStr: string): T;
}
