import {Component, Input, OnInit} from '@angular/core';
import {ColorTransformService} from '../../services/color-transform.service';

@Component({
  selector: 'mm-rating-box',
  templateUrl: './rating-box.component.html',
  styleUrls: ['./rating-box.component.scss']
})
export class RatingBoxComponent implements OnInit {
  @Input() value: number;
  @Input() maxValue: number;
  @Input() faded: boolean;

  constructor(private colorTransformService: ColorTransformService) { }

  ngOnInit(): void {
  }

  getValue(): number {
    return this.getFormattedNumber(this.value);
  }

  getFormattedNumber(value) {
    if (!!this.value) {
      const floored = Math.floor(value);
      const remainder = value - floored;
      if (remainder < .05) {
        return floored;
      } else {
        return value.toFixed(1);
      }
    } else {
      return '--';
    }
  }

  colorStyle(): string {
    return this.colorTransformService.colorStyle(this.value, this.maxValue, this.faded);
  }

  boxShadow(): string {
    if (!!this.faded) {
      return null;
    } else {
      return '1px 1px 2px #000';
    }
  }
}
