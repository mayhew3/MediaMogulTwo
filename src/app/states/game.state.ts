import {Action, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {ApiService} from '../services/api.service';
import {Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import produce from 'immer';
import {GameData} from '../interfaces/ModelData/GameData';
import {GetGames} from '../actions/game.action';
import _ from 'underscore';

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
            /*_.each(draft.games, game => {
              _.each(game.availablePlatforms, availablePlatform => {
                if (availablePlatform.myGamePlatform) {
                  this.parseDates(availablePlatform.myGamePlatform);
                  /!*availablePlatform.myGamePlatform.last_played = new Date(availablePlatform.myGamePlatform.last_played);
                  availablePlatform.myGamePlatform.collection_add = new Date(availablePlatform.myGamePlatform.collection_add);*!/
                }
              });
            });*/
          })
        );
      })
    );
  }

  private parseDates(obj: Record<string, any>): void {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        if ((typeof value) === 'object') {
          const asDate = !obj[key] ? null : new Date(obj[key]);
          obj[key] = asDate;
        }
      }
    }
  }

}
