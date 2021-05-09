import {GamePlatform} from '../interfaces/Model/GamePlatform';
import {Action, State, StateContext} from '@ngxs/store';
import {Injectable} from '@angular/core';
import {ApiService} from '../services/api.service';
import {GetGlobalPlatforms} from '../actions/global.platform.action';
import {Observable} from 'rxjs';
import {HttpParams} from '@angular/common/http';
import {tap} from 'rxjs/operators';
import produce from 'immer';

export class GlobalPlatformStateModel {
  globalPlatforms: GamePlatform[];
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
      tap(result => {
        setState(
          produce(draft => {
            draft.globalPlatforms = result;
          })
        );
      })
    );
  }
}
