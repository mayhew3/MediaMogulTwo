import {GameplaySession} from '../interfaces/Model/GameplaySession';
import {Action, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {AddGameplaySession, GetGameplaySessions} from '../actions/gameplay.session.action';
import {Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {ApiService} from '../services/api.service';
import {tap} from 'rxjs/operators';
import produce from 'immer';
import _ from 'underscore';

export class GameplaySessionStateModel {
  gameplaySessions: GameplaySession[];
}

@State<GameplaySessionStateModel>({
  name: 'gameplaySessions',
  defaults: {
    gameplaySessions: undefined
  }
})
@Injectable()
export class GameplaySessionState {

  constructor(private api: ApiService) {
  }

  @Action(GetGameplaySessions)
  getGameplaySessions({setState}: StateContext<GameplaySessionStateModel>, action: GetGameplaySessions): Observable<any> {
    const params = new HttpParams()
      .set('person_id', action.person_id.toString());
    return this.api.getAfterFullyConnected<any[]>('/api/gameplaySessions', params).pipe(
      tap(result => {
        setState(
          produce(draft => {
            draft.gameplaySessions = result;
            _.each(draft.gameplaySessions, gs => gs.start_time = new Date(gs.start_time));
          })
        );
      })
    );
  }

}
