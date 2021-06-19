import {Component} from '@angular/core';
import {ApiService} from './services/api.service';
import {MyAuthService} from './services/my-auth.service';
import {ThemePalette} from '@angular/material/core';
import {PersonService} from './services/person.service';
import {MessagingService} from './services/messaging.service';
import {InitSocketService} from './services/init-socket.service';

@Component({
  selector: 'mm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'media-mogul-two';

  authenticatingColor: ThemePalette = 'primary';
  loadingColor: ThemePalette = 'accent';

  constructor(public apiService: ApiService,
              public auth: MyAuthService,
              private personService: PersonService,
              private initSocket: InitSocketService,
              private messagingService: MessagingService) {
  }

  get failedEmail(): boolean {
    return this.personService.failedEmail;
  }

}
