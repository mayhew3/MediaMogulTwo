import {Component, Inject, OnInit} from '@angular/core';
import {AuthService} from '@auth0/auth0-angular';
import {GameService} from '../../services/game.service';
import {Observable} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';
import {ArrayService} from '../../services/array.service';
import * as _ from 'underscore';
import {Game} from '../../interfaces/Model/Game';
import {NgbModal, NgbTypeaheadSelectItemEvent} from '@ng-bootstrap/ng-bootstrap';
import {GameDetailComponent} from '../game-detail/game-detail.component';
import {PersonService} from '../../services/person.service';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'mm-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  games = [];
  initializing = true;
  public model: Game;

  formatter = (game: Game) => game.title.value;

  search = (text$: Observable<string>) =>
    text$.pipe(
      distinctUntilChanged(),
      map((term: string) =>
        _.filter(this.games, v => v.title.value.toLowerCase().indexOf(term.toLowerCase()) > -1)
          .slice(0, 6))
    );

  constructor(public auth: AuthService,
              private gameService: GameService,
              private arrayService: ArrayService,
              public personService: PersonService,
              private modalService: NgbModal,
              @Inject(DOCUMENT) public document: Document) { }

  ngOnInit(): void {
    this.gameService.games.subscribe(games => {
      this.arrayService.refreshArray(this.games, games);
      this.initializing = false;
    });
    this.gameService.maybeRefreshCache();
  }

  isLoggedIn$(): Observable<boolean> {
    return this.auth.isAuthenticated$;
  }

  async openPopup(event: NgbTypeaheadSelectItemEvent) {
    const modalRef = this.modalService.open(GameDetailComponent, {size: 'lg'});
    modalRef.componentInstance.game = event.item;
  }
}
