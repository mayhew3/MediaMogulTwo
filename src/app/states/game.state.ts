import {Action, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {ApiService} from '../services/api.service';
import {Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import produce from 'immer';
import {GameData} from '../interfaces/ModelData/GameData';
import {
  AddAvailableGamePlatforms,
  AddGameToMyCollection,
  AddGlobalGame,
  ChangePreferredPlatform,
  GetGameplaySessions,
  GetGames,
  UpdateGame,
  UpdateMyGamePlatform
} from '../actions/game.action';
import _ from 'underscore';
import {AvailableGamePlatformData} from '../interfaces/Model/AvailableGamePlatform';
import {ArrayUtil} from '../utility/ArrayUtil';
import {MyGamePlatformData} from '../interfaces/ModelData/MyGamePlatformData';
import {WritableDraft} from 'immer/dist/types/types-external';

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

  @Action(UpdateMyGamePlatform)
  updateMyGamePlatform({setState}: StateContext<GameStateModel>, action: UpdateMyGamePlatform): void {
    setState(
      produce(draft => {
        const myGamePlatform = action.myGamePlatform;
        const availablePlatforms = _.flatten(_.map(draft.games, game => game.availablePlatforms));
        const availableWhichWillBeMine: AvailableGamePlatformData = _.findWhere(availablePlatforms, {id: myGamePlatform.available_game_platform_id});
        ArrayUtil.updateChangedFieldsOnObject(availableWhichWillBeMine.myGamePlatform, myGamePlatform);
      })
    );
  }

  @Action(ChangePreferredPlatform)
  changePreferredPlatform({setState}: StateContext<GameStateModel>, action: ChangePreferredPlatform): void {
    setState(
      produce(draft => {
        const myGamePlatform = this.findMyGamePlatform(draft.games, action.myGamePlatformID);
        const game = this.getGameFromMy(draft.games, myGamePlatform);
        const currentlyPreferred = this.getPreferredPlatform(game);

        if (!!currentlyPreferred) {
          currentlyPreferred.preferred = false;
        }

        myGamePlatform.preferred = true;
      })
    );
  }

  @Action(UpdateGame)
  updateGame({setState}: StateContext<GameStateModel>, action: UpdateGame): void {
    setState(
      produce(draft => {
        const gameData = action.game;
        const game = _.findWhere(draft.games, {id: action.game.id});
        ArrayUtil.updateChangedFieldsOnObject(game, gameData);
      })
    );
  }


  private getGameFromMy(games: WritableDraft<GameData[]>, myGamePlatform: WritableDraft<MyGamePlatformData>): WritableDraft<GameData> {
    const availableGamePlatform = this.getAvailableGamePlatform(games, myGamePlatform);
    return this.getGameFromAvail(games, availableGamePlatform);
  }

  // noinspection JSMethodCanBeStatic
  private getGameFromAvail(games: WritableDraft<GameData[]>, availableGamePlatform: WritableDraft<AvailableGamePlatformData>): WritableDraft<GameData> {
    return _.find(games, game => !!_.findWhere(game.availablePlatforms, {id: availableGamePlatform.id}));
  }

  // noinspection JSMethodCanBeStatic
  private getAvailableGamePlatform(games: WritableDraft<GameData[]>, myGamePlatform: WritableDraft<MyGamePlatformData>): WritableDraft<AvailableGamePlatformData> {
    return _.chain(games)
      .map(g => g.availablePlatforms)
      .flatten()
      .findWhere({id: myGamePlatform.available_game_platform_id})
      .value();
  }

  private findMyGamePlatform(games: WritableDraft<GameData[]>, myGamePlatformID: number): WritableDraft<MyGamePlatformData> {
    return _.chain(games)
      .map(g => g.availablePlatforms)
      .flatten()
      .filter(a => !!a.myGamePlatform)
      .map(a => a.myGamePlatform)
      .findWhere({id: myGamePlatformID})
      .value();
  }

  // noinspection JSMethodCanBeStatic
  private getPreferredPlatform(game: GameData): MyGamePlatformData {
    return _.chain(game.availablePlatforms)
      .flatten()
      .filter(a => !!a.myGamePlatform)
      .map(a => a.myGamePlatform)
      .filter(m => !!m.preferred)
      .first()
      .value();
  }

}
