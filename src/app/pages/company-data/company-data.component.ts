import { Component, inject } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { ApiService } from "../../services/api.service";

@Component({
  selector: "app-company-data",
  imports: [],
  templateUrl: "./company-data.component.html",
  styleUrl: "./company-data.component.scss",
})
export class CompanyDataComponent {
  activeRoute = inject(ActivatedRoute);
  _apiService = inject(ApiService);
  companyData: any;
  companyId: string = "";
  constructor() {
    this.companyId = this.activeRoute.snapshot.params["id"];
    console.log(this.companyId);
    this.getCompanyById(this.companyId);
  }
  getCompanyById(id: string) {
    // get company by id
    this._apiService.getCompanyById(id).subscribe({
      next: (res) => {
        console.log(res);
        this.companyData = res.data;
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
}
