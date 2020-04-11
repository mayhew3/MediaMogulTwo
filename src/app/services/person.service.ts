import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Person} from '../interfaces/Person';
import {Observable, of} from 'rxjs';
import {catchError, concatMap, tap} from 'rxjs/operators';
import {ArrayService} from './array.service';
import * as _ from 'underscore';
import {AuthService} from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  personsUrl = 'api/persons';
  cache: Person[];
  me$ = this.authService.getUser$().pipe(
    concatMap((user) => this.getPersonWithEmail(user.email)),
    tap((person: Person) => {
      this.isAdmin = person.user_role === 'admin'
    })
  );
  isAdmin: boolean = null;

  constructor(private http: HttpClient,
              private arrayService: ArrayService,
              private authService: AuthService) {
    this.cache = [];
  }

  getPersonWithEmail(email: string): Observable<Person> {
    return this.getDataWithCacheUpdate<Person>(() => {
      return this.getPersonWithEmailFromCache(email);
    });
  }

  private getPersonWithEmailFromCache(email: string): Person {
    return _.findWhere(this.cache, {email: email});
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
        this.http.get<Person[]>(this.personsUrl)
          .pipe(
            catchError(this.handleError<Person[]>('getPersons', []))
          )
          .subscribe(
            (persons: Person[]) => {
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
