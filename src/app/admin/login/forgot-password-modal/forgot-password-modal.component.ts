import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from 'src/app/shared/service.service';

@Component({
  selector: 'app-forgot-password-modal',
  templateUrl: './forgot-password-modal.component.html',
  styleUrls: ['./forgot-password-modal.component.scss']
})
export class ForgotPasswordModalComponent implements OnInit {
  email: string = '';
  otp: string = '';
  old_password: string = '';
  new_password: string = '';
  confirm_password: string = '';
  otpRequested = false;
  otpValidated = false;
  hidePassword = true;
  minutes: number = 5;
  seconds: number = 0;
  private timer: any;

  constructor(
    private dialogRef: MatDialogRef<ForgotPasswordModalComponent>,
    private toastr: ToastrService,
    private service: ServiceService, // Inject the AuthService
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void { }

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
      old_password: this.old_password,
      new_password: this.new_password,
      confirm_password: this.confirm_password,
    };
  
    this.service.forgotPasswordByUser(data).subscribe({
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
      },
    });
  }  


  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  onClose() {
    this.clearTimer();
    this.dialogRef.close();
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
}
