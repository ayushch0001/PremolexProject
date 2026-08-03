import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogPost } from '../../admin/models/blog.model';

@Component({
  selector: 'app-blog-card',
  standalone: true,
  imports: [DatePipe, RouterLink],
  templateUrl: './blog-card.component.html',
  styleUrls: ['./blog-card.component.css'],
})
export class BlogCardComponent {
  /** The blog post to display in this card. */
  readonly post = input.required<BlogPost>();
}