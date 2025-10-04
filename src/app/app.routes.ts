import { Routes } from "@angular/router";
import { ScreeningComponent } from "./pages/screening/screening.component";
import { Screening2Component } from "./pages/screening2/screening2.component";
import { SectorsIndustriesComponent } from "./pages/sectors-industries/sectors-industries.component";
import { BusinessDescriptionComponent } from "./pages/business-description/business-description.component";
import { LocationsComponent } from "./pages/locations/locations.component";
import { BusinessCyclesBackingStatusComponent } from "./pages/business-cycles-backing-status/business-cycles-backing-status.component";
import { DealsInvestorsComponent } from "./pages/deals-investors/deals-investors.component";
import { FinancialMetricsComponent } from "./pages/financial-metrics/financial-metrics.component";
import { CompanyDashboardComponent } from "./pages/company-dashboard/company-dashboard.component";
import { BalanceSheetComponent } from "./pages/balance-sheet/balance-sheet.component";
import { IncomeStatementComponent } from "./pages/income-statement/income-statement.component";
import { CashFlowsComponent } from "./pages/cash-flows/cash-flows.component";
import { BusinessInfoComponent } from "./pages/business-info/business-info.component";
import { StockPriceAndDateComponent } from "./pages/stock-price-and-date/stock-price-and-date.component";
import { AbbvSP500ReturnsComponent } from "./pages/abbv-sp-500-returns/abbv-sp-500-returns.component";
import { PayloadTestComponent } from "./components/payload-test/payload-test.component";
import { PerformanceAnalysisComponent } from "./pages/performance-analysis/performance-analysis.component";
import { CompanyProfileComponent } from "./pages/company-profile/company-profile.component";
import { InvestorsScreeningComponent } from "./pages/investors-screening/investors-screening.component";


export const routes: Routes = [
  {
    path:'',
    redirectTo:'company-screening',
    pathMatch:'full'
  },
  {
    path: "company-screening",
    component: ScreeningComponent,
  },
  {
    path: "investor-screening",
    component: InvestorsScreeningComponent,
  },
  {
    path: "sectors-industries",
    component: SectorsIndustriesComponent,
  },
  {
    path: "business-description",
    component: BusinessDescriptionComponent,
  },
  {
    path: "locations",
    component: LocationsComponent,
  },
  {
    path: "businesscycles",
    component: BusinessCyclesBackingStatusComponent,
  },
  {
    path: "deals-investors",
    component: DealsInvestorsComponent,
  },
  {
    path: "financial-metrics/:ticker/:id",
    component: FinancialMetricsComponent,
  },
  {
    path: "company-dashboard",
    component: CompanyDashboardComponent,
  },
  {
    path: "balance-sheet",
    component: BalanceSheetComponent,
  },
  {
    path: "performance-analysis",
    component: PerformanceAnalysisComponent,
  },
  {
    path: "income-statement",
    component: IncomeStatementComponent,
  },
  {
    path: "cash-flows",
    component: CashFlowsComponent,
  },
  {
    path: "business-info",
    component: BusinessInfoComponent,
  },
  {
    path: "price-and-date",
    component: StockPriceAndDateComponent,
  },
  {
    path: "abbv-sp-500-returns",
    component: AbbvSP500ReturnsComponent,
  },
  {
    path: "payload-test",
    component: PayloadTestComponent,
  },
  {
    path: "company-profile",
    component: CompanyProfileComponent,
  },
];
