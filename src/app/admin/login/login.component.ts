// import { Component, OnInit } from '@angular/core';
// import { Router, NavigationStart } from '@angular/router';
// import { ToastrService } from 'ngx-toastr';
// import { AuthService } from 'src/app/shared/service/auth.service';
// import { MatDialog } from '@angular/material/dialog';
// import { ForgotPasswordModalComponent } from './forgot-password-modal/forgot-password-modal.component';

// @Component({
//   selector: 'app-login',
//   templateUrl: './login.component.html',
//   styleUrls: ['./login.component.scss'],
// })
// export class LoginComponent implements OnInit {
//   email: string = '';
//   password: string = '';
//   role: string = '';  // Add role here
//   hide = true;

//   togglePasswordVisibility() {
//     this.hide = !this.hide;
//   }

//   constructor(private authService: AuthService, private toastr: ToastrService, private router: Router, private dialog: MatDialog) { }

//   ngOnInit() {
//     this.router.events.subscribe((event) => {
//       if (event instanceof NavigationStart) {
//         const isLoginPage = event.url === '/login'; // Adjust the URL for your login page
//         if (isLoginPage) {
//           // Disable browser forward option
//           history.pushState({}, '', location.href);
//         }
//       }
//     });
//   }

//   openForgotPasswordModal(event: Event) {
//     event.preventDefault();
//     this.dialog.open(ForgotPasswordModalComponent, {
//       width: '600px',
//       height: '400px'
//     });
//   }

//   login(event: Event) {
//     event.preventDefault(); // Prevent default form submission

//     this.authService.login(this.email, this.password, this.role)
//       .subscribe({
//         next: (result: any) => {

//           if (result.jwt && result.role === 'Admin') {
//             localStorage.setItem('jwt', result.jwt);
//             localStorage.setItem('role', result.role);
//             this.router.navigate(['dashboard']);
//             this.toastr.success(result.message, 'Success');
//           }
//           else if (result.jwt && result.role === 'User') {
//             localStorage.setItem('jwt', result.jwt);
//             localStorage.setItem('role', result.role);
//             this.router.navigate(['dashboard']);
//             this.toastr.success(result.message, 'Success');
//           }
//           else {
//             this.toastr.error(result.message || 'Invalid credentials. Please check your credentials.', 'Error');
//           }
//         },
//         error: (err: any) => {
//           console.error('Error:', err);
//           this.toastr.error(err.error.message || 'Server error. Please try again later.', 'Error');
//         }
//       });
//   }

// login(event: Event) {
//   event.preventDefault(); // Prevent default form submission

//   this.authService.login(this.email, this.password, this.role)
//     .subscribe({
//       next: (result: any) => {
//         console.log("login works", result);

//         if (result.jwt) {
//           localStorage.setItem('jwt', result.jwt);
//           localStorage.setItem('role', result.role);

//           // Navigate based on the role
//           if (result.role === 'Admin') {
//             this.router.navigate(['admin/dashboard']);
//           } else if (result.role === 'user') {
//             this.router.navigate(['user/dashboard']);
//           } else {
//             this.router.navigate(['dashboard']); // Default route if roles are not defined
//           }

//           this.toastr.success('Login successful!', 'Success');
//         } else {
//           this.toastr.error('Login failed. Please check your credentials.', 'Error');
//         }
//       },
//       error: (err: any) => {
//         console.error('Error:', err);
//         this.toastr.error('Invalid credentials. Please check your credentials.', 'Error');
//       }
//     });
// }

// }

import { Component, OnInit } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/shared/service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ForgotPasswordModalComponent } from './forgot-password-modal/forgot-password-modal.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  role: string = 'User';   // Add role here
  hide = true;
  isFlipped = false;

  togglePasswordVisibility() {
    this.hide = !this.hide;
  }

  constructor(private authService: AuthService, private toastr: ToastrService, private router: Router, private dialog: MatDialog) { }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        const isLoginPage = event.url === '/login'; // Adjust the URL for your login page
        if (isLoginPage) {
          // Disable browser forward option
          history.pushState({}, '', location.href);
        }
      }
    });
  }

  toggleLoginMode() {
    this.isFlipped = !this.isFlipped;
    // Reset role when toggling
    this.role = this.isFlipped ? 'Admin' : 'User';
    // Reset form
    this.email = '';
    this.password = '';
  }

  openForgotPasswordModal(event: Event) {
    event.preventDefault();
    this.dialog.open(ForgotPasswordModalComponent, {
      width: '600px',
      height: '400px'
    });
  }

  adminLogin(event: Event) {
    event.preventDefault(); // Prevent default form submission

    this.authService.adminLogin(this.email, this.password)
      .subscribe({
        next: (result: any) => {
          if (result.message === result.message) {
            localStorage.setItem('refresh', result.refresh);
            localStorage.setItem('access', result.access);
            localStorage.setItem('role', 'Admin');
            this.router.navigate(['dashboard']);
            this.toastr.success(result.message, 'Success');
          }
          else {
            this.toastr.error(result.message || 'Invalid credentials. Please check your credentials.', 'Error');
          }
        },
        error: (err: any) => {
          console.error('Error:', err);
          this.toastr.error(err.error.message || 'Server error. Please try again later.', 'Error');
        }
      });
  }

  userLogin(event: Event) {
    event.preventDefault(); // Prevent default form submission

    this.authService.userLogin(this.email, this.password)
      .subscribe({
        next: (result: any) => {
          if (result.message === result.message) {
            localStorage.setItem('refresh', result.refresh);
            localStorage.setItem('access', result.access);
            localStorage.setItem('role', 'User');
            this.router.navigate(['dashboard']);
            this.toastr.success(result.message, 'Success');
          }
          else {
            this.toastr.error(result.message || 'Invalid credentials. Please check your credentials.', 'Error');
          }
        },
        error: (err: any) => {
          console.error('Error:', err);
          this.toastr.error(err.error.message || 'Server error. Please try again later.', 'Error');
        }
      });
  }

  // login(event: Event) {
  //   event.preventDefault(); // Prevent default form submission

  //   this.authService.login(this.email, this.password, this.role)
  //     .subscribe({
  //       next: (result: any) => {
  //         console.log("login works", result);

  //         if (result.jwt) {
  //           localStorage.setItem('jwt', result.jwt);
  //           localStorage.setItem('role', result.role);

  //           // Navigate based on the role
  //           if (result.role === 'Admin') {
  //             this.router.navigate(['admin/dashboard']);
  //           } else if (result.role === 'user') {
  //             this.router.navigate(['user/dashboard']);
  //           } else {
  //             this.router.navigate(['dashboard']); // Default route if roles are not defined
  //           }

  //           this.toastr.success('Login successful!', 'Success');
  //         } else {
  //           this.toastr.error('Login failed. Please check your credentials.', 'Error');
  //         }
  //       },
  //       error: (err: any) => {
  //         console.error('Error:', err);
  //         this.toastr.error('Invalid credentials. Please check your credentials.', 'Error');
  //       }
  //     });
  // }

}
