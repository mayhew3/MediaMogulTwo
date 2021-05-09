import {Component} from '@angular/core';
import {ApiService} from './services/api.service';
import {MyAuthService} from './services/my-auth.service';
import {ThemePalette} from '@angular/material/core';
import {PersonService} from './services/person.service';

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
              private personService: PersonService) {
  }

  get failedEmail(): boolean {
    return this.personService.failedEmail;
  }

}
