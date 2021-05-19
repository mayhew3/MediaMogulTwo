import {GamePlatformData} from '../interfaces/Model/GamePlatform';
import {Action, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {ApiService} from '../services/api.service';
import {
  AddGlobalPlatforms,
  AddToMyGlobalPlatforms,
  GetGlobalPlatforms,
  RemoveFromMyGlobalPlatforms,
  UpdateGlobalPlatform
} from '../actions/global.platform.action';
import {Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import produce from 'immer';
import _ from 'underscore';
import {AddGameToMyCollection} from '../actions/game.action';

export class GlobalPlatformStateModel {
  globalPlatforms: GamePlatformData[];
}

@State<GlobalPlatformStateModel>({
  name: 'globalPlatforms',
  defaults: {
    globalPlatforms: undefined
  }
})
@Injectable()
export class GlobalPlatformState {
  constructor(private api: ApiService) {
  }

  @Action(GetGlobalPlatforms)
  getGlobalPlatforms({setState}: StateContext<GlobalPlatformStateModel>, action: GetGlobalPlatforms): Observable<any> {
    const params = new HttpParams()
      .set('person_id', action.person_id.toString());
    return this.api.getAfterFullyConnected<any[]>('/api/gamePlatforms', params).pipe(
      tap((result: GamePlatformData[]) => {
        setState(
          produce(draft => {
            draft.globalPlatforms = result;
          })
        );
      })
    );
  }

  @Action(UpdateGlobalPlatform)
  updateGlobalPlatform({setState}: StateContext<GlobalPlatformStateModel>, action: UpdateGlobalPlatform): void {
    setState(
      produce(draft => {
        const platform = _.find(draft.globalPlatforms, globalPlatform => globalPlatform.id === action.global_platform_id);
        platform.full_name = action.full_name;
        platform.short_name = action.short_name;
        platform.metacritic_uri = action.metacritic_uri;
      })
    );
  }

  @Action(AddGlobalPlatforms)
  addGlobalPlatforms({setState}: StateContext<GlobalPlatformStateModel>, action: AddGlobalPlatforms): void {
    setState(
      produce(draft => {
        draft.globalPlatforms.push(...action.platforms);
      })
    );
  }

  @Action(AddToMyGlobalPlatforms)
  addToMyGlobalPlatforms({setState}: StateContext<GlobalPlatformStateModel>, action: AddToMyGlobalPlatforms): void {
    setState(
      produce(draft => {
        const platform = _.findWhere(draft.globalPlatforms, {id: action.myGlobalPlatform.game_platform_id});
        platform.myGlobalPlatform = action.myGlobalPlatform;
      })
    );
  }

  @Action(RemoveFromMyGlobalPlatforms)
  removeFromMyGlobalPlatforms({setState}: StateContext<GlobalPlatformStateModel>, action: RemoveFromMyGlobalPlatforms): void {
    setState(
      produce(draft => {
        const platform = _.findWhere(draft.globalPlatforms, {id: action.game_platform_id});
        delete platform.myGlobalPlatform;
      })
    );
  }

}
