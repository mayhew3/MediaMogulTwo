import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'mm-big-checkbox',
  templateUrl: './big-checkbox.component.html',
  styleUrls: ['./big-checkbox.component.scss']
})
export class BigCheckboxComponent {
  @Input() value: boolean;
  @Output() valueChanged = new EventEmitter<boolean>();

  constructor() { }

  toggleCheckbox(): void {
    this.value = !this.value;
    this.valueChanged.emit(this.value);
  }

  getFinishButtonClass(): string {
    return this.value ? 'btn-success' : 'btn-secondary';
  }

}
