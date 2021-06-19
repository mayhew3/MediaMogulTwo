import {Component, Input} from '@angular/core';
import {ColorTransformService} from '../../../services/color-transform.service';

@Component({
  selector: 'mm-rating-box',
  templateUrl: './rating-box.component.html',
  styleUrls: ['./rating-box.component.scss']
})
export class RatingBoxComponent {
  @Input() value: number;
  @Input() maxValue: number;
  @Input() faded: boolean;

  constructor(private colorTransformService: ColorTransformService) { }

  getFormattedNumber(): string {
    if (!!this.value) {
      const floored = Math.floor(this.value);
      const remainder = this.value - floored;
      if (remainder < .05) {
        return floored.toString();
      } else {
        return this.value.toFixed(1);
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
