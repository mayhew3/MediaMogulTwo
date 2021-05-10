import {Action, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {ApiService} from '../services/api.service';
import {Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import produce from 'immer';
import {GameData} from '../interfaces/ModelData/GameData';
import {GetGames} from '../actions/game.action';

export class GameStateModel {
  games: GameData[];
}

@State<GameStateModel>({
  name: 'games',
  defaults: {
    games: undefined
  }
})
@Injectable()
export class GlobalPlatformState {
  constructor(private api: ApiService) {
  }

  @Action(GetGames)
  getGames({setState}: StateContext<GameStateModel>, action: GetGames): Observable<any> {
    const params = new HttpParams()
      .set('person_id', action.person_id.toString());
    return this.api.getAfterFullyConnected<any[]>('/api/games', params).pipe(
      tap(result => {
        setState(
          produce(draft => {
            draft.games = result;
          })
        );
      })
    );
  }

}
