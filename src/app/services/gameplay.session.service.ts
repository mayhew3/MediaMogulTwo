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

  private _gamesUrl = '/api/gameplaySessions';

  private _destroy$ = new Subject();

  constructor(private http: HttpClient,
              private personService: PersonService) {
  }

  getGameplaySessions(game: Game): Observable<any[]> {
    return this.personService.me$.pipe(
      concatMap((me: Person) => {
        const personID = me.id;
        const payload = {
          person_id: personID.toString(),
          game_id: game.id.toString()
        };
        const options = {
          params: payload
        };
        return this.http.get<GameplaySession[]>(this._gamesUrl, options)
          .pipe(takeUntil(this._destroy$));
      }),
      map((sessionArr: any[]) => _.map(sessionArr, () => {}))
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
