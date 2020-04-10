import { Injectable } from '@angular/core';
import {Person} from '../interfaces/Person';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  getPerson(): Promise<Person> {
    return new Promise<Person>(resolve => {
      const person: Person = {
        id: 1
      };
      resolve(person);
    });
  }

  isAdmin(): boolean {
    return true;
  }
}
