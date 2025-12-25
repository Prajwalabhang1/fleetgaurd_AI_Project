import { Component } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ServiceService } from 'src/app/shared/service.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { AuthService } from 'src/app/shared/service/auth.service';

@Component({
  selector: 'app-all-users',
  templateUrl: './all-users.component.html',
  styleUrls: ['./all-users.component.scss'],
})
export class AllUsersComponent {
  dataSource!: MatTableDataSource<any>;
  displayedColumns: string[] = ['id', 'emp_id', 'name', 'email', 'password'];

  constructor(
    private service: ServiceService,
    private toastr: ToastrService,
    private router: Router,
    public dialog: MatDialog,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.authService.startTokenRefreshTimer(); // Start token refresh on component load
    this.getAllUsers();
  }

  getAllUsers() {
    const token = this.authService.getAccessToken();
    if (token) {
      this.service.allUsers(token).subscribe({
        next: (res: any) => {
          this.dataSource = new MatTableDataSource(res);
        },
        error: (err: any) => {
          console.log(err);
          this.toastr.error('Failed to fetch users.', 'Error');
        },
      });
    } else {
      this.authService.logout(); // Logout if no token is found
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openChangePasswordDialog(user: any) {
    const dialogRef = this.dialog.open(ChangePasswordDialogComponent, {
      width: '400px',
      data: { email: user.email },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const token = this.authService.getAccessToken();
        if (token) {
          this.service
            .changePasswordByUser({ email: user.email, new_password: result.newPassword }, token)
            .subscribe({
              next: () => {
                this.getAllUsers(); // Refresh the list after password change
                this.toastr.success('Password changed successfully!', 'Success');
              },
              error: (err: any) => {
                console.log(err);
                this.toastr.error('Failed to change password.', 'Error');
              },
            });
        } else {
          this.authService.logout();
        }
      }
    });
  }
}
