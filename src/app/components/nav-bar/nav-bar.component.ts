import {Component, Inject, OnInit} from '@angular/core';
import {GameService} from '../../services/game.service';
import {Observable} from 'rxjs';
import {distinctUntilChanged, map} from 'rxjs/operators';
import * as _ from 'underscore';
import {Game} from '../../interfaces/Model/Game';
import {NgbModal, NgbTypeaheadSelectItemEvent} from '@ng-bootstrap/ng-bootstrap';
import {GameDetailComponent} from '../gamelist/game-detail/game-detail.component';
import {PersonService} from '../../services/person.service';
import {DOCUMENT} from '@angular/common';
import {ArrayUtil} from '../../utility/ArrayUtil';
import {MyAuthService} from '../../services/my-auth.service';

@Component({
  selector: 'mm-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  games: Game[] = [];
  initializing = true;
  public model: Game;

  constructor(public auth: MyAuthService,
              private gameService: GameService,
              public personService: PersonService,
              private modalService: NgbModal,
              @Inject(DOCUMENT) public document: Document) { }

  formatter = (game: Game): string => game.title;

  search = (text$: Observable<string>): Observable<Game[]> =>
    text$.pipe(
      distinctUntilChanged(),
      map((term: string) =>
        _.filter(this.games, v => v.title.toLowerCase().indexOf(term.toLowerCase()) > -1)
          .slice(0, 6))
    );

  ngOnInit(): void {
    this.gameService.games.subscribe(games => {
      ArrayUtil.refreshArray(this.games, games);
      this.initializing = false;
    });
  }

  isLoggedIn$(): Observable<boolean> {
    return this.auth.isAuthenticated$;
  }

  async openPopup(event: NgbTypeaheadSelectItemEvent): Promise<void> {
    const modalRef = this.modalService.open(GameDetailComponent, {size: 'lg'});
    modalRef.componentInstance.game = event.item;
  }
}
