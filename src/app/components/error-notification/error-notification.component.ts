import {Component, Inject} from '@angular/core';
import {MAT_SNACK_BAR_DATA} from '@angular/material/snack-bar';

@Component({
  selector: 'mm-error-notification',
  templateUrl: './error-notification.component.html',
  styleUrls: ['./error-notification.component.scss']
})
export class ErrorNotificationComponent {

  header: string;
  message: string;

  constructor(@Inject(MAT_SNACK_BAR_DATA) private data: any) {
    this.header = data.header;
    this.message = data.message;
  }

}
