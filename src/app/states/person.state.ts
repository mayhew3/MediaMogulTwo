import {Action, State, StateContext} from '@ngxs/store';
import {Observable} from 'rxjs';
import {tap} from 'rxjs/operators';
import {Injectable} from '@angular/core';
import produce from 'immer';
import {ApiService} from '../services/api.service';
import {Person} from '../interfaces/Model/Person';
import {GetPersons} from '../actions/persons.action';

export class PersonStateModel {
  persons: Person[];
}

@State<PersonStateModel>({
  name: 'persons',
  defaults: {
    persons: undefined
  }
})
@Injectable()
export class PersonState {
  stateChanges = 0;

  constructor(private api: ApiService) {
  }

  @Action(GetPersons)
  getPersons({setState}: StateContext<PersonStateModel>): Observable<any> {
    return this.api.getAfterAuthenticate<Person[]>('/api/persons').pipe(
      tap((result: Person[]) => {
        setState(
          produce(draft => {
            draft.persons = result;
          })
        );
        this.stateChanges++;
      })
    );
  }

}

