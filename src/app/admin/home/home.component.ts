import { Component, AfterViewInit, ViewChild, OnInit } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { AuthService } from 'src/app/shared/service/auth.service';
import { ServiceService } from 'src/app/shared/service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements AfterViewInit, OnInit {

  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  userInfo: any = null;
  
  constructor(private observer: BreakpointObserver, private toastr: ToastrService, private authService: AuthService) { }

  ngOnInit(): void {
    this.userInfo = this.authService.getUserInfo();
    this.getUserInformation()
  }

  ngAfterViewInit(): void {
    this.observer.observe(['(max-width:800px)']).subscribe((res) => {
      if (res.matches) {
        this.sidenav.mode = 'over';
        this.sidenav.close();
      } else {
        this.sidenav.mode = 'side';
        this.sidenav.open();
      }
    })
  }

  getUserInformation(): void {
    this.authService.getUserInfo().subscribe({
      next: (user: any) => {

        this.userInfo = user;
      },
      error: (err: any) => {
        this.toastr.error(err.error.message || 'Server error. Please try again later.', 'Error');
      }
    });
  }
}
