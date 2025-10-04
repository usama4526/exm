import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute } from "@angular/router";
import { ApiService, InvestmentFirmProfile } from "../../services/api.service";
import { SidebarComponent } from "../../components/sidebar/sidebar.component";
import { NgApexchartsModule } from "ng-apexcharts";

export type ChartOptions = {
  series: any;
  chart: any;
  xaxis: any;
  yaxis: any;
  title: any;
  labels: string[];
  stroke: any;
  dataLabels: any;
  fill: any;
  tooltip: any;
  colors: string[];
  legend: any;
};

@Component({
  standalone: true,
  selector: "app-company-profile",
  imports: [
    CommonModule,
    SidebarComponent,
    NgApexchartsModule,
  ],
  templateUrl: "./company-profile.component.html",
  styleUrl: "./company-profile.component.scss",
})
export class CompanyProfileComponent implements OnInit {
  public chartOptions!: Partial<ChartOptions>;
  investmentFirm?: InvestmentFirmProfile;
  loading: boolean = false;
  hasResponse: boolean = false;
  errorMessage: string = "";

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.fetchInvestmentFirmProfile(id);
    } else {
        this.errorMessage = "Missing company id in route";
      }
    });
  }

  private buildChart(aum: InvestmentFirmProfile["aumData"]): void {
    const parseMillion = (value?: string | null): number => {
      if (!value || value === "N/A") return 0;
      const n = parseFloat(value.replace(/,/g, ""));
      return isNaN(n) ? 0 : n;
    };
    const parsePercent = (value?: string | null): number => {
      if (!value || value === "N/A") return 0;
      const n = parseFloat(value.replace(/%/g, ""));
      return isNaN(n) ? 0 : n;
    };

    const aum2022 = parseMillion(aum.year2022?.assetsUnderManagementMillion);
    const aum2023 = parseMillion(aum.year2023?.assetsUnderManagementMillion);
    const aum2024 = parseMillion(aum.year2024?.assetsUnderManagementMillion);
    const gr2022 = parsePercent(aum.year2022?.growthRate);
    const gr2023 = parsePercent(aum.year2023?.growthRate);
    const gr2024 = parsePercent(aum.year2024?.growthRate);

    this.chartOptions = {
      series: [
        { name: "AUM ($M)", type: "column" as any, data: [aum2022, aum2023, aum2024] },
        { name: "Growth Rate (%)", type: "line" as any, data: [gr2022, gr2023, gr2024] },
      ],
      chart: { height: 350, type: "line" as any, background: "transparent", toolbar: { show: false } },
      stroke: { width: [0, 4], curve: "smooth" },
      fill: {
        opacity: [0.85, 1],
        gradient: { inverseColors: false, shade: "light", type: "vertical", opacityFrom: 0.85, opacityTo: 0.55, stops: [0, 100, 100, 100] }
      },
      title: { text: "", align: "left" },
      dataLabels: { enabled: true, enabledOnSeries: [1], style: { fontSize: "12px", colors: ["#000"] } },
      labels: ["2022", "2023", "2024"],
      xaxis: { type: "category" as any, categories: ["2022", "2023", "2024"], labels: { style: { colors: "#b3b3b3", fontSize: "12px" } } },
      yaxis: [
        {
          title: { text: "AUM ($M)", style: { color: "#57b5e7", fontSize: "12px" } },
          labels: { style: { colors: "#b3b3b3", fontSize: "11px" }, formatter: (value: number) => value.toFixed(0) + "M" },
          min: 0
        },
        {
          opposite: true,
          title: { text: "Growth Rate (%)", style: { color: "#ff6b35", fontSize: "12px" } },
          labels: { style: { colors: "#b3b3b3", fontSize: "11px" }, formatter: (value: number) => value.toFixed(1) + "%" },
        }
      ],
      tooltip: { shared: true, intersect: false, theme: 'dark', style: { fontSize: '12px' }, y: { formatter: (y: any) => (typeof y !== "undefined" ? Number(y).toFixed(2) : y) } },
      colors: ["#57b5e7", "#ff6b35"],
      legend: { position: "bottom", horizontalAlign: "left", labels: { colors: "#b3b3b3" }, markers: { fillColors: ["#57b5e7", "#ff6b35"] } }
    };
  }

  private fetchInvestmentFirmProfile(id: string): void {
    this.loading = true;
    this.apiService.getInvestmentFirmProfile(id).subscribe({
      next: (data) => {
        this.investmentFirm = data;
        console.log(this.investmentFirm);
        
        this.hasResponse = true;
        if (data?.aumData) {
          this.buildChart(data.aumData);
        }
      },
      error: () => {
        this.errorMessage = "Failed to load company profile";
        this.hasResponse = false;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }
}