// import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
// import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
// import { MatButtonModule } from '@angular/material/button';
// import { MatInputModule } from '@angular/material/input';
// import { AuthService } from '../../services/auth.service';
// import { Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-register',
//   standalone: true,
//   imports: [MatInputModule, ReactiveFormsModule, MatButtonModule, CommonModule, FormsModule],
//   templateUrl: './register.component.html',
//   styleUrls: ['./register.component.scss'],
//   changeDetection: ChangeDetectionStrategy.OnPush,
// })
// export class RegisterComponent {
//   formbuilder = inject(FormBuilder);
//   authService = inject(AuthService);
//   router = inject(Router);

//   isSubmitted = false;
//   successMessage = '';
  
//   registerForm: FormGroup<{
//     name: FormControl<string | null>;
//     email: FormControl<string | null>;
//     password: FormControl<string | null>;
//   }> = this.formbuilder.group({
//     name: this.formbuilder.control('', [Validators.required]),
//     email: this.formbuilder.control('', [Validators.required, Validators.email]),
//     password: this.formbuilder.control('', [Validators.required, Validators.minLength(5)]),
//   });

//   register() {
//     this.isSubmitted = true;

//     if (this.registerForm.invalid) {
//       this.markFormControlsAsTouched();
//       return;
//     }

//     const user = this.registerForm.value;
//     this.authService.register(user.name!, user.email!, user.password!).subscribe({
//       next: (response) => {
//         // Show success message and provide instructions for email verification
//         this.successMessage = 'Registration successful! Please check your email for the activation link.';
        
//         // Delay the redirect to login page so user can see the success message
//         setTimeout(() => {
//           this.router.navigate(['/login']);
//         }, 3000); // 3-second delay before redirect
//       },
//       error: (error) => {
//         if (error.status === 400) {
//           alert(error.error.message || 'An error occurred. Please try again.');
//         } else {
//           alert('Server error. Please try again later.');
//         }
//       },
//     });
//   }

//   private markFormControlsAsTouched(): void {
//     Object.keys(this.registerForm.controls).forEach((key) => {
//       const control = this.registerForm.get(key as keyof typeof this.registerForm.controls);
//       control?.markAsTouched();
//     });
//   }

//   get name() {
//     return this.registerForm.get('name');
//   }

//   get email() {
//     return this.registerForm.get('email');
//   }

//   get password() {
//     return this.registerForm.get('password');
//   }
// }


import { Component, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormControl } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [MatInputModule, ReactiveFormsModule, MatButtonModule, CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  formbuilder = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  changeDetectorRef = inject(ChangeDetectorRef);

  isSubmitted = false;
  successMessage = '';
  errorMessage = '';

  registerForm: FormGroup<{
    name: FormControl<string | null>;
    email: FormControl<string | null>;
    password: FormControl<string | null>;
  }> = this.formbuilder.group({
    name: this.formbuilder.control('', [Validators.required]),
    email: this.formbuilder.control('', [Validators.required, Validators.email]),
    password: this.formbuilder.control('', [Validators.required, Validators.minLength(5)]),
  });

  register() {
    this.isSubmitted = true;

    if (this.registerForm.invalid) {
      this.markFormControlsAsTouched();
      return;
    }

    const user = this.registerForm.value;
    this.authService.register(user.name!, user.email!, user.password!).subscribe({
      next: (response) => {
        // Show success message and provide instructions for email verification
        console.log('Backend response:', response);
        this.successMessage = 'Registration successful! Please check your email for the activation link.';
        this.errorMessage = ''; // Clear any previous error messages

        // Force Angular to detect changes for success message
        this.changeDetectorRef.detectChanges();

        // Delay reset of form and redirect for 3 seconds
        setTimeout(() => {
          this.registerForm.reset(); // Reset form fields
          this.router.navigate(['/login']); // Navigate to login page
        }, 3000); // 3-second delay before reset and redirect
      },
      error: (error) => {
        this.successMessage = ''; // Clear any previous success messages
        console.error('Registration error:', error);
        if (error.status === 400) {
          this.errorMessage = error.error.message || 'User already exists. Please try with a different email.';
        } else {
          this.errorMessage = 'Server error. Please try again later.';
        }
      },
    });
  }

  private markFormControlsAsTouched(): void {
    Object.keys(this.registerForm.controls).forEach((key) => {
      const control = this.registerForm.get(key as keyof typeof this.registerForm.controls);
      control?.markAsTouched();
    });
  }

  get name() {
    return this.registerForm.get('name');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }
}