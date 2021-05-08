import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {GamePlatform} from '../interfaces/Model/GamePlatform';
import {HttpClient} from '@angular/common/http';
import {map, takeUntil} from 'rxjs/operators';
import * as _ from 'underscore';
import fast_sort from 'fast-sort';
import {PersonService} from './person.service';
import {MyGlobalPlatform} from '../interfaces/Model/MyGlobalPlatform';
import {ArrayUtil} from '../utility/ArrayUtil';

@Injectable({
  providedIn: 'root'
})
export class PlatformService implements OnDestroy {
  private _platforms$ = new BehaviorSubject<GamePlatform[]>([]);
  private _platforms: GamePlatform[];
  private _fetching = false;

  private _destroy$ = new Subject();

  constructor(private http: HttpClient,
              private personService: PersonService) { }

  // public observable for all changes to platform list
  get platforms(): Observable<GamePlatform[]> {
    return this._platforms$.asObservable();
  }

  get myPlatforms(): Observable<GamePlatform[]> {
    return this.platforms.pipe(
      map((platforms: GamePlatform[]) => {
        const filtered: GamePlatform[] = _.filter(platforms, platform => platform.isAvailableForMe());
        fast_sort(filtered)
          .asc(platform => platform.myGlobalPlatform.rank.originalValue);
        return filtered;
      })
    );
  }

  maybeRefreshCache() {
    if (!this._platforms) {
      this._fetching = true;
      this.refreshCache();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  async addPlatform(gamePlatform: GamePlatform): Promise<GamePlatform> {
    const returnObj = await gamePlatform.commit(this.http);
    this._platforms.push(returnObj);
    this.pushPlatformListChange();
    return returnObj;
  }

  async updatePlatform(gamePlatform: GamePlatform): Promise<GamePlatform> {
    await gamePlatform.commit(this.http);
    this.pushPlatformListChange();
    return gamePlatform;
  }

  async addMyGlobalPlatform(myGlobalPlatform: MyGlobalPlatform): Promise<MyGlobalPlatform> {
    return new Promise(resolve => {
      this.personService.me$.subscribe(async person => {
        myGlobalPlatform.person_id.value = person.id.value;
        const gamePlatform = myGlobalPlatform.platform;
        gamePlatform.myGlobalPlatform = await myGlobalPlatform.commit(this.http);
        this.pushPlatformListChange();
        resolve(gamePlatform.myGlobalPlatform);
      });
    });
  }

  async removeMyGlobalPlatform(myGlobalPlatform: MyGlobalPlatform): Promise<any> {
    const gamePlatform = myGlobalPlatform.platform;
    await myGlobalPlatform.delete(this.http);
    delete gamePlatform.myGlobalPlatform;
    this.pushPlatformListChange();
  }

  async updateMyGlobalPlatform(myGlobalPlatform: MyGlobalPlatform): Promise<MyGlobalPlatform> {
    await myGlobalPlatform.commit(this.http);
    this.pushPlatformListChange();
    return myGlobalPlatform;
  }

  addToPlatformsIfDoesntExist(gamePlatform: GamePlatform): void {
    if (gamePlatform.isTemporary()) {
      throw new Error('PlatformService cannot contain temporary platforms');
    }
    const existing = _.find(this._platforms, platform => platform.id.value === gamePlatform.id.value);
    if (!existing) {
      this._platforms.push(gamePlatform);
      this.pushPlatformListChange();
    }

  }

  private refreshCache() {
    this.personService.me$.subscribe(person => {
      const personID = person.id.value;
      const payload = {
        person_id: personID.toString()
      };
      const options = {
        params: payload
      };
      this.http
        .get<any[]>('/api/gamePlatforms', options)
        .pipe(takeUntil(this._destroy$))
        .subscribe(platformObjs => {
          this._platforms = this.convertObjectsToPlatforms(platformObjs);
          fast_sort(this._platforms).asc(platform => platform.id.originalValue);
          this.pushPlatformListChange();
          this._fetching = false;
        });
    });
  }

  private pushPlatformListChange() {
    this._platforms$.next(ArrayUtil.cloneArray(this._platforms));
  }

  private convertObjectsToPlatforms(platformObjs: any[]): GamePlatform[] {
    return _.map(platformObjs, platformObj => new GamePlatform().initializedFromJSON(platformObj));
  }

}
