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
  isAdmin: boolean = false;

  constructor(private tradeService: AllTradesService ,private authservice: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.loadTrades();
    this.isAdmin = this.authservice.isAdmin; 
  }

  loadTrades(): void {
    this.tradeService.getTrades(this.page, this.pageSize).subscribe((response) => {
      this.tradesProposedByUser = response.tradesProposedByUser;
      this.tradesProposedToUser = response.tradesProposedToUser;
      this.totalPages = response.totalPages;
    });
    console.log(this.tradesProposedByUser),
     // Log the items to check if 'isBlocked' is included
     console.log('Trades proposed to user:', this.tradesProposedToUser);
     // Make sure the response includes 'isBlocked'
    this.tradesProposedToUser.forEach(trade => {
      console.log('item1 isBlocked:', trade.item1?.isBlocked);
      console.log('item2 isBlocked:', trade.item2?.isBlocked);
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
