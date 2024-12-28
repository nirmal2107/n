import { Component,OnInit } from '@angular/core';
import { TradecardComponent } from '../tradecard/tradecard.component';
import { AllTradesService} from '../../services/alltrades.service';
import { Trade } from '../../types/trade';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RecomendedComponent } from '../recomended/recomended.component';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,RecomendedComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent  {
    constructor(private authservice: AuthService, private router: Router) {}
  
  logout(){
    this.authservice.logOut();
    this.router.navigate([`/login/`]);

  }
  
}
