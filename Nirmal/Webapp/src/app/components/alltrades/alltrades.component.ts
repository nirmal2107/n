import { Component, OnInit } from '@angular/core';
import { AllTradesService } from '../../services/alltrades.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { AuthService } from '../../services/auth.service';
import { Traded } from '../../types/traded';

@Component({
  selector: 'app-alltrades',
  standalone: true,
  imports: [FormsModule, MatPaginatorModule, CommonModule, MatTableModule],
  templateUrl: './alltrades.component.html',
  styleUrls: ['./alltrades.component.scss'],
})
export class AlltradesComponent implements OnInit {
  trades: any[] = [];
  totalCount: number = 0;
  totalPages: number = 1;
  currentPage: number = 1;
  pageSize: number = 10;

  // Filters
  searchTerm: string = '';
  exactMatch: boolean = false;
  postedAfter: string = '';

  constructor(private tradeService: AllTradesService) {}

  ngOnInit(): void {
    this.loadTrades();
  }

  loadTrades(): void {
    this.tradeService
      .getAllTrades(this.searchTerm, this.exactMatch, this.postedAfter, this.currentPage, this.pageSize)
      .subscribe(
        (response) => {
          this.trades = response.allnewtrades; // Assign the trades array
          this.totalCount = response.totalCount; // Total count of trades
          this.totalPages = response.totalPages; // Total pages for pagination
        },
        (error) => {
          console.error('Error loading trades:', error);
        }
      );
  }

  onSearchChange(): void {
    this.currentPage = 1; // Reset to first page on search change
    this.loadTrades();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadTrades();
  }

  onExactMatchToggle(): void {
    this.currentPage = 1;
    this.loadTrades();
  }

  onPostedAfterChange(): void {
    this.currentPage = 1;
    this.loadTrades();
  }
}
