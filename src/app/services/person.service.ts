import {Injectable, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of, Subject} from 'rxjs';
import {catchError, concatMap, filter, takeUntil, tap} from 'rxjs/operators';
import {ArrayService} from './array.service';
import * as _ from 'underscore';
import {AuthService} from '@auth0/auth0-angular';
import {Person} from '../interfaces/Model/Person';

@Injectable({
  providedIn: 'root'
})
export class PersonService implements OnDestroy {
  personsUrl = '/api/persons';
  cache: Person[];
  private _destroy$ = new Subject();

  me$ = this.authService.user$.pipe(
    filter(user => !!user),
    concatMap((user: any) => this.getPersonWithEmail(user.email)),
    tap((person: Person) => {
      this.isAdmin = person.user_role.value === 'admin';
    })
  );
  isAdmin: boolean = null;

  constructor(private http: HttpClient,
              private arrayService: ArrayService,
              private authService: AuthService) {
    this.cache = [];
  }

  getPersonWithEmail(email: string): Observable<Person> {
    return this.getDataWithCacheUpdate<Person>(() => this.getPersonWithEmailFromCache(email));
  }

  private getPersonWithEmailFromCache(email: string): Person {
    return _.find(this.cache, person => person.email.value === email);
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }


  // DATA HELPERS

  private getDataWithCacheUpdate<T>(getCallback): Observable<T> {
    return new Observable(observer => {
      this.maybeUpdateCache().subscribe(
        () => observer.next(getCallback()),
        (err: Error) => observer.error(err)
      );
    });
  }

  private maybeUpdateCache(): Observable<Person[]> {
    if (this.cache.length === 0) {
      return new Observable<Person[]>((observer) => {
        this.http.get<any[]>(this.personsUrl)
          .pipe(
            takeUntil(this._destroy$),
            catchError(this.handleError<any[]>('getPersons', [])),
          )
          .subscribe(
            (personObjs: any[]) => {
              const persons = _.map(personObjs, personObj => new Person().initializedFromJSON(personObj));
              this.arrayService.addToArray(this.cache, persons);
              observer.next(persons);
            },
            (err: Error) => observer.error(err)
          );
      });
    } else {
      return of(this.cache);
    }
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

}
