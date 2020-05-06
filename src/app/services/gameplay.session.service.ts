import {Injectable, OnDestroy} from '@angular/core';
import {Game} from '../interfaces/Model/Game';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ArrayService} from './array.service';
import * as _ from 'underscore';
import {GameplaySession} from '../interfaces/Model/GameplaySession';
import {PersonService} from './person.service';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {PlatformService} from './platform.service';
import {GamePlatform} from '../interfaces/Model/GamePlatform';
import {Person} from '../interfaces/Model/Person';
import {concatMap, filter, map} from 'rxjs/operators';
import {MyGamePlatform} from '../interfaces/Model/MyGamePlatform';
import {AvailableGamePlatform} from '../interfaces/Model/AvailableGamePlatform';
import {MyGlobalPlatform} from '../interfaces/Model/MyGlobalPlatform';

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
      })
    );
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

}
