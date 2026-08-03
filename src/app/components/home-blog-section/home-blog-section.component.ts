import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BlogPost } from '../../admin/models/blog.model';
import { BlogService } from '../../admin/services/blog.service';
import { BlogCardComponent } from '../blog-card/blog-card.component';

@Component({
  selector: 'app-home-blog-section',
  standalone: true,
  imports: [RouterLink, BlogCardComponent],
  templateUrl: './home-blog-section.component.html',
  styleUrls: ['./home-blog-section.component.css'],
})
export class HomeBlogSectionComponent implements OnInit {
  private readonly blogService = inject(BlogService);

  private readonly allPosts = signal<BlogPost[]>([]);

  /** The 3 most recently published blog posts. */
  readonly recentPosts = computed<BlogPost[]>(() =>
    this.allPosts()
      .filter((p) => p.status === 'published')
      .sort((a, b) => {
        const aTime = new Date(a.publishedAt ?? a.createdAt).getTime();
        const bTime = new Date(b.publishedAt ?? b.createdAt).getTime();
        return bTime - aTime;
      })
      .slice(0, 3),
  );

  ngOnInit(): void {
    this.allPosts.set(this.blogService.getPosts());
  }
}