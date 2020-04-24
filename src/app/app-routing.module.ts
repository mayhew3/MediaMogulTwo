import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {BrowseGamesComponent} from './components/browse-games/browse-games.component';
import {ProfileComponent} from './components/profile/profile.component';
import {AuthGuard} from './services/auth/auth.guard';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {InterceptorService} from './services/interceptor.service';
import {AddGameComponent} from './components/add-game/add-game.component';
import {DuplicateResolutionComponent} from './components/duplicate-resolution/duplicate-resolution.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard]
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
  {
    path: 'addGame',
    component: AddGameComponent,
    canActivate: [AuthGuard]
  },
  {
    path: 'duplicates',
    component: DuplicateResolutionComponent,
    canActivate: [AuthGuard]
  },
];

@NgModule({
  declarations: [],
  imports: [[RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' })]],
  exports: [RouterModule],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptorService,
      multi: true,
    }
  ],
})
export class AppRoutingModule { }
