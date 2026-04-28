import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { DasSidebarComponent } from "../../shared/das-sidebar-component/das-sidebar-component";

@Component({
  selector: 'app-dashboard-component',
  imports: [RouterModule, DasSidebarComponent],
  templateUrl: './dashboard-component.html',
  styleUrl: './dashboard-component.css',
})
export class DashboardComponent {

}
