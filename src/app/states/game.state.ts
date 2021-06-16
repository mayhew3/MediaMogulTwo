import {Action, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {ApiService} from '../services/api.service';
import {Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import produce from 'immer';
import {GameData} from '../interfaces/ModelData/GameData';
import {AddAvailableGamePlatforms, AddGameToMyCollection, AddGlobalGame, GetGameplaySessions, GetGames} from '../actions/game.action';
import _ from 'underscore';
import {AddGlobalPlatforms} from '../actions/global.platform.action';
import {GlobalPlatformStateModel} from './global.platform.state';
import {AvailableGamePlatformData} from '../interfaces/Model/AvailableGamePlatform';

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
export class GameState {
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

  @Action(GetGameplaySessions)
  getGameplaySessions({setState}: StateContext<GameStateModel>, action: GetGameplaySessions): Observable<any> {
    const params = new HttpParams()
      .set('person_id', action.person_id.toString())
      .set('game_id', action.game_id.toString());
    return this.api.getAfterFullyConnected<any[]>('/api/gameplaySessions', params).pipe(
      tap(result => {
        setState(
          produce(draft => {
            const game = _.findWhere(draft.games, {id: action.game_id});
            game.sessions = result;
          })
        );
      })
    );
  }

  @Action(AddGlobalGame)
  addGlobalGame({setState}: StateContext<GameStateModel>, action: AddGlobalGame): void {
    setState(
      produce(draft => {
        draft.games.push(action.game);
      })
    );
  }

  @Action(AddAvailableGamePlatforms)
  addAvailableGamePlatforms({setState}: StateContext<GameStateModel>, action: AddAvailableGamePlatforms): void {
    setState(
      produce(draft => {
        const game = _.findWhere(draft.games, {id: action.game_id});
        game.availablePlatforms = action.availableGamePlatforms;
      })
    );
  }

  @Action(AddGameToMyCollection)
  addGameToCollection({setState}: StateContext<GameStateModel>, action: AddGameToMyCollection): void {
    setState(
      produce(draft => {
        const myGamePlatform = action.myGamePlatform;
        const availablePlatforms = _.flatten(_.map(draft.games, game => game.availablePlatforms));
        const availableWhichWillBeMine: AvailableGamePlatformData = _.findWhere(availablePlatforms, {id: myGamePlatform.available_game_platform_id});
        availableWhichWillBeMine.myGamePlatform = myGamePlatform;
      })
    );
  }


}
