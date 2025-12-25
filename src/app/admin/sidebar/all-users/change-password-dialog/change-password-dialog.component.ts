import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from 'src/app/shared/service.service';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss']
})
export class ChangePasswordDialogComponent {
  email: string = '';
  otp: string = '';
  new_password: string = '';
  confirm_password: string = '';
  otpRequested = false;
  otpValidated = false;
  hidePassword = true;
  minutes: number = 5;
  seconds: number = 0;
  private timer: any;

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  constructor(private toastr: ToastrService,
    private service: ServiceService,
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }



  onSubmit() {
    if (this.otpValidated) {
      this.changePasswordByUser();
    } else if (this.otpRequested) {
      this.validateOtp();
    } else {
      this.requestOtp();
    }
  }


  requestOtp() {
    const data = { email: this.email };

    this.service.sendMail(data).subscribe({
      next: (response: any) => {
        if (response.message) {
          this.toastr.success(response.message, 'Success');
          this.otpRequested = true;
          this.startTimer();
        } else {
          this.toastr.error(response.message || 'Failed to send OTP.', 'Error');
        }
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.toastr.error(err.error.message || 'Server error. Please try again later.', 'Error');
      }
    });
  }

  validateOtp() {
    const data = {
      email: this.email,
      otp: this.otp
    };

    this.service.verifyOTP(data).subscribe({
      next: (response: any) => {
        if (response.message) {
          this.toastr.success(response.message, 'Success');
          this.otpValidated = true;
          this.clearTimer();
        } else {
          this.toastr.error(response.message || 'OTP verification failed.', 'Error');
        }
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.toastr.error(err.error.message || 'Server error. Please try again later.', 'Error');
      }
    });
  }

  changePasswordByUser() {
    const data = {
      email: this.email,
      new_password: this.new_password,
      confirm_password: this.confirm_password
    };

    const token = localStorage.getItem('access'); // Adjust this based on your app's token storage mechanism

    if (!token) {
      this.toastr.error('Authorization token is missing. Please log in again.', 'Error');
      return;
    }

    this.service.changePasswordByAdmin(data, token).subscribe({
      next: (response: any) => {
        if (response.message) {
          this.toastr.success(response.message, 'Success');
          this.dialogRef.close();
        } else {
          this.toastr.error(response.message || 'Password change failed.', 'Error');
        }
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.toastr.error(err.error.message || 'Server error. Please try again later.', 'Error');
      }
    });
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.seconds === 0) {
        if (this.minutes > 0) {
          this.minutes--;
          this.seconds = 59;
        } else {
          this.clearTimer();
          this.toastr.error('OTP expired. Please request a new one.', 'Error');
          this.dialogRef.close();
        }
      } else {
        this.seconds--;
      }
    }, 1000);
  }

  clearTimer() {
    clearInterval(this.timer);
    this.minutes = 0;
    this.seconds = 0;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.new_password) {
      this.dialogRef.close({ newPassword: this.new_password });
    }
  }
}
