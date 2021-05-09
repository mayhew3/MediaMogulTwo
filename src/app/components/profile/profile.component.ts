import {Component} from '@angular/core';
import {MyAuthService} from '../../services/my-auth.service';

@Component({
  selector: 'mm-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent {

  constructor(public auth: MyAuthService) { }

}
