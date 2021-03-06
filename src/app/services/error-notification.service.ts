import {Injectable} from '@angular/core';
import {Observable, of, Subject, Subscription} from 'rxjs';
import {ErrorNotificationComponent} from '../components/shared/error-notification/error-notification.component';
import {MatSnackBar, MatSnackBarRef} from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class ErrorNotificationService {

  private messageQueue = new Subject<SnackBarMessage>();
  private subscription: Subscription;
  private snackBarRef: MatSnackBarRef<ErrorNotificationComponent>;

  constructor(private snackBar: MatSnackBar) {
    this.subscription = this.messageQueue.subscribe(snackBarMessage => {
      if (!this.snackBarRef) {
        this.openSnackBar(snackBarMessage);
      } else {
        this.snackBarRef.afterDismissed().subscribe(() => {
          this.snackBarRef = undefined;
          this.openSnackBar(snackBarMessage);
        });
      }
    });
  }

  private static getMessage(error: any): string {
    if (!!error.error) {
      return error.error.message;
    } else if (!!error.message) {
      return error.message;
    } else if (!!error.body) {
      return error.body.error;
    } else {
      return JSON.stringify(error);
    }
  }

  handleAPIError<T>(result?: T) {
    return (error: any): Observable<T> => {
      this.addToMessageQueue('API Error', ErrorNotificationService.getMessage(error));
      return of(result as T);
    };
  }

  private addToMessageQueue(header: string, message: string): void {
    const snackBarMessage = new SnackBarMessage(header, message);
    this.messageQueue.next(snackBarMessage);
  }

  private openSnackBar(snackBarMessage: SnackBarMessage): void {
    this.snackBarRef = this.snackBar.openFromComponent(ErrorNotificationComponent, {
      duration: 3000,
      panelClass: ['redSnackBar'],
      data: {
        header: snackBarMessage.header,
        message: ErrorNotificationService.getMessage(snackBarMessage.message)
      }
    });
  }

}

class SnackBarMessage {
  constructor(public header: string,
              public message: string) {
  }
}
