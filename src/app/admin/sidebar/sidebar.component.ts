import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  Admin: boolean = localStorage.getItem('role') === 'Admin';
  User: boolean = localStorage.getItem('role') === 'User';

  constructor(private router: Router) { }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }
}
