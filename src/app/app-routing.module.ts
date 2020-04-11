import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {BrowseGamesComponent} from './components/browse-games/browse-games.component';
import {ProfileComponent} from './components/profile/profile.component';
import {AuthGuard} from './services/auth/auth.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'browse',
    component: BrowseGamesComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  declarations: [],
  imports: [[RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })]],
  exports: [RouterModule]
})
export class AppRoutingModule { }
