import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject, Observable, Subject} from 'rxjs';
import {GamePlatform} from '../interfaces/Model/GamePlatform';
import {HttpClient} from '@angular/common/http';
import {ArrayService} from './array.service';
import {map, takeUntil} from 'rxjs/operators';
import * as _ from 'underscore';
import fast_sort from 'fast-sort';
import {PersonService} from './person.service';

@Injectable({
  providedIn: 'root'
})
export class PlatformService implements OnDestroy {
  private _platforms$ = new BehaviorSubject<GamePlatform[]>([]);
  private _platforms: GamePlatform[];
  private _fetching = false;

  private _destroy$ = new Subject();

  constructor(private http: HttpClient,
              private arrayService: ArrayService,
              private personService: PersonService) { }

  // public observable for all changes to platform list
  get platforms() {
    return this._platforms$.asObservable();
  }

  get myPlatforms(): Observable<GamePlatform[]> {
    return this.platforms.pipe(
      map((platforms: GamePlatform[]) => {
        const filtered: GamePlatform[] = _.filter(platforms, platform => platform.isAvailableForMe());
        fast_sort(filtered)
          .asc(platform => platform.myGlobalPlatform.rank);
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
        .get<any[]>('api/gamePlatforms', options)
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
    this._platforms$.next(this.arrayService.cloneArray(this._platforms));
  }

  private convertObjectsToPlatforms(platformObjs: any[]): GamePlatform[] {
    return _.map(platformObjs, platformObj => new GamePlatform().initializedFromJSON(platformObj));
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
}
