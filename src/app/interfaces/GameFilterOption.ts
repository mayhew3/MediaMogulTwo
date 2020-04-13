export class GameFilterOption {
  label: string;
  value: any;
  isActive: boolean;
  special: boolean;

  constructor(label: string, value: any, isActive: boolean, special: boolean) {
    this.label = label;
    this.value = value;
    this.isActive = isActive;
    this.special = special;
  }
}

