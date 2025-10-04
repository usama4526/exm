import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { ApiService } from './services/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  _http = inject(HttpClient)
  _api = inject(ApiService)
  title = 'exm';
  private baseUrl = "http://13.59.44.96:8083/api"

  ngOnInit(): void {
    this.getCount()
  }

 getCount(){
  this._api.getProgressiveCounts([
    {
      "section": "company",
      "field": "primaryIndustry",
      "operator": "in",
      "value": [
        "Health Care Equipment and Supplies",
        "Health Care Providers and Services",
        "Health Care Technology",
        "Biotechnology",
        "Pharmaceuticals",
        "Life Sciences Tools and Services"
      ]
    }
  ]).subscribe((res)=>{
    console.log(res)
  })
 }
}
