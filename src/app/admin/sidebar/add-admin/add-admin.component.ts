import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ServiceService } from 'src/app/shared/service.service';

@Component({
  selector: 'app-add-admin',
  templateUrl: './add-admin.component.html',
  styleUrls: ['./add-admin.component.scss']
})
export class AddAdminComponent implements OnInit {
  adminForm!: FormGroup;

  constructor(
    private service: ServiceService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    this.adminForm = this.fb.group({
      empId: this.fb.control(''),
      name: this.fb.control(''),
      email: this.fb.control(''),
      password: this.fb.control(''),
    });
  }

  addAdmin() {
    const adminData = {
      emp_id: this.adminForm.value.empId,
      name: this.adminForm.value.name,
      email: this.adminForm.value.email,
      password: this.adminForm.value.password,
    };

    const { emp_id, name, email, password } = adminData;

    // Validation for empty fields
    if (!emp_id || !name || !email || !password) {
      this.toastr.error('Please fill all the fields.', 'Error');
      return;
    }

    // Alphanumeric validation
    const alphanumericRegex = /^[a-zA-Z0-9 ]+$/;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Validate empId first
    if (!alphanumericRegex.test(emp_id)) {
      this.toastr.error('Please enter a valid Employee ID. Eg. EMP 101', 'Error');
      return;
    }

    // Validate name next
    if (!alphanumericRegex.test(name)) {
      this.toastr.error('Please enter a valid Name. Eg. John or John123', 'Error');
      return;
    }

    // Validate email
    if (!emailRegex.test(email)) {
      this.toastr.error('Please enter a valid email address. Eg. john@gmail.com', 'Error');
      return;
    }

    // Call service to add user with token
    const token = localStorage.getItem('access'); // Retrieve token
    if (!token) {
      this.toastr.error('Authentication token is missing. Please log in again.', 'Error');
      return;
    }

    this.service.addAdmin(adminData, token).subscribe({
      next: (res: any) => {
        if (res.message) {
          this.toastr.success(res.message, 'Success');
          this.adminForm.reset();
        } else {
          this.toastr.error(res.message, 'Error');
        }
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.toastr.error(err.error.message || 'Server error. Please try again later.', 'Error');
      }
    });
  }
}

