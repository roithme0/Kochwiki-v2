import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { PageHeaderComponent } from './core/components/page-header/page-header.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, PageHeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {}
