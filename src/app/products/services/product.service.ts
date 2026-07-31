import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Product, ProductCategory } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly categories: ProductCategory[] = [
    {
      id: 'hdpe',
      name: 'HDPE Pipes',
      description: 'High-density polyethylene systems for pressure and gravity applications.',
    },
    {
      id: 'pvc',
      name: 'PVC Pipes',
      description: 'Rigid unplasticized polyvinyl chloride piping for water and drainage.',
    },
    {
      id: 'upvc',
      name: 'UPVC Systems',
      description: 'Unplasticized PVC profiles and fittings for aggressive environments.',
    },
    {
      id: 'cpvc',
      name: 'CPVC Solutions',
      description: 'Chlorinated PVC for high-temperature industrial and domestic plumbing.',
    },
    {
      id: 'swr',
      name: 'SWR Drainage',
      description: 'Soil, waste and rainwater drainage systems for buildings.',
    },
    {
      id: 'agriculture',
      name: 'Agriculture Pipes',
      description: 'Irrigation and farm water supply piping engineered for field durability.',
    },
    {
      id: 'casing',
      name: 'Casing Pipes',
      description: 'Heavy-wall casing pipes for borewell and protective applications.',
    },
  ];

  private readonly products: Product[] = [
    {
      id: 1,
      name: 'HDPE High-Pressure Mainline',
      subtitle: 'PE100 grade pressure pipe for municipal and industrial water transport.',
      categoryId: 'hdpe',
      category: 'HDPE Pipes',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBh7JrUq6veCn-E3zCCu7Aw20FDASa3rPQNgttkVA7zxxQe_VqMY7TazpbySM7YB-_ngn8eL2s-Fox2eMyAsSv1qeenv6ghSt81arq603gJVv64Me2GaymXXfizZ_DrAfxT6wIOdwYBzwrJH5CZn-gDMVBN0JBv1LgtxF0m3WE6PQ33MS_0cUVhOY7EEncG8GbcSdjKBju0R6GmPVt2erks4rIK3xOkZyW7nyw2rQnEbRfr33liCoM',
      specifications: [
        { label: 'Pressure Rating', value: 'PN 16' },
        { label: 'Standard', value: 'ISO 4427' },
        { label: 'Diameter Range', value: '20mm - 315mm' },
        { label: 'Standard Length', value: '6m / 12m Coils' },
      ],
    },
    {
      id: 2,
      name: 'HDPE Double-Wall Corrugated',
      subtitle: 'Lightweight corrugated drainage pipe for storm water and culvert systems.',
      categoryId: 'hdpe',
      category: 'HDPE Pipes',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBh7JrUq6veCn-E3zCCu7Aw20FDASa3rPQNgttkVA7zxxQe_VqMY7TazpbySM7YB-_ngn8eL2s-Fox2eMyAsSv1qeenv6ghSt81arq603gJVv64Me2GaymXXfizZ_DrAfxT6wIOdwYBzwrJH5CZn-gDMVBN0JBv1LgtxF0m3WE6PQ33MS_0cUVhOY7EEncG8GbcSdjKBju0R6GmPVt2erks4rIK3xOkZyW7nyw2rQnEbRfr33liCoM',
      specifications: [
        { label: 'Ring Stiffness', value: 'SN 8' },
        { label: 'Standard', value: 'IS 16098' },
        { label: 'Diameter Range', value: '160mm - 1000mm' },
        { label: 'Joint Type', value: 'Integral Bell' },
      ],
    },
    {
      id: 3,
      name: 'HDPE Dredging & Slurry Line',
      subtitle: 'Abrasion-resistant PE100 pipe for mining slurry and dredging operations.',
      categoryId: 'hdpe',
      category: 'HDPE Pipes',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBh7JrUq6veCn-E3zCCu7Aw20FDASa3rPQNgttkVA7zxxQe_VqMY7TazpbySM7YB-_ngn8eL2s-Fox2eMyAsSv1qeenv6ghSt81arq603gJVv64Me2GaymXXfizZ_DrAfxT6wIOdwYBzwrJH5CZn-gDMVBN0JBv1LgtxF0m3WE6PQ33MS_0cUVhOY7EEncG8GbcSdjKBju0R6GmPVt2erks4rIK3xOkZyW7nyw2rQnEbRfr33liCoM',
      specifications: [
        { label: 'Material Grade', value: 'PE 100 RC' },
        { label: 'Standard', value: 'DIN 8074' },
        { label: 'Diameter Range', value: '90mm - 630mm' },
        { label: 'Working Temp', value: '-40°C to 60°C' },
      ],
    },
    {
      id: 4,
      name: 'Rigid PVC Pressure Pipe',
      subtitle: 'Heavy-duty uPVC pressure piping for irrigation and underground water mains.',
      categoryId: 'pvc',
      category: 'PVC Pipes',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAE15ez8IBum3nUrL_x__yoPf-OINLOadlFJGSS5-HVGG6gHNwnavlKu5c-LVMGqouou0MMlCvLoBhnTxTfII6KSrRJBbj7hs-7XJHGCqPhIZhX4L5WC8cow-qK4W8l4xwFRKZfVQ7lPzNY2C7uRm13he0VM3bWtDYPUF-m8hlGdrHE5ctOCVa5vbAMMUE2zfQPhNKD_dxxzrmZ1vKjyRdXI86XlHTwSXiozwaKSpntTyQq8i351wQ',
      specifications: [
        { label: 'Class', value: 'Class 3' },
        { label: 'Standard', value: 'IS 4984' },
        { label: 'Diameter Range', value: '63mm - 400mm' },
        { label: 'Joint Type', value: 'Solvent Cement' },
      ],
    },
    {
      id: 5,
      name: 'PVC Agriculture Column',
      subtitle: 'Lightweight suction and delivery column pipe for agricultural pump sets.',
      categoryId: 'pvc',
      category: 'PVC Pipes',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAE15ez8IBum3nUrL_x__yoPf-OINLOadlFJGSS5-HVGG6gHNwnavlKu5c-LVMGqouou0MMlCvLoBhnTxTfII6KSrRJBbj7hs-7XJHGCqPhIZhX4L5WC8cow-qK4W8l4xwFRKZfVQ7lPzNY2C7uRm13he0VM3bWtDYPUF-m8hlGdrHE5ctOCVa5vbAMMUE2zfQPhNKD_dxxzrmZ1vKjyRdXI86XlHTwSXiozwaKSpntTyQq8i351wQ',
      specifications: [
        { label: 'Class', value: 'Class 2' },
        { label: 'Standard', value: 'IS 4985' },
        { label: 'Diameter Range', value: '50mm - 200mm' },
        { label: 'Length', value: '3m Sections' },
      ],
    },
    {
      id: 6,
      name: 'PVC Electrical Conduit',
      subtitle: 'Flame-retardant conduit piping for cable protection in buildings and plants.',
      categoryId: 'pvc',
      category: 'PVC Pipes',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAE15ez8IBum3nUrL_x__yoPf-OINLOadlFJGSS5-HVGG6gHNwnavlKu5c-LVMGqouou0MMlCvLoBhnTxTfII6KSrRJBbj7hs-7XJHGCqPhIZhX4L5WC8cow-qK4W8l4xwFRKZfVQ7lPzNY2C7uRm13he0VM3bWtDYPUF-m8hlGdrHE5ctOCVa5vbAMMUE2zfQPhNKD_dxxzrmZ1vKjyRdXI86XlHTwSXiozwaKSpntTyQq8i351wQ',
      specifications: [
        { label: 'Grade', value: 'FR / LF' },
        { label: 'Standard', value: 'IS 9537' },
        { label: 'Diameter Range', value: '16mm - 50mm' },
        { label: 'Colour', value: 'Grey' },
      ],
    },
    {
      id: 7,
      name: 'UPVC Pressure System',
      subtitle: 'Unplasticized PVC piping with high chemical resistance for water distribution.',
      categoryId: 'upvc',
      category: 'UPVC Systems',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAeQbubVDea2ff33G42rJwd62uyp0EHsiQdtKXT3-sAPhZ-EWuB7Uk3T_BkOeHoZzVBtseuOXAqxNB1fb2gq4m5cc7G4yexsypi8yFCweoTWk7Orq_bX21EjC3-vnFZayPm0wz1uVPVCSHmAkChzvyDP0inbsMswxPZPm7dxS6krR_aQkV--gOH9hpeKKUMsUj6uRxeyCwm2z4XLmAi1sQpz-b7oTuoAI083qIXfn8o_XHYPg1XIh8',
      specifications: [
        { label: 'Class', value: 'Class 4' },
        { label: 'Standard', value: 'EN 1401' },
        { label: 'Diameter Range', value: '20mm - 250mm' },
        { label: 'Connection', value: 'Solvent Weld' },
      ],
    },
    {
      id: 8,
      name: 'UPVC Industrial Ventilation Duct',
      subtitle: 'Corrosion-resistant ducting for fume extraction and chemical ventilation.',
      categoryId: 'upvc',
      category: 'UPVC Systems',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAeQbubVDea2ff33G42rJwd62uyp0EHsiQdtKXT3-sAPhZ-EWuB7Uk3T_BkOeHoZzVBtseuOXAqxNB1fb2gq4m5cc7G4yexsypi8yFCweoTWk7Orq_bX21EjC3-vnFZayPm0wz1uVPVCSHmAkChzvyDP0inbsMswxPZPm7dxS6krR_aQkV--gOH9hpeKKUMsUj6uRxeyCwm2z4XLmAi1sQpz-b7oTuoAI083qIXfn8o_XHYPg1XIh8',
      specifications: [
        { label: 'Material', value: 'uPVC' },
        { label: 'Standard', value: 'DIN 8061' },
        { label: 'Diameter Range', value: '75mm - 315mm' },
        { label: 'Temp Range', value: '0°C to 60°C' },
      ],
    },
    {
      id: 9,
      name: 'CPVC Hot/Cold Distribution',
      subtitle: 'Chlorinated PVC engineered for high-temperature commercial plumbing systems.',
      categoryId: 'cpvc',
      category: 'CPVC Solutions',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAeQbubVDea2ff33G42rJwd62uyp0EHsiQdtKXT3-sAPhZ-EWuB7Uk3T_BkOeHoZzVBtseuOXAqxNB1fb2gq4m5cc7G4yexsypi8yFCweoTWk7Orq_bX21EjC3-vnFZayPm0wz1uVPVCSHmAkChzvyDP0inbsMswxPZPm7dxS6krR_aQkV--gOH9hpeKKUMsUj6uRxeyCwm2z4XLmAi1sQpz-b7oTuoAI083qIXfn8o_XHYPg1XIh8',
      specifications: [
        { label: 'SDR', value: 'SDR 11' },
        { label: 'Standard', value: 'DIN 8078' },
        { label: 'Diameter Range', value: '15mm - 50mm' },
        { label: 'Max Temp', value: '93°C (200°F)' },
      ],
    },
    {
      id: 10,
      name: 'CPVC Industrial Chemical Line',
      subtitle: 'High-purity CPVC for aggressive chemical transfer in processing plants.',
      categoryId: 'cpvc',
      category: 'CPVC Solutions',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAeQbubVDea2ff33G42rJwd62uyp0EHsiQdtKXT3-sAPhZ-EWuB7Uk3T_BkOeHoZzVBtseuOXAqxNB1fb2gq4m5cc7G4yexsypi8yFCweoTWk7Orq_bX21EjC3-vnFZayPm0wz1uVPVCSHmAkChzvyDP0inbsMswxPZPm7dxS6krR_aQkV--gOH9hpeKKUMsUj6uRxeyCwm2z4XLmAi1sQpz-b7oTuoAI083qIXfn8o_XHYPg1XIh8',
      specifications: [
        { label: 'Sch', value: 'Schedule 80' },
        { label: 'Standard', value: 'ASTM F441' },
        { label: 'Diameter Range', value: '15mm - 100mm' },
        { label: 'Chemical Resist', value: 'Excellent' },
      ],
    },
    {
      id: 11,
      name: 'SWR Drainage System',
      subtitle: 'Complete soil, waste and rainwater drainage range for multi-storey buildings.',
      categoryId: 'swr',
      category: 'SWR Drainage',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBh7JrUq6veCn-E3zCCu7Aw20FDASa3rPQNgttkVA7zxxQe_VqMY7TazpbySM7YB-_ngn8eL2s-Fox2eMyAsSv1qeenv6ghSt81arq603gJVv64Me2GaymXXfizZ_DrAfxT6wIOdwYBzwrJH5CZn-gDMVBN0JBv1LgtxF0m3WE6PQ33MS_0cUVhOY7EEncG8GbcSdjKBju0R6GmPVt2erks4rIK3xOkZyW7nyw2rQnEbRfr33liCoM',
      specifications: [
        { label: 'Standard', value: 'IS 13592' },
        { label: 'Diameter Range', value: '75mm - 315mm' },
        { label: 'Colour', value: 'Grey / Orange' },
        { label: 'Joint Type', value: 'Solvent / Ring' },
      ],
    },
    {
      id: 12,
      name: 'SWR Rainwater Downpipe',
      subtitle: 'High-capacity rainwater conductor for rooftops and terrace drainage.',
      categoryId: 'swr',
      category: 'SWR Drainage',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBh7JrUq6veCn-E3zCCu7Aw20FDASa3rPQNgttkVA7zxxQe_VqMY7TazpbySM7YB-_ngn8eL2s-Fox2eMyAsSv1qeenv6ghSt81arq603gJVv64Me2GaymXXfizZ_DrAfxT6wIOdwYBzwrJH5CZn-gDMVBN0JBv1LgtxF0m3WE6PQ33MS_0cUVhOY7EEncG8GbcSdjKBju0R6GmPVt2erks4rIK3xOkZyW7nyw2rQnEbRfr33liCoM',
      specifications: [
        { label: 'Standard', value: 'IS 13592' },
        { label: 'Diameter Range', value: '110mm - 160mm' },
        { label: 'Colour', value: 'Grey' },
        { label: 'UV Resistant', value: 'Yes' },
      ],
    },
    {
      id: 13,
      name: 'Agriculture HDPE Layflat',
      subtitle: 'Collapsible HDPE layflat hose for efficient field and crop irrigation.',
      categoryId: 'agriculture',
      category: 'Agriculture Pipes',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBh7JrUq6veCn-E3zCCu7Aw20FDASa3rPQNgttkVA7zxxQe_VqMY7TazpbySM7YB-_ngn8eL2s-Fox2eMyAsSv1qeenv6ghSt81arq603gJVv64Me2GaymXXfizZ_DrAfxT6wIOdwYBzwrJH5CZn-gDMVBN0JBv1LgtxF0m3WE6PQ33MS_0cUVhOY7EEncG8GbcSdjKBju0R6GmPVt2erks4rIK3xOkZyW7nyw2rQnEbRfr33liCoM',
      specifications: [
        { label: 'Pressure', value: '2 - 6 bar' },
        { label: 'Width', value: '50mm - 300mm' },
        { label: 'Colour', value: 'Black / Blue' },
        { label: 'Packaging', value: 'Coil' },
      ],
    },
    {
      id: 14,
      name: 'Sprinkler Irrigation Mainline',
      subtitle: 'UV-stabilized PVC mainline for sprinkler and micro-irrigation networks.',
      categoryId: 'agriculture',
      category: 'Agriculture Pipes',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAE15ez8IBum3nUrL_x__yoPf-OINLOadlFJGSS5-HVGG6gHNwnavlKu5c-LVMGqouou0MMlCvLoBhnTxTfII6KSrRJBbj7hs-7XJHGCqPhIZhX4L5WC8cow-qK4W8l4xwFRKZfVQ7lPzNY2C7uRm13he0VM3bWtDYPUF-m8hlGdrHE5ctOCVa5vbAMMUE2zfQPhNKD_dxxzrmZ1vKjyRdXI86XlHTwSXiozwaKSpntTyQq8i351wQ',
      specifications: [
        { label: 'Class', value: 'Class 1' },
        { label: 'Standard', value: 'IS 4985' },
        { label: 'Diameter Range', value: '63mm - 200mm' },
        { label: 'UV Protected', value: 'Yes' },
      ],
    },
    {
      id: 15,
      name: 'Borewell Casing Pipe',
      subtitle: 'Heavy-wall casing for borewell construction and submersible pump housing.',
      categoryId: 'casing',
      category: 'Casing Pipes',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAE15ez8IBum3nUrL_x__yoPf-OINLOadlFJGSS5-HVGG6gHNwnavlKu5c-LVMGqouou0MMlCvLoBhnTxTfII6KSrRJBbj7hs-7XJHGCqPhIZhX4L5WC8cow-qK4W8l4xwFRKZfVQ7lPzNY2C7uRm13he0VM3bWtDYPUF-m8hlGdrHE5ctOCVa5vbAMMUE2zfQPhNKD_dxxzrmZ1vKjyRdXI86XlHTwSXiozwaKSpntTyQq8i351wQ',
      specifications: [
        { label: 'Class', value: 'Class 4' },
        { label: 'Standard', value: 'IS 12818' },
        { label: 'Diameter Range', value: '100mm - 400mm' },
        { label: 'Wall Thickness', value: '3.2mm - 9.8mm' },
      ],
    },
    {
      id: 16,
      name: 'Casing Pipe with Slotting',
      subtitle: 'Pre-slotted casing pipe for water entry sections in borewells and wells.',
      categoryId: 'casing',
      category: 'Casing Pipes',
      imageUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAE15ez8IBum3nUrL_x__yoPf-OINLOadlFJGSS5-HVGG6gHNwnavlKu5c-LVMGqouou0MMlCvLoBhnTxTfII6KSrRJBbj7hs-7XJHGCqPhIZhX4L5WC8cow-qK4W8l4xwFRKZfVQ7lPzNY2C7uRm13he0VM3bWtDYPUF-m8hlGdrHE5ctOCVa5vbAMMUE2zfQPhNKD_dxxzrmZ1vKjyRdXI86XlHTwSXiozwaKSpntTyQq8i351wQ',
      specifications: [
        { label: 'Slot Pattern', value: 'Staggered' },
        { label: 'Standard', value: 'IS 12818' },
        { label: 'Diameter Range', value: '100mm - 300mm' },
        { label: 'Open Area', value: '8% - 12%' },
      ],
    },
  ];

  getCategories(): Observable<ProductCategory[]> {
    return of(this.categories);
  }

  getProducts(): Observable<Product[]> {
    return of(this.products);
  }

  getProductsByCategory(categoryId: string | null): Observable<Product[]> {
    if (!categoryId || categoryId === 'all') {
      return of(this.products);
    }
    const filtered = this.products.filter((p) => p.categoryId === categoryId);
    return of(filtered);
  }
}