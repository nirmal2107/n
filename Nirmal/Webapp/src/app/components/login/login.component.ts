import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field'; // Import MatFormFieldModule
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule, // Add MatFormFieldModule here
    CommonModule,
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  formbuilder = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);

  isSubmitted = false;
  activationMessage: string | null = null;

  constructor(private route: ActivatedRoute) {}

  loginForm: FormGroup<{
    email: FormControl<string | null>;
    password: FormControl<string | null>;
  }> = this.formbuilder.group({
    email: this.formbuilder.control('', [Validators.required, Validators.email]),
    password: this.formbuilder.control('', [Validators.required]),
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      if (params['activated']) {
        this.activationMessage = 'Your account has been successfully activated. Please log in.';
      }
    });
  }

  login() {
    this.isSubmitted = true;

    if (this.loginForm.invalid) {
      this.markFormControlsAsTouched();
      return;
    }

    this.authService
      .login(this.loginForm.value.email!, this.loginForm.value.password!)
      .subscribe((result: any) => {
        console.log(result);
        localStorage.setItem('token', result.token);
        localStorage.setItem('user', JSON.stringify(result.user));
        this.router.navigateByUrl('/home');
      });
  }

  private markFormControlsAsTouched(): void {
    Object.keys(this.loginForm.controls).forEach((key) => {
      const control = this.loginForm.get(
        key as keyof typeof this.loginForm.controls
      );
      control?.markAsTouched();
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
