import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'app-products',
  imports: [CommonModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {
  products = [
    {
      name: 'HDPE Pressure Pipes',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7w_LlTojO9kc88tjTTUuOV7mQNbCXtH9M2j_HxdVpRWov4E6_ZWFM_45O2moEjPyfTvHRzaEV6OhcpKDV0xNshXDA0hS9a_Uy25Jabv2ebHBkS7AArn2bcTXbTGFbb7jD-gwdxKARe-AJGkORmhAn7iFWzYMovENbTiikSeFapCNqPi6iyB73uluSpBIOvbbilTkVNbSMyesIe7dJy8WznAj0VzjDdEq2DFVtcSZ8-ZOtVIQJ364',
      status: 'In Stock',
      specs: [
        { label: 'Material', value: 'PE-100' },
        { label: 'Pressure Rating', value: 'PN 6 to PN 20' }
      ]
    },
    {
      name: 'Impact Sprinklers',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA11UhXoglZRvMd9yZJQfK8SxiHoW359hQ6-pLO7GG92bl0JmORPkTX2n6TWuv9MmSFGCJdLy9j_bxUFZg3qdtfR7EAJClykliXIcwGXPmY5J13UbsVcA9ah4-8H4NfCFwTgNrNseqaV6u4vAYrsJvJLVG9GQf3sxXGDkYZX6Fjf4M0Kd9lMWaWyk4hbo1z3yxwRWp8FUXSAKhzgL_dPDaD4bRaVbuV3c4Ur2vzFyBkqCeiA8rbd48',
      status: 'In Stock',
      specs: [
        { label: 'Trajectory', value: '24°' },
        { label: 'Flow Rate', value: '15-40 LPM' }
      ]
    },
    {
      name: 'Inline Drip Laterals',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmfiBn52-ncOR7iFk_SgEPJtXYuS7n9yk8cyjNxeHzTO-jSuee8CdWDtXHkgP4mgydIYZphzJjM3xnEXnrHTE6ag8NjMJWvBgztaUVff-l2SgEzXbLUMWYnlsjIxvh5yYRbAvptS-hqV3oMdjdAvSLs6QOQFss2DRy0bD6SzpuRv7k3AQj3HElwqLHSh7zFi6P8L07Et61ebZKww002gw5hXJaas8CUUHddnwNoaWIaWxhUVBSwh4',
      status: 'On Order',
      specs: [
        { label: 'Wall Thickness', value: '0.8 - 1.2mm' },
        { label: 'Discharge', value: '2.0 LPH' }
      ]
    }
  ];
}