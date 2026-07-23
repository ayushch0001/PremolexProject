import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Category {
  name: string;
  count: number;
  checked: boolean;
}

interface Product {
  id: number;
  name: string;
  category: string;
  pressureRating: string;
  standard: string;
  description: string;
  diameterRange: string;
  secondarySpecLabel: string;
  secondarySpecValue: string;
  stockStatus: string;
  inStock: boolean;
  imageUrl: string;
}

@Component({
  selector: 'app-product-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-catalog.html',
})
export class ProductCatalogComponent {
  // State Signals
  viewMode = signal<'grid' | 'list'>('grid');
  searchQuery = signal<string>('');

  pressureRating = signal<string>('All Ratings');
  standardCompliance = signal<string>('Any Standard');

  categories = signal<Category[]>([
    { name: 'HDPE Pipes', count: 42, checked: true },
    { name: 'PVC Pipes', count: 38, checked: true },
    { name: 'UPVC Systems', count: 24, checked: false },
    { name: 'CPVC Solutions', count: 15, checked: false },
    { name: 'SWR Drainage', count: 29, checked: false },
    { name: 'Agriculture Pipes', count: 56, checked: false },
    { name: 'Irrigation Systems', count: 31, checked: false },
    { name: 'Casing Pipes', count: 18, checked: false }
  ]);

  // Mock Data Signal
  products = signal<Product[]>([
    {
      id: 1,
      name: 'HDPE High-Pressure Mainline',
      category: 'HDPE Pipes',
      pressureRating: 'PN 16',
      standard: 'ISO 4427',
      description: 'PE100 graded piping designed for municipal water supply and heavy industrial fluid transport. High impact resistance.',
      diameterRange: '20mm - 315mm',
      secondarySpecLabel: 'Standard Length',
      secondarySpecValue: '6m / 12m Coils',
      stockStatus: 'In Stock',
      inStock: true,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBh7JrUq6veCn-E3zCCu7Aw20FDASa3rPQNgttkVA7zxxQe_VqMY7TazpbySM7YB-_ngn8eL2s-Fox2eMyAsSv1qeenv6ghSt81arq603gJVv64Me2GaymXXfizZ_DrAfxT6wIOdwYBzwrJH5CZn-gDMVBN0JBv1LgtxF0m3WE6PQ33MS_0cUVhOY7EEncG8GbcSdjKBju0R6GmPVt2erks4rIK3xOkZyW7nyw2rQnEbRfr33liCoM'
    },
    {
      id: 2,
      name: 'Rigid PVC Conduit',
      category: 'PVC Pipes',
      pressureRating: 'Class 3',
      standard: 'IS 4984',
      description: 'Heavy-duty unplasticized PVC piping for agricultural irrigation and underground cable protection.',
      diameterRange: '63mm - 400mm',
      secondarySpecLabel: 'Joint Type',
      secondarySpecValue: 'Solvent Cement',
      stockStatus: 'In Stock',
      inStock: true,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE15ez8IBum3nUrL_x__yoPf-OINLOadlFJGSS5-HVGG6gHNwnavlKu5c-LVMGqouou0MMlCvLoBhnTxTfII6KSrRJBbj7hs-7XJHGCqPhIZhX4L5WC8cow-qK4W8l4xwFRKZfVQ7lPzNY2C7uRm13he0VM3bWtDYPUF-m8hlGdrHE5ctOCVa5vbAMMUE2zfQPhNKD_dxxzrmZ1vKjyRdXI86XlHTwSXiozwaKSpntTyQq8i351wQ'
    },
    {
      id: 3,
      name: 'CPVC Hot/Cold Distribution',
      category: 'CPVC Solutions',
      pressureRating: 'SDR 11',
      standard: 'DIN 8074',
      description: 'Chlorinated PVC engineered for high-temperature commercial plumbing and corrosive fluid handling.',
      diameterRange: '15mm - 50mm',
      secondarySpecLabel: 'Max Temp',
      secondarySpecValue: '93°C (200°F)',
      stockStatus: 'Lead Time: 2 Wks',
      inStock: false,
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAeQbubVDea2ff33G42rJwd62uyp0EHsiQdtKXT3-sAPhZ-EWuB7Uk3T_BkOeHoZzVBtseuOXAqxNB1fb2gq4m5cc7G4yexsypi8yFCweoTWk7Orq_bX21EjC3-vnFZayPm0wz1uVPVCSHmAkChzvyDP0inbsMswxPZPm7dxS6krR_aQkV--gOH9hpeKKUMsUj6uRxeyCwm2z4XLmAi1sQpz-b7oTuoAI083qIXfn8o_XHYPg1XIh8'
    }
  ]);

  // Computed Signal for Filtering Logic
  filteredProducts = computed(() => {
    const search = this.searchQuery().toLowerCase();
    const activeCategories = this.categories().filter(c => c.checked).map(c => c.name);
    const selectedPressure = this.pressureRating();
    const selectedStandard = this.standardCompliance();

    return this.products().filter(product => {
      // 1. Search Filter
      const matchesSearch = product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search);

      // 2. Category Filter (If none selected, show none or show all based on preference. Here, requires match)
      const matchesCategory = activeCategories.length === 0 || activeCategories.includes(product.category);

      // 3. Specification Filters
      const matchesPressure = selectedPressure === 'All Ratings' || product.pressureRating === selectedPressure;
      const matchesStandard = selectedStandard === 'Any Standard' || product.standard === selectedStandard;

      return matchesSearch && matchesCategory && matchesPressure && matchesStandard;
    });
  });

  // Action Methods
  toggleCategory(index: number): void {
    this.categories.update(cats => {
      const updated = [...cats];
      updated[index].checked = !updated[index].checked;
      return updated;
    });
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }
}