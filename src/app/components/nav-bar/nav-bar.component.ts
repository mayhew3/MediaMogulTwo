import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';
import {GameService} from '../../services/game.service';
import {Observable} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {ArrayService} from '../../services/array.service';
import * as _ from 'underscore';

@Component({
  selector: 'mm-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  games = [];
  initializing = true;
  public model: any;

  search = (text$: Observable<string>) =>
    text$.pipe(
      distinctUntilChanged(),
      map(term =>
        _.filter(_.map(this.games, game => game.title), v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)
          .slice(0, 6))
    );

  constructor(public auth: AuthService,
              private gameService: GameService,
              private arrayService: ArrayService) { }

  ngOnInit(): void {
    this.gameService.maybeRefreshCache().then(games => {
      this.arrayService.refreshArray(this.games, games);
      this.initializing = false;
    });
  }

}
