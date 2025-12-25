import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './admin/home/home.component';
import { LoginComponent } from './admin/login/login.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { AuthGuard } from './guard/auth.guard';
import { AllUsersComponent } from './admin/sidebar/all-users/all-users.component';
import { AddUsersComponent } from './admin/sidebar/add-users/add-users.component';
import { AdminGuard } from './guard/admin.guard';
import { AddAdminComponent } from './admin/sidebar/add-admin/add-admin.component';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '', component: HomeComponent, canActivate: [AuthGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'all-users', component: AllUsersComponent, canActivate: [AdminGuard] },
      { path: 'add-users', component: AddUsersComponent, canActivate: [AdminGuard] },
      { path: 'add-admin', component: AddAdminComponent, canActivate: [AdminGuard] }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
