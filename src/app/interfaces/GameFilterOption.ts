export class GameFilterOption {
  label: string;
  value: any;
  isActive: boolean;

  constructor(label: string, value: any, isActive: boolean) {
    this.label = label;
    this.value = value;
    this.isActive = isActive;
  }
}

