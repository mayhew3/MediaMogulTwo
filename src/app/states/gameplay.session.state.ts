import {GameplaySession} from '../interfaces/Model/GameplaySession';
import {Action, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {GetGameplaySessions} from '../actions/gameplay.session.action';
import {Observable} from 'rxjs';

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
  @Action(GetGameplaySessions)
  getGameplaySessions({setState}: StateContext<GameplaySessionStateModel>): Observable<any> {

  }
}
