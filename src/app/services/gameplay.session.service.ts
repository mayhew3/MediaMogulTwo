import {Injectable, OnDestroy} from '@angular/core';
import {Game} from '../interfaces/Model/Game';
import {HttpClient} from '@angular/common/http';
import {ArrayService} from './array.service';
import * as _ from 'underscore';
import {GameplaySession} from '../interfaces/Model/GameplaySession';
import {PersonService} from './person.service';
import {Observable, Subject} from 'rxjs';
import {concatMap, map} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GameplaySessionService implements OnDestroy {
  private _gamesUrl = 'api/gameplaySessions';

  private _destroy$ = new Subject();

  constructor(private http: HttpClient,
              private arrayService: ArrayService,
              private personService: PersonService) {

  }

  getGameplaySessions(game: Game): Observable<GameplaySession[]> {
    // @ts-ignore
    return this.personService.me$.pipe(
      concatMap(me => {
        const personID = me.id.value;
        const payload = {
          person_id: personID.toString(),
          game_id: game.id.originalValue
        };
        const options = {
          params: payload
        };
        // @ts-ignore
        return this.http.get<GameplaySession[]>(this._gamesUrl, options);
      }),
      map((sessionArr: any[]) => {
        return _.map(sessionArr, sessionObj => {
          return new GameplaySession().initializedFromJSON(sessionObj)
        })
      })
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
