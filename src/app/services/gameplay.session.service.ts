import {Injectable, OnDestroy} from '@angular/core';
import {Game} from '../interfaces/Model/Game';
import {HttpClient} from '@angular/common/http';
import * as _ from 'underscore';
import {GameplaySession} from '../interfaces/Model/GameplaySession';
import {PersonService} from './person.service';
import {Observable, Subject} from 'rxjs';
import {concatMap, map, takeUntil} from 'rxjs/operators';
import {Person} from '../interfaces/Model/Person';

@Injectable({
  providedIn: 'root'
})
export class GameplaySessionService implements OnDestroy {
  private _gamesUrl = '/api/gameplaySessions';

  private _destroy$ = new Subject();

  constructor(private http: HttpClient,
              private personService: PersonService) {

  }

  getGameplaySessions(game: Game): Observable<GameplaySession[]> {
    return this.personService.me$.pipe(
      concatMap((me: Person) => {
        const personID = me.id.value;
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