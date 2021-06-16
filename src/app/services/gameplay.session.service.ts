import {Injectable} from '@angular/core';
import {Game} from '../interfaces/Model/Game';
import {HttpClient} from '@angular/common/http';
import {PersonService} from './person.service';
import {Observable} from 'rxjs';
import {concatMap, filter, map, mergeMap} from 'rxjs/operators';
import {Person} from '../interfaces/Model/Person';
import {Store} from '@ngxs/store';
import {GetGameplaySessions} from '../actions/game.action';
import {GameService} from './game.service';
import {GameplaySession} from '../interfaces/Model/GameplaySession';

@Injectable({
  providedIn: 'root'
})
export class GameplaySessionService {

  constructor(private http: HttpClient,
              private personService: PersonService,
              private gameService: GameService,
              private store: Store) {
  }

  refreshGameplaySessions(game_id: number): Observable<any> {
    return this.personService.me$.pipe(
      mergeMap((me: Person) => {
        const personID = me.id;
        return this.store.dispatch(new GetGameplaySessions(personID, game_id));
      })
    );
  }

}
