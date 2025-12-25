import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { HomeComponent } from './admin/home/home.component';
import { SidebarComponent } from './admin/sidebar/sidebar.component';
import { LoginComponent } from './admin/login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { FlexLayoutModule } from '@angular/flex-layout';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
// import { AuthinterceptorInterceptor } from '../app/interceptor/authinterceptor.interceptor';
import { NgChartsModule } from 'ng2-charts';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastrModule } from 'ngx-toastr';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule } from '@angular/material/dialog';
import { DatePipe, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { ForgotPasswordModalComponent } from './admin/login/forgot-password-modal/forgot-password-modal.component';
import { AllUsersComponent } from './admin/sidebar/all-users/all-users.component';
import { AddUsersComponent } from './admin/sidebar/add-users/add-users.component';
import { ChangePasswordDialogComponent } from './admin/sidebar/all-users/change-password-dialog/change-password-dialog.component';
import { AddAdminComponent } from './admin/sidebar/add-admin/add-admin.component';


@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HomeComponent,
    SidebarComponent,
    LoginComponent,
    ForgotPasswordModalComponent,
    AllUsersComponent,
    AddUsersComponent,
    ChangePasswordDialogComponent,
    AddAdminComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatButtonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatCardModule,
    FlexLayoutModule,
    NgChartsModule,
    FormsModule,
    MatInputModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatSelectModule,
    ToastrModule.forRoot(),
    DatePipe,
    MatDialogModule,
    MatMenuModule

  ],

  //, { provide: HTTP_INTERCEPTORS, useClass: AuthinterceptorInterceptor, multi: true }
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }],
  bootstrap: [AppComponent],

})
export class AppModule { }
