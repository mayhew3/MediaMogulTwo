import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {filter, map, mergeMap, tap} from 'rxjs/operators';
import _ from 'underscore';
import {Person} from '../interfaces/Model/Person';
import {MyAuthService} from './my-auth.service';
import {ApiService} from './api.service';
import {Store} from '@ngxs/store';
import {GetPersons} from '../actions/persons.action';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  isAdmin: boolean = null;
  failedEmail = false;

  me$ = this.auth.userEmail$.pipe(
    mergeMap(email => this.getPersonWithEmail(email)),
    tap(person => this.failedEmail = !person),
    filter(person => !!person)
  );

  persons: Observable<Person[]> = this.store.select(state => state.persons).pipe(
    filter(state => !!state),
    map(state => state.persons),
    filter(persons => !!persons)
  );

  constructor(private http: HttpClient,
              private auth: MyAuthService,
              private apiService: ApiService,
              private store: Store) {
    this.store.dispatch(new GetPersons());
    this.me$.subscribe(me => {
      this.isAdmin = (me.user_role === 'admin');
      this.apiService.meChanged(me);
    });
  }

  getPersonWithEmail(email: string): Observable<Person> {
    return this.persons.pipe(
      map(persons => _.findWhere(persons, {email}))
    );
  }

}
