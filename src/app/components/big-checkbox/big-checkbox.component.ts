import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'mm-big-checkbox',
  templateUrl: './big-checkbox.component.html',
  styleUrls: ['./big-checkbox.component.scss']
})
export class BigCheckboxComponent implements OnInit {
  @Input() value: boolean;
  @Output() valueChanged = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit(): void {
  }

  toggleCheckbox() {
    this.value = !this.value;
    this.valueChanged.emit(this.value);
  }

  getFinishButtonClass(): string {
    return this.value ? 'btn-success' : 'btn-secondary';
  }

}
