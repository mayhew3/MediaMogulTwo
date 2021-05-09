import {Injectable, OnDestroy} from '@angular/core';
import {Game} from '../interfaces/Model/Game';
import {HttpClient} from '@angular/common/http';
import * as _ from 'underscore';
import {GameplaySession} from '../interfaces/Model/GameplaySession';
import {PersonService} from './person.service';
import {Observable, Subject} from 'rxjs';
import {concatMap, filter, map, takeUntil} from 'rxjs/operators';
import {Person} from '../interfaces/Model/Person';
import {Store} from '@ngxs/store';
import {GetGameplaySessions} from '../actions/gameplay.session.action';

@Injectable({
  providedIn: 'root'
})
export class GameplaySessionService implements OnDestroy {

  gameplaySessions: Observable<GameplaySession[]> = this.store.select(state => state.gameplaySessions).pipe(
    map(model => model.gameplaySessions),
    filter(gameplaySessions => !!gameplaySessions)
  );

  private _gamesUrl = '/api/gameplaySessions';

  private _destroy$ = new Subject();

  constructor(private http: HttpClient,
              private personService: PersonService,
              private store: Store) {
    this.personService.me$.subscribe(me => {
      this.store.dispatch(new GetGameplaySessions(me.id));
    });
  }

  getGameplaySessions(game: Game): Observable<GameplaySession[]> {
    return this.personService.me$.pipe(
      concatMap((me: Person) => {
        const personID = me.id;
        const payload = {
          person_id: personID.toString(),
          game_id: game.id.originalValue.toString()
        };
        const options = {
          params: payload
        };
        return this.http.get<GameplaySession[]>(this._gamesUrl, options)
          .pipe(takeUntil(this._destroy$));
      }),
      map((sessionArr: any[]) => _.map(sessionArr, sessionObj => new GameplaySession().initializedFromJSON(sessionObj)))
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
