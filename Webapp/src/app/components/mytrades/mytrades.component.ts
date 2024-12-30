import { Component,OnInit } from '@angular/core';
import { AllTradesService } from '../../services/alltrades.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../services/auth.service';
import { Traded } from '../../types/traded';

@Component({
  selector: 'app-mytrades',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './mytrades.component.html',
  styleUrl: './mytrades.component.scss'
})


export class MytradesComponent implements OnInit {
  tradesProposedByUser: any[] = [];
  tradesProposedToUser: any[] = [];
  page = 1;
  pageSize = 10;
  totalPages: number = 1;

  constructor(private tradeService: AllTradesService ,private authservice: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadTrades();
  }

  loadTrades(): void {
    this.tradeService.getTrades(this.page, this.pageSize).subscribe((response) => {
      this.tradesProposedByUser = response.tradesProposedByUser;
      this.tradesProposedToUser = response.tradesProposedToUser;
      this.totalPages = response.totalPages;
    });
  }

  // Pagination logic
  onPageChange(page: number): void {
    this.page = page;
    this.loadTrades();
  }
  logout(){
    this.authservice.logOut();
    this.router.navigate([`/login/`]);

  }


  // Respond to a trade (accept/reject)
  respondToTrade(tradeId: string, status: 'accepted' | 'rejected'): void {
    this.tradeService.updateTradeStatus(tradeId, status).subscribe(
      (response) => {
        alert(`Trade ${status} successfully.`);
        this.loadTrades(); // Refresh trades after the action
      },
      (error) => {
        console.error(`Error updating trade status:`, error);
        alert(`Failed to ${status} trade. Please try again.`);
      }
    );
  }
}
