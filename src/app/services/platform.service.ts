import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import {GamePlatform} from '../interfaces/Model/GamePlatform';
import {HttpClient} from '@angular/common/http';
import {filter, map} from 'rxjs/operators';
import _ from 'underscore';
import fast_sort from 'fast-sort';
import {PersonService} from './person.service';
import {MyGlobalPlatform} from '../interfaces/Model/MyGlobalPlatform';
import {Game} from '../interfaces/Model/Game';
import {AvailableGamePlatform} from '../interfaces/Model/AvailableGamePlatform';
import {ApiService} from './api.service';
import {Store} from '@ngxs/store';
import {GetGlobalPlatforms} from '../actions/global.platform.action';
import {MyGamePlatform} from '../interfaces/Model/MyGamePlatform';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {

  constructor(private http: HttpClient,
              private apiService: ApiService,
              private store: Store,
              private personService: PersonService) {
    this.personService.me$.subscribe(me => {
      this.store.dispatch(new GetGlobalPlatforms(me.id));
    });
  }

  // public observable for all changes to platform list
  get platforms(): Observable<GamePlatform[]> {
    return this.store.select(state => state.globalPlatforms).pipe(
      filter(store => !!store),
      map(store => store.globalPlatforms),
      filter(globalPlatforms => !!globalPlatforms)
    );
  }

  get myPlatforms(): Observable<GamePlatform[]> {
    return this.platforms.pipe(
      map((platforms: GamePlatform[]) => {
        const filtered: GamePlatform[] = _.filter(platforms, platform => !!platform.myGlobalPlatform);
        fast_sort(filtered)
          .asc(platform => platform.myGlobalPlatform.rank);
        return filtered;
      })
    );
  }

  addPlatform(gamePlatform: GamePlatform): void {
    this.apiService.executePostAfterFullyConnected('/api/gamePlatforms', gamePlatform);
  }

  waitForPlatformAdded(igdb_platform_id: number): Observable<GamePlatform> {
    return this.platforms.pipe(
      map(globalPlatforms => _.findWhere(globalPlatforms, {igdb_platform_id})),
      filter(platform => !!platform)
    );
  }

  updatePlatform(gamePlatform: GamePlatform,
                 full_name: string,
                 short_name: string,
                 metacritic_uri: string): void {
    const data = {
      id: gamePlatform.id,
      changedFields: {
        full_name,
        short_name,
        metacritic_uri
      }
    };
    this.apiService.executePutAfterFullyConnected('/api/gamePlatforms', data);
  }

  addMyGlobalPlatform(myGlobalPlatformObj: any): void {
    this.personService.me$.subscribe(person => {
      myGlobalPlatformObj.person_id = person.id;
      const gamePlatform = myGlobalPlatformObj.platform;
      this.apiService.executePostAfterFullyConnected('/api/myGlobalPlatforms', gamePlatform);
    });
  }

  removeMyGlobalPlatform(myGlobalPlatform: MyGlobalPlatform): void {
    this.apiService.executeDeleteAfterFullyConnected('/api/myGlobalPlatforms', myGlobalPlatform.id);
  }

  addablePlatforms(game: Game): AvailableGamePlatform[] {
    return _.filter(game.availablePlatforms, availableGamePlatform => this.canAddToGame(availableGamePlatform));
  }

  myMutablePlatforms(game: Game): MyGamePlatform[] {
    return _.filter(this.getMyPlatformsInGlobal(game), myGamePlatform => this.canAddPlaytime(myGamePlatform.platform));
  }

  canAddToGame(availableGamePlatform: AvailableGamePlatform): boolean {
    return this.canAddPlaytime(availableGamePlatform.platform) && !!availableGamePlatform.platform.myGlobalPlatform;
  }

  canAddPlaytime(gamePlatform: GamePlatform): boolean {
    return gamePlatform.full_name !== 'Steam';
  }

  /* Transferred from Game object */

  hasPlatformWithName(game: Game, platformName: string): boolean {
    const existing = _.find(game.availablePlatforms, availablePlatform => availablePlatform.platform_name === platformName);
    return !!existing;
  }

  hasPlatformWithID(game: Game, platformID: number): boolean {
    const existing = _.find(game.availablePlatforms, availablePlatform => availablePlatform.platform.id === platformID);
    return !!existing;
  }

  getOwnedPlatformWithID(game: Game, platformID: number): MyGamePlatform {
    return _.find(this.getMyPlatformsInGlobal(game), myPlatform => myPlatform.platform.id === platformID);
  }

  ownsPlatformWithID(game: Game, platformID: number): boolean {
    return !!this.getOwnedPlatformWithID(game, platformID);
  }

  ownsPlatformWithName(game: Game, platformName: string): boolean {
    const existing = _.find(this.getMyPlatformsInGlobal(game), myPlatform => myPlatform.platform_name.value === platformName);
    return !!existing;
  }

  getMyPlatforms(game: Game): MyGamePlatform[] {
    return _.compact(_.map(game.availablePlatforms, availablePlatform => availablePlatform.myGamePlatform));
  }

  getMyPlatformsInGlobal(game: Game): MyGamePlatform[] {
    return _.filter(this.getMyPlatforms(game), myPlatform => !!myPlatform.platform.myGlobalPlatform);
  }

  findPlatformWithIGDBID(game: Game, igdbID: number): AvailableGamePlatform {
    return _.find(game.availablePlatforms, availablePlatform => availablePlatform.platform.igdb_platform_id === igdbID);
  }

  getAvailablePlatformsNotInGlobal(game: Game): AvailableGamePlatform[] {
    return _.filter(game.availablePlatforms, availablePlatform => !availablePlatform.platform.myGlobalPlatform);
  }

}
