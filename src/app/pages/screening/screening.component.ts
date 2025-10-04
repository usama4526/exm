import { Component, ElementRef, inject, ViewChild, HostListener } from "@angular/core";
import { Router, RouterLink } from "@angular/router";
import { CriteriaComponent } from "../../components/criteria/criteria.component";
import { SectorsIndustriesComponent } from "../sectors-industries/sectors-industries.component";
import { BusinessDescriptionComponent } from "../business-description/business-description.component";
import { SelectionPayload } from "../../components/nested-checkboxes/nested-checkboxes.component";
import { BusinessCyclesBackingStatusComponent } from "../business-cycles-backing-status/business-cycles-backing-status.component";
import { FinancialMetricsComponent } from "../financial-metrics/financial-metrics.component";
import { LocationsComponent } from "../locations/locations.component";
import { ExchangeCriteriaComponent } from "../exchange-criteria/exchange-criteria.component";
import { HttpClient } from "@angular/common/http";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ApiService } from "../../services/api.service";
import { PayloadTransformationService } from "../../services/payload-transformation.service";
import { FilterStep } from "../../models/filter-interfaces";
import { FormatNumberPipe } from "../../shared/pipes/number-format.pipe";
export interface CheckboxNode {
  name: string;
  checked?: boolean;
  indeterminate?: boolean;
  children?: CheckboxNode[];
  expanded?: boolean;
  type?: string;
  keyValue?: string;
}

interface Parameter {
  type: string;
  label: string;
  values: string[];
}

interface CategoryItem {
  id: string;
  name: string;
  level: number;
  parentFilter?: string;
  children: CategoryItem[];
  parameters?: string[];
  yearType?: string[];
  fiscalYear?: string[];
  fiscalQuarter?: string[];
  expanded?: boolean;
  key?: string;
}

interface SelectedCriteria {
  id: string;
  name: string;
  parameters: { [key: string]: any };
}
@Component({
  selector: "app-screening",
  imports: [
    CriteriaComponent,
    SectorsIndustriesComponent,
    BusinessDescriptionComponent,
    BusinessCyclesBackingStatusComponent,
    FinancialMetricsComponent,
    LocationsComponent,
    ExchangeCriteriaComponent,
    CommonModule,
    FormatNumberPipe,
    FormsModule,
  ],
  templateUrl: "./screening.component.html",
  standalone: true,
  styleUrl: "./screening.component.scss",
})
export class ScreeningComponent {
  http = inject(HttpClient);
  apiService = inject(ApiService);
  transformationService = inject(PayloadTransformationService);
  
  // Search debounce timer
  private searchDebounceTimer: any;
  
  @ViewChild(CriteriaComponent) criteriaComponent!: CriteriaComponent;
  
  // Company search properties
  companyProfiles: any[] = [];
  filteredCompanies: any[] = [];
  searchQuery: string = '';
  showCompanyDropdown: boolean = false;
  selectedCompany: any = null;
  isLoadingCompanies: boolean = false;
  
  isCriteriaFilterSelected: boolean = false;
  selectedCompanyType!: any;
  selectedCompanyStatus!: any;
  selectedCriteriaFilter:
    | undefined
    | "sector-and-industries"
    | "business-description"
    | "locations"
    | "exchanges"
    | "company-type-and-company-status"
    | "deals-and-investors"
    | "financial-metrics"
    | "intellectual-property";
  sectorSelection: {
    GICS_SECTOR?: string[];
    GICS_GROUP?: string[];
    GICS_PRIMARY_INDUSTRY?: string[];
  } = {};
  locationSelection: any = [];
  minimalSectorSelection!: string[];
  minimalLocationSelection!: string[];
  // Exchanges
  selectedExchanges: string[] = [];
  clearExchangeSelection: boolean = false;
  categoryData: CategoryItem[] = [];
  selectedCriteria: CategoryItem | null = null;
  selectedParameters: { [key: string]: any } = {};

  sectorData: CheckboxNode[] = [
    {
      name: "Health Care",
      checked: false,
      expanded: true,
      type: "GICS_SECTOR",
      children: [
        {
          name: "Health Care Equipment and Services",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            {
              name: "Health Care Equipment and Supplies",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
            {
              name: "Health Care Providers and Services",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
            {
              name: "Health Care Technology",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
          ],
        },
        {
          name: "Pharmaceuticals, Biotechnology and Life Sciences",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            {
              name: "Biotechnology",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
            {
              name: "Pharmaceuticals",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
            {
              name: "Life Sciences Tools and Services",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
          ],
        },
      ],
    },

    {
      name: "Consumer Discretionary",
      checked: false,
      expanded: true,
      type: "GICS_SECTOR",
      children: [
        {
          name: "Automobiles and Components",
          checked: false,
          type: "GICS_GROUP",
          expanded: true,
          children: [
            {
              name: "Automobile Components",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
            {
              name: "Automobiles",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
          ],
        },
        {
          name: "Consumer Durables and Apparel",
          checked: false,
          type: "GICS_GROUP",
          expanded: true,
          children: [
            {
              name: "Household Durables",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
            {
              name: "Leisure Products",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
            {
              name: "Textiles, Apparel and Luxury Goods",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
          ],
        },
        {
          name: "Consumer Services",
          checked: false,
          type: "GICS_GROUP",
          expanded: true,
          children: [
            {
              name: "Hotels, Restaurants and Leisure",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
            {
              name: "Diversified Consumer Services",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
          ],
        },
        {
          name: "Consumer Discretionary Distribution and Retail",
          checked: false,
          type: "GICS_GROUP",
          expanded: true,
          children: [
            {
              name: "Broadline Retail",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
            {
              name: "Specialty Retail",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
          ],
        },
      ],
    },
    {
      name: "Consumer Staples",
      checked: false,
      expanded: true,
      type: "GICS_SECTOR",
      children: [
        {
          name: "Consumer Staples Distribution and Retail",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            {
              name: "Consumer Staples Distribution and Retail",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
          ],
        },
        {
          name: "Food, Beverage and Tobacco",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            {
              name: "Beverages",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Food Products",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            { name: "Tobacco", type: "GICS_PRIMARY_INDUSTRY", checked: false },
          ],
        },
        {
          name: "Household and Personal Products",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            {
              name: "Household Products",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Personal Care Products",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
          ],
        },
      ],
    },
    {
      name: "Information Technology",
      checked: false,
      expanded: true,
      type: "GICS_SECTOR",
      children: [
        {
          name: "Software and Services",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            {
              name: "IT Services",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            { name: "Software", type: "GICS_PRIMARY_INDUSTRY", checked: false },
          ],
        },
        {
          name: "Technology Hardware and Equipment",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            { name: "Communications Equipment", checked: false },
            {
              name: "Technology Hardware, Storage and Peripherals",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
            {
              name: "Electronic Equipment, Instruments and Components",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
          ],
        },
        {
          name: "Semiconductors and Semiconductor Equipment",
          type: "GICS_GROUP",
          checked: false,
        },
      ],
    },

    {
      name: "Industrials",
      checked: false,
      expanded: true,
      type: "GICS_SECTOR",
      children: [
        {
          name: "Capital Goods",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            {
              name: "Aerospace and Defense",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Building Products",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Construction and Engineering",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Electrical Equipment",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Industrial Conglomerates",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Machinery",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Trading Companies and Distributors",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
          ],
        },
        {
          name: "Commercial and Professional Services",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            {
              name: "Commercial Services and Supplies",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Professional Services",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
          ],
        },
        {
          name: "Transportation",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            {
              name: "Air Freight and Logistics",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Passenger Airlines",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Marine Transportation",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Ground Transportation",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Transportation Infrastructure",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
          ],
        },
      ],
    },
    {
      name: "Real Estate",
      checked: false,
      expanded: true,
      type: "GICS_SECTOR",
      children: [
        {
          name: "Equity Real Estate Investment Trusts (REITs)",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            {
              name: "Diversified REITs",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Health Care REITs",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Hotel and Resort REITs",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Industrial REITs",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Office REITs",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Residential REITs",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Retail REITs",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Specialized REITs",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
          ],
        },
        {
          name: "Real Estate Management and Development",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            {
              name: "Real Estate Management and Development",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
          ],
        },
      ],
    },
    {
      name: "Financials",
      checked: false,
      expanded: true,
      type: "GICS_SECTOR",
      children: [
        {
          name: "Banks",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            { name: "Banks", type: "GICS_PRIMARY_INDUSTRY", checked: false },
          ],
        },
        {
          name: "Financial Services",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            {
              name: "Consumer Finance",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Capital Markets",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Mortgage Real Estate Investment Trusts (REITs)",
              checked: false,
              type: "GICS_PRIMARY_INDUSTRY",
            },
          ],
        },
        {
          name: "Insurance",
          type: "GICS_GROUP",
          checked: false,
        },
      ],
    },

    {
      name: "Utilities",
      checked: false,
      expanded: true,
      type: "GICS_SECTOR",
      children: [
        { name: "Electric Utilities", type: "GICS_GROUP", checked: false },
        { name: "Gas Utilities", type: "GICS_GROUP", checked: false },
        { name: "Multi-Utilities", type: "GICS_GROUP", checked: false },
        { name: "Water Utilities", type: "GICS_GROUP", checked: false },
        {
          name: "Independent Power and Renewable Electricity Producers",
          checked: false,
          type: "GICS_GROUP",
        },
      ],
    },

    {
      name: "Energy",
      checked: false,
      expanded: true,
      type: "GICS_SECTOR",
      children: [
        {
          name: "Energy Equipment and Services",
          checked: false,
          type: "GICS_GROUP",
        },
        {
          name: "Oil, Gas and Consumable Fuels",
          type: "GICS_GROUP",
          checked: false,
        },
      ],
    },
    {
      name: "Materials",
      checked: false,
      expanded: true,
      type: "GICS_SECTOR",
      children: [
        {
          name: "Chemicals",
          checked: false,
          type: "GICS_GROUP",
        },
        {
          name: "Construction Materials",
          checked: false,
          type: "GICS_GROUP",
        },
        {
          name: "Containers and Packaging",
          checked: false,
          type: "GICS_GROUP",
        },
        {
          name: "Metals and Mining",
          checked: false,
          type: "GICS_GROUP",
        },
        {
          name: "Paper and Forest Products",
          checked: false,
          type: "GICS_GROUP",
        },
      ],
    },

    {
      name: "Communication Services",
      checked: false,
      expanded: true,
      type: "GICS_SECTOR",
      children: [
        {
          name: "Telecommunication Services",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            {
              name: "Diversified Telecommunication Services",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Wireless Telecommunication Services",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
          ],
        },
        {
          name: "Media and Entertainment",
          checked: false,
          expanded: true,
          type: "GICS_GROUP",
          children: [
            { name: "Media", type: "GICS_PRIMARY_INDUSTRY", checked: false },
            {
              name: "Entertainment",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
            {
              name: "Interactive Media and Services",
              type: "GICS_PRIMARY_INDUSTRY",
              checked: false,
            },
          ],
        },
      ],
    },
  ];
  selectedFinancialMetrics: any = {};

  //checkbox data clear
  clearSectorCheckboxSelection: boolean = false;
  clearLocationCheckboxSelection: boolean = false;
  clearCompanySelection: boolean = false;

  ngOnInit() {
    this.fetchCategoryData();
    this.loadCompanyProfiles();
  }

  // Load company profiles data from JSON
  loadCompanyProfiles() {
    this.isLoadingCompanies = true;
    this.http.get<any>('/json-data/company_profiles.json').subscribe({
      next: (data) => {
        if (data && data.company_profiles_full) {
          this.companyProfiles = data.company_profiles_full;
          console.log('✅ Company profiles loaded:', this.companyProfiles.length);
          console.log('✅ Sample companies:', this.companyProfiles.slice(0, 5).map(c => ({
            name: c.company_name,
            id: c.company_id
          })));
        } else {
          console.warn('⚠️ No company profiles found in data:', data);
        }
        this.isLoadingCompanies = false;
      },
      error: (err) => {
        console.error('❌ Error loading company profiles:', err);
        this.isLoadingCompanies = false;
      }
    });
  }

  // Handle company search input
  onCompanySearchInput(event: any) {
    const query = event.target.value;
    this.searchQuery = query;
    
    // Clear previous timer
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
    
    if (query.length >= 1) {
      // For single characters, search immediately
      if (query.length === 1) {
        this.filterCompanies(query);
        this.showCompanyDropdown = true;
      } else {
        // Debounce the search for longer queries to avoid too many calls
        this.searchDebounceTimer = setTimeout(() => {
          this.filterCompanies(query);
          this.showCompanyDropdown = true;
        }, 300); // 300ms delay
      }
    } else {
      this.filteredCompanies = [];
      this.showCompanyDropdown = false;
    }
  }

  // Handle search input focus
  onCompanySearchFocus() {
    if (this.searchQuery.length >= 1 && this.filteredCompanies.length > 0) {
      this.showCompanyDropdown = true;
    }
  }

  // Handle keyboard navigation
  onCompanySearchKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.showCompanyDropdown = false;
    } else if (event.key === 'Enter' && this.filteredCompanies.length > 0) {
      // Select the first company in the list
      this.onCompanySelect(this.filteredCompanies[0]);
    }
  }

  // Clear search and reset state
  clearCompanySearch() {
    this.searchQuery = '';
    this.filteredCompanies = [];
    this.showCompanyDropdown = false;
    this.selectedCompany = null;
  }

  // Filter companies based on search query
  filterCompanies(query: string) {
    const lowerQuery = query.toLowerCase().trim();
    
    if (!lowerQuery) {
      this.filteredCompanies = [];
      return;
    }
    
    console.log(`🔍 Searching for: "${query}" (${lowerQuery})`);
    console.log(`🔍 Total companies available: ${this.companyProfiles.length}`);
    
    // First, find companies that start with the query (highest priority)
    const startsWithMatches = this.companyProfiles.filter(company => 
      company.company_name?.toLowerCase().startsWith(lowerQuery) ||
      (company.company_id && company.company_id.toLowerCase().startsWith(lowerQuery))
    );
    
    // Then, find companies that contain the query anywhere (lower priority)
    const containsMatches = this.companyProfiles.filter(company => 
      !company.company_name?.toLowerCase().startsWith(lowerQuery) && 
      company.company_name?.toLowerCase().includes(lowerQuery) &&
      !(company.company_id && company.company_id.toLowerCase().startsWith(lowerQuery)) &&
      (company.company_id && company.company_id.toLowerCase().includes(lowerQuery))
    );
    
    // Also check for partial word matches (e.g., "Int" should match "International")
    const partialWordMatches = this.companyProfiles.filter(company => {
      if (startsWithMatches.includes(company) || containsMatches.includes(company)) {
        return false; // Already included
      }
      
      const words = company.company_name?.toLowerCase().split(/\s+/) || [];
      return words.some((word: string) => word.startsWith(lowerQuery));
    });
    
    // Combine results with priority: startsWith > contains > partialWord
    this.filteredCompanies = [
      ...startsWithMatches, 
      ...containsMatches, 
      ...partialWordMatches
    ].slice(0, 10);
    
    console.log(`🔍 Search results:`, {
      startsWith: startsWithMatches.length,
      contains: containsMatches.length,
      partialWord: partialWordMatches.length,
      total: this.filteredCompanies.length,
      results: this.filteredCompanies.map(c => c.company_name)
    });
  }

  // Handle company selection from dropdown
  onCompanySelect(company: any) {
    this.selectedCompany = company;
    this.searchQuery = company.company_name;
    this.showCompanyDropdown = false;
    
    // Navigate to business-description route
    this.navigateToBusinessDescription(company);
  }

  // Navigate to business description page
  navigateToBusinessDescription(company: any) {
    const companyId = company.company_id;
    // ticker is missing so commenting it out as requested
     const ticker = company.ticker || '';
    
    this.router.navigate(['/business-info'],{queryParams: {id: companyId, ticker: ticker}});
  }

  // Close dropdown when clicking outside
  onDocumentClick(event: any) {
    if (!event.target.closest('.company_search_container')) {
      this.showCompanyDropdown = false;
    }
  }

  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: Event) {
    this.onDocumentClick(event);
  }
  
  // Clean up timer when component is destroyed
  ngOnDestroy() {
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }
  }

  selectedOperator: string = "";
  selectedValue: number | null = null;
  selectedValueMin: number | null = null;
  selectedValueMax: number | null = null;
  selectedYearType: string = "";
  selectedPeriod: string = "";
  addedCriteria: any[] = [];
  // Operator mapping
  operatorMap: { [key: string]: string } = {
    "Equal (=)": "eq",
    "Does Not Equal (<>)": "ne",
    "Less Than (<)": "lt",
    "Greater Than (>)": "gt",
    "Greater Than or Equal (>=)": "gte",
    "Less Than or Equal (<=)": "lte",
    Between: "between",
    "Is NA": "isna",
    "Is Not NA": "isnotna",
  };

  fetchCategoryData() {
    this.http.get<any>("/json-data/category-fields-fh_bs_ic.json").subscribe({
      next: (data) => {
        this.categoryData = Array.isArray(data) ? data : [data];
      },
      error: (err) => {
        console.error("Error fetching category data:", err);
      },
    });
  }
  onScreeningSelection(payload: SelectionPayload) {
    this.sectorSelection = payload.grouped;
    this.minimalSectorSelection = payload.minimal;
  }
  onCompanyType(payload: { COMPANY_TYPE: string[] }) {
    console.log("COMPANY_TYPE obj:", payload);
    this.selectedCompanyType = payload;
  }

  onCompanyStatus(payload: { COMPANY_STATUS: string[] }) {
    console.log("COMPANY_STATUS obj:", payload);
    this.selectedCompanyStatus = payload;
  }
  onMetricsApplied(payload: any) {
    console.log("Received metrics payload from child:", payload);
    this.selectedFinancialMetrics = payload;
  }

  onClearSelection(type: string) {
    if (type === "Sectors and Industries") {
      this.sectorSelection = {};
      this.minimalSectorSelection = [];

      this.clearSectorCheckboxSelection = true;
    } else if (type === "Company Type") {
      this.selectedCompanyType = {};
      this.selectedCompanyStatus = {};
      this.clearCompanySelection = true;
    } else if (type === "Financial Metrics") {
      this.selectedFinancialMetrics = {};
    } else if (type === "Location") {
      (this.minimalLocationSelection = []), (this.locationSelection = []);

      this.clearLocationCheckboxSelection = true;
    } else if (type === "company - Exchange") {
      // Clear exchanges selection from UI and criteria
      this.selectedExchanges = [];
      this.clearExchangeSelection = true;
    }
  }

  onLocationSelectionChange(payload: any) {
    console.log(payload);
    this.minimalLocationSelection = payload.minimal;
    //this.locationSelection = payload.grouped.GICS_PRIMARY_INDUSTRY; //can be changed in future.
    this.locationSelection = payload;
    console.log(this.locationSelection);
  }
  constructor() {}

  showCriteriaSelector(type: string) {
    if (type == "Sectors and Industries") {
      this.selectedCriteriaFilter = "sector-and-industries";
    } else if (type == "Location") {
      this.selectedCriteriaFilter = "locations";
    } else if (type.toLowerCase().includes("exchange")) {
      this.selectedCriteriaFilter = "exchanges";
    }
  }

  onExchangeSelection(values: string[]) {
    this.selectedExchanges = values || [];
    this.clearExchangeSelection = false;
    // Always emit new criteria payload so CriteriaComponent can add/update/remove
    this.newCriteriaToAdd = {
      company: {
        exchange: {
          in: this.selectedExchanges,
        },
      },
    };
  }

  toggleExpand(item: CategoryItem): void {
    if (item.children && item.children.length > 0) {
      item.expanded = !item.expanded;
    }
  }

  selectCriteria(item: CategoryItem): void {
    // Only select items that have no children (leaf nodes)
    if (!item.children || item.children.length === 0) {
      //console.log("new item", item);

      this.selectedCriteria = item;
      this.resetSelections();
    }
  }

  resetSelections(): void {
    this.selectedOperator = "";
    this.selectedValue = null;
    this.selectedValueMin = null;
    this.selectedValueMax = null;
    this.selectedYearType = "";
    this.selectedPeriod = "";
  }

  isSelected(item: CategoryItem): boolean {
    //console.log(item);

    return this.selectedCriteria?.id === item.id;
  }

  getFilteredOperators(): string[] {
    if (!this.selectedCriteria?.parameters) return [];
    const excluded = new Set([
      "Plus (+)",
      "Minus (-)",
      "Times (*)",
      "Divided By (/)",
    ]);
    return this.selectedCriteria.parameters.filter(
      (op: string) => !excluded.has(op)
    );
  }

  onOperatorChange(operator: string): void {
    this.selectedOperator = operator;
    const isBetween = this.operatorMap[this.selectedOperator] === "between";
    if (isBetween) {
      this.selectedValue = null;
    } else {
      this.selectedValueMin = null;
      this.selectedValueMax = null;
    }
  }

  onValueChange(value: number): void {
    this.selectedValue = Number(value);
  }

  onMinValueChange(value: number): void {
    this.selectedValueMin = Number(value);
  }

  onMaxValueChange(value: number): void {
    this.selectedValueMax = Number(value);
  }

  onYearTypeChange(yearType: string): void {
    this.selectedYearType = yearType;
    this.selectedPeriod = ""; // Reset period when year type changes
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
  }

  getAvailablePeriods(): string[] {
    if (!this.selectedCriteria || !this.selectedYearType) {
      return [];
    }

    if (this.selectedYearType === "Fiscal Year") {
      return this.selectedCriteria.fiscalYear || [];
    } else if (this.selectedYearType === "Fiscal Quarter") {
      return this.selectedCriteria.fiscalQuarter || [];
    }

    return [];
  }

  newCriteriaToAdd: any;
  addCriteria(): void {
    const operatorKey = this.operatorMap[this.selectedOperator];
    const isBetween = operatorKey === "between";
    const hasRequiredValue = isBetween
      ? this.selectedValueMin !== null && this.selectedValueMax !== null
      : this.selectedValue !== null;

    if (
      this.selectedCriteria &&
      this.selectedOperator &&
      hasRequiredValue &&
      this.selectedPeriod
    ) {
      const parentFilter = this.getParentFilter(this.selectedCriteria);
      const camelCaseKey = this.selectedCriteria.key
        ? this.toCamelCase(this.selectedCriteria.key)
        : this.toCamelCase(this.selectedCriteria.name);
      console.log(parentFilter);
      console.log(this.selectedCriteria);

      const valueToSet = isBetween
        ? [Number(this.selectedValueMin), Number(this.selectedValueMax)]
        : Number(this.selectedValue);

      const criteriaObject = {
        year: this.selectedPeriod,
        originalName: this.selectedCriteria.name, // Store original display name
        [parentFilter]: {
          [camelCaseKey]: {
            [operatorKey]: valueToSet,
          },
        },
      };

      this.newCriteriaToAdd = criteriaObject;
      this.addedCriteria.push(criteriaObject);
      console.log("Added criteria:", criteriaObject);
      console.log("All criteria:", this.addedCriteria);

      // Reset selections
      this.selectedCriteria = null;
      this.resetSelections();
    } else {
      // DEBUG: Log why criteria wasn't added
      console.log("🔍 DEBUG: Criteria not added due to missing requirements:");
      console.log(
        "🔍 DEBUG: selectedCriteria missing?",
        !this.selectedCriteria
      );
      console.log(
        "🔍 DEBUG: selectedOperator missing?",
        !this.selectedOperator
      );
      console.log(
        "🔍 DEBUG: selectedValue missing?",
        isBetween
          ? this.selectedValueMin === null || this.selectedValueMax === null
          : this.selectedValue === null
      );
      console.log("🔍 DEBUG: selectedPeriod missing?", !this.selectedPeriod);
    }
  }

  getParentFilter(item: CategoryItem): string {
    // If the item has parentFilter, use it
    if (item.parentFilter) {
      return item.parentFilter;
    }

    // Otherwise, try to find it in the parent hierarchy
    return this.findParentFilter(this.categoryData, item.id) || "defaultFilter";
  }

  findParentFilter(
    items: CategoryItem[],
    targetId: string,
    currentParentFilter?: string
  ): string | null {
    for (const item of items) {
      if (item.id === targetId) {
        return currentParentFilter || item.parentFilter || null;
      }

      if (item.children && item.children.length > 0) {
        const found = this.findParentFilter(
          item.children,
          targetId,
          item.parentFilter || currentParentFilter
        );
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  removeCriteria(index: number): void {
    this.addedCriteria.splice(index, 1);
  }

  hasChildren(item: CategoryItem): boolean {
    return item.children && item.children.length > 0;
  }

  isLeafNode(item: CategoryItem): boolean {
    return !item.children || item.children.length === 0;
  }

  isValidToAdd(): boolean {
    const operatorKey = this.operatorMap[this.selectedOperator];
    const isBetween = operatorKey === "between";
    const hasRequiredValue = isBetween
      ? this.selectedValueMin !== null && this.selectedValueMax !== null
      : this.selectedValue !== null;
    return !!(
      this.selectedCriteria &&
      this.selectedOperator &&
      hasRequiredValue &&
      this.selectedPeriod
    );
  }

  toCamelCase(str: string): string {
    // Handle snake_case (underscores)
    if (str.includes('_')) {
      return str
        .split('_')
        .map((word, index) => {
          if (index === 0) {
            return word.toLowerCase();
          }
          return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join('');
    }
    
    // Handle space-separated words
    return str
      .replace(/[^a-zA-Z0-9\s]/g, "") // Remove special characters
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim()
      .split(" ")
      .map((word, index) => {
        if (index === 0) {
          return word.toLowerCase();
        }
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      })
      .join("");
  }

  isValidForParameterSelection(): boolean {
    const operatorKey = this.operatorMap[this.selectedOperator];
    const isBetween = operatorKey === "between";
    return !!(
      this.selectedCriteria &&
      this.selectedOperator &&
      (isBetween
        ? this.selectedValueMin !== null && this.selectedValueMax !== null
        : this.selectedValue !== null)
    );
  }
  clearSelections(): void {
    this.selectedCriteria = null;
    this.resetSelections();
  }

  // Method to clear all added criteria
  clearAllCriteria(): void {
    this.addedCriteria = [];
  }

  // Method to export selected criteria as JSON
  exportCriteria(): string {
    return JSON.stringify(this.addedCriteria, null, 2);
  }

  // Method to reset expansion state
  collapseAll(items: CategoryItem[]): void {
    items.forEach((item) => {
      item.expanded = false;
      if (item.children && item.children.length > 0) {
        this.collapseAll(item.children);
      }
    });
  }

  // Method to expand all items
  expandAll(items: CategoryItem[]): void {
    items.forEach((item) => {
      if (item.children && item.children.length > 0) {
        item.expanded = true;
        this.expandAll(item.children);
      }
    });
  }
  companiesClusterData: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  pageSizeOptions: number[] = [10, 20, 30];
  // Dynamic columns
  selectedTableCriteria: string[] = [];
  criteriaPayloadData: { [key: string]: any } = {};
  newCriteriaPayloadData: { [key: string]: any } = {};
  hideCriteriaSections: boolean = false;
  currentFilterSteps: any[] = [];
  // Mapping of field -> { section, years }
  private fieldSectionYearMap: { [field: string]: { section: string; years?: number[] } } = {};

  onRunScreenGetCompaniesClusterData($event: any) {
    this.companiesClusterData = $event.content;
    this.totalElements = $event.totalElements;
    this.totalPages = $event.totalPages;
    this.selectedCriteriaFilter = undefined;
    this.selectCriteriaSection.nativeElement.style.display = "none";
  }

  onCriteriaPayloadChanged(payload: {
    criteriaPayloadData: { [key: string]: any };
    newCriteriaPayloadData: { [key: string]: any };
  }) {
    this.criteriaPayloadData = payload.criteriaPayloadData;
    this.newCriteriaPayloadData = payload.newCriteriaPayloadData;
    this.updateSelectedCriteria();
    this.selectCriteriaSection.nativeElement.style.display = "none";
  }

  onRunScreenClicked() {
    this.hideCriteriaSections = true;
  }

  showCriteriaSections() {
    this.hideCriteriaSections = false;
  }

  onCriteriaExpanded(isExpanded: boolean) {
    if (isExpanded) {
      this.hideCriteriaSections = false;
    }
  }

  onEditCriteria(event: {
    type: string;
    parentFilter?: string;
    criteriaKey?: string;
    criteriaData?: any;
  }) {
    console.log("Edit criteria event received:", event);
    console.log("Category data:", this.categoryData);

    // If editing Exchange, open the exchanges component instead of dropdown
    if (event.criteriaKey === 'exchange') {
      this.selectedCriteriaFilter = 'exchanges';
      setTimeout(() => {
        if (this.selectCriteriaSection) {
          this.selectCriteriaSection.nativeElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          });
        }
      }, 100);
      return;
    }

    // Show the criteria selection section
    this.showCategoryTemplate();

    // Scroll to the criteria selection section
    setTimeout(() => {
      if (this.selectCriteriaSection) {
        this.selectCriteriaSection.nativeElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    }, 100);

    // Find the criteria in the category data
    if (!event.criteriaKey) {
      console.warn("No criteria key provided for editing");
      return;
    }
    const targetCriteria = this.findCriteriaById(
      this.categoryData,
      event.criteriaKey
    );

    console.log("Target criteria found:", targetCriteria);

    if (targetCriteria) {
      // Navigate to the criteria and highlight it
      this.traverseAndHighlightCriteria(targetCriteria);

      // Pre-populate the form with existing values if available
      if (event.criteriaData) {
        this.populateFormWithExistingData(targetCriteria, event.criteriaData);
      }
    } else {
      console.warn("Could not find criteria with key:", event.criteriaKey);
      // Let's search more broadly to see what we have
      this.searchAllCriteria(this.categoryData, event.criteriaKey);
    }
  }

  private updateSelectedCriteria() {
    this.selectedTableCriteria = [];

    // Check criteria payload for sector selection
    if (
      this.criteriaPayloadData["primaryIndustry"] &&
      this.criteriaPayloadData["primaryIndustry"].length > 0
    ) {
      this.selectedTableCriteria.push("sector");
    }

    // Check criteria payload for location selection
    if (
      this.criteriaPayloadData["state"] &&
      this.criteriaPayloadData["state"].length > 0
    ) {
      this.selectedTableCriteria.push("geography");
      this.selectedTableCriteria.push("state");
    }

    // Add financial criteria columns
    this.addFinancialCriteriaColumns();
  }

  private addFinancialCriteriaColumns() {
    // Check legacy criteria payload for financial metrics
    const financialKeys = [
      "totalAssets",
      "cashAndEquivalents",
      "totalLiabilities",
      "totalEquity",
      "currentAssets",
      "currentLiabilities",
      "longTermDebt",
      "shortTermDebt",
      "shortTermInvestments",
      "accountsReceivable",
      "inventory",
      "propertyPlantEquipment",
      "goodwill",
      "intangibleAssets",
      "retainedEarnings",
      "commonStock",
    ];

    financialKeys.forEach((key) => {
      if (this.criteriaPayloadData[key]) {
        const columnName = this.getColumnNameFromKey(key);
        if (!this.selectedTableCriteria.includes(columnName)) {
          this.selectedTableCriteria.push(columnName);
        }
      }
    });

    // Check new criteria payload for financial metrics
    Object.keys(this.newCriteriaPayloadData).forEach((parentFilter) => {
      const filterData = this.newCriteriaPayloadData[parentFilter];
      Object.keys(filterData).forEach((criteriaKey) => {
        const columnName = this.getColumnNameFromKey(criteriaKey);
        if (!this.selectedTableCriteria.includes(columnName)) {
          this.selectedTableCriteria.push(columnName);
        }
      });
    });
  }

  router = inject(Router);

  navigateToBusinessInfo(company: any) {
    // Use companyId (current format) with fallbacks to company_id and id (legacy formats)
    const companyId = company.companyId || company.company_id || company.id;

    if (!companyId) {
      console.error("❌ No company ID found in company object:", company);
      console.error("Available fields:", Object.keys(company));
      return;
    }

    const url = `${window.location.origin}/business-info?ticker=${company.ticker}&id=${companyId}`;
    window.open(url, "_blank");
  }

  private getColumnNameFromKey(key: string): string {
    const columnMap: { [key: string]: string } = {
      totalAssets: "totalAssets",
      cashAndEquivalents: "cashAndEquivalents",
      totalLiabilities: "totalLiabilities",
      totalEquity: "totalEquity",
      currentAssets: "currentAssets",
      currentLiabilities: "currentLiabilities",
      longTermDebt: "longTermDebt",
      shortTermDebt: "shortTermDebt",
      shortTermInvestments: "shortTermInvestments",
      accountsReceivable: "accountsReceivable",
      inventory: "inventory",
      propertyPlantEquipment: "propertyPlantEquipment",
      goodwill: "goodwill",
      intangibleAssets: "intangibleAssets",
      retainedEarnings: "retainedEarnings",
      commonStock: "commonStock",
    };
    return columnMap[key] || key;
  }

  getColumnDisplayName(column: string): string {
    const displayMap: { [key: string]: string } = {
      totalAssets: "Total Assets",
      cashAndEquivalents: "Cash & Equivalents",
      totalLiabilities: "Total Liabilities",
      totalEquity: "Total Equity",
      currentAssets: "Current Assets",
      currentLiabilities: "Current Liabilities",
      longTermDebt: "Long Term Debt",
      shortTermDebt: "Short Term Debt",
      shortTermInvestments: "Short Term Investments",
      accountsReceivable: "Accounts Receivable",
      inventory: "Inventory",
      propertyPlantEquipment: "Property, Plant & Equipment",
      goodwill: "Goodwill",
      intangibleAssets: "Intangible Assets",
      retainedEarnings: "Retained Earnings",
      commonStock: "Common Stock",
      rental_revenue: "Rental Revenue",
    };
    return (
      displayMap[column] ||
      column
        .replace(/_/g, " ") // Replace underscores with spaces
        .replace(/([A-Z])/g, " $1") // Add space before capital letters
        .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    );
  }

  private getNestedFinancialValue(company: any, field: string): any {
    console.log(`🔍 getNestedFinancialValue called for field: ${field}`);

    // Analyze the company data structure for better debugging
    this.analyzeCompanyDataStructure(company);

    // Debug the payload structure to understand what we're looking for
    this.debugPayloadStructure();

    console.log(`🔍 newCriteriaPayloadData:`, this.newCriteriaPayloadData);
    console.log(`🔍 addedCriteria:`, this.addedCriteria);

    // Prefer section/year mapping derived from current FilterSteps
    let targetYear: string | null = null;
    let targetSection: string | null = null;

    const mapped = this.fieldSectionYearMap[field];
    if (mapped) {
      targetSection = mapped.section;
      if (mapped.years && mapped.years.length > 0) {
        // Use the most recent year
        const maxYear = Math.max(...mapped.years);
        targetYear = String(maxYear);
      }
      console.log(`🔍 Using mapped section/year for ${field}:`, mapped);
    }

    // If not mapped, attempt to infer from newCriteriaPayloadData as a fallback
    if (!targetSection) {
      if (
        this.newCriteriaPayloadData &&
        Object.keys(this.newCriteriaPayloadData).length > 0
      ) {
        for (const [parentFilter, filterData] of Object.entries(
          this.newCriteriaPayloadData
        )) {
          if (filterData && typeof filterData === "object") {
            for (const [criteriaKey] of Object.entries(filterData)) {
              if (criteriaKey === field) {
                const matchingCriteria = this.addedCriteria.find((criteria) => {
                  return (
                    criteria[parentFilter] && criteria[parentFilter][criteriaKey]
                  );
                });
                if (matchingCriteria && matchingCriteria.year) {
                  targetYear = matchingCriteria.year;
                }
                targetSection = parentFilter;
                break;
              }
            }
            if (targetSection) break;
          }
        }
      } else {
        console.log(`⚠️ No newCriteriaPayloadData available`);
      }
    }

    if (!targetYear) {
      console.log(
        `⚠️ No target year found for field ${field}, will use fallback logic`
      );
    }

    // SIMPLIFIED APPROACH: Look directly in the section that matches our payload
    // The payload structure tells us exactly where to look

    if (targetSection && company[targetSection]) {
      const sectionData = company[targetSection];
      console.log(`🔍 Looking in section ${targetSection} for field ${field}`);
      console.log(`🔍 Section data:`, sectionData);

      if (Array.isArray(sectionData) && sectionData.length > 0) {
        // If we have a target year, find the data for that specific year
        if (targetYear) {
          const yearData = this.findDataForYear(sectionData, targetYear, field);
          if (yearData !== null) {
            console.log(
              `✅ Successfully found year ${targetYear} data for ${field} in section ${targetSection}: ${yearData}`
            );
            return yearData;
          } else {
            console.log(
              `⚠️ Year ${targetYear} data not found for ${field} in section ${targetSection}`
            );
          }
        }

        // Fallback to first element if no year found or year data not found
        const latest = sectionData[0];
        if (latest && Object.prototype.hasOwnProperty.call(latest, field)) {
          console.log(
            `🔄 Using fallback data (first element) for ${field} in section ${targetSection}: ${latest[field]}`
          );
          return latest[field];
        } else {
          console.log(
            `⚠️ Field ${field} not found in section ${targetSection}`
          );
          console.log(
            `⚠️ Available fields in section:`,
            Object.keys(latest || {})
          );
        }
      }
    } else {
      console.log(
        `⚠️ Target section ${targetSection} not found in company data`
      );
      console.log(`⚠️ Available company sections:`, Object.keys(company));
    }

    // If we know the target section (from mapping or inference) but couldn't fetch a value, stop here
    // Avoid cross-section fallbacks to prevent mismatches
    if (targetSection) {
      return null;
    }

    // As a last resort only when no section is known at all, perform a conservative lookup
    // Try top-level field only (no cross-section array scanning)

    // 3) Final fallback: top-level value (if present)
    const finalValue = company[field];
    console.log(
      `🔄 Final fallback: using top-level value for ${field}: ${finalValue}`
    );
    return finalValue;
  }

  /**
   * Helper method to find data for a specific year in an array of financial data
   */
  private findDataForYear(
    dataArray: any[],
    targetYear: string,
    field: string
  ): any {
    // Normalize the target year (remove "FY" prefix if present)
    const normalizedTargetYear = targetYear.replace(/^FY/i, "");

    console.log(
      `🔍 Searching for year ${normalizedTargetYear} in field ${field}`
    );
    console.log(`🔍 Data array length: ${dataArray.length}`);

    for (const dataItem of dataArray) {
      console.log(`🔍 Checking data item:`, dataItem);

      // Check if this data item has a year field
      if (dataItem.year) {
        const itemYear = dataItem.year.toString().replace(/^FY/i, "");
        console.log(
          `🔍 Found year field: ${itemYear} vs target: ${normalizedTargetYear}`
        );
        if (itemYear === normalizedTargetYear) {
          console.log(
            `✅ Found matching year! Returning ${field}: ${dataItem[field]}`
          );
          return dataItem[field];
        }
      }

      // Also check for fiscalYear field
      if (dataItem.fiscalYear) {
        const itemYear = dataItem.fiscalYear.toString().replace(/^FY/i, "");
        console.log(
          `🔍 Found fiscalYear field: ${itemYear} vs target: ${normalizedTargetYear}`
        );
        if (itemYear === normalizedTargetYear) {
          console.log(
            `✅ Found matching fiscalYear! Returning ${field}: ${dataItem[field]}`
          );
          return dataItem[field];
        }
      }

      // Check for period field (might contain year info)
      if (dataItem.period) {
        const itemYear = dataItem.period.toString().replace(/^FY/i, "");
        console.log(
          `🔍 Found period field: ${itemYear} vs target: ${normalizedTargetYear}`
        );
        if (itemYear === normalizedTargetYear) {
          console.log(
            `✅ Found matching period! Returning ${field}: ${dataItem[field]}`
          );
          return dataItem[field];
        }
      }

      // Check for date field (might contain year info)
      if (dataItem.date) {
        const itemYear = dataItem.date.toString().replace(/^FY/i, "");
        console.log(
          `🔍 Found date field: ${itemYear} vs target: ${normalizedTargetYear}`
        );
        if (itemYear === normalizedTargetYear) {
          console.log(
            `✅ Found matching date! Returning ${field}: ${dataItem[field]}`
          );
          return dataItem[field];
        }
      }

      // Check for reportingDate field (common in financial data)
      if (dataItem.reportingDate) {
        const itemYear = dataItem.reportingDate.toString().replace(/^FY/i, "");
        console.log(
          `🔍 Found reportingDate field: ${itemYear} vs target: ${normalizedTargetYear}`
        );
        if (itemYear === normalizedTargetYear) {
          console.log(
            `✅ Found matching reportingDate! Returning ${field}: ${dataItem[field]}`
          );
          return dataItem[field];
        }
      }

      // Check for endDate field (common in financial data)
      if (dataItem.endDate) {
        const itemYear = dataItem.endDate.toString().replace(/^FY/i, "");
        console.log(
          `🔍 Found endDate field: ${itemYear} vs target: ${normalizedTargetYear}`
        );
        if (itemYear === normalizedTargetYear) {
          console.log(
            `✅ Found matching endDate! Returning ${field}: ${dataItem[field]}`
          );
          return dataItem[field];
        }
      }

      // Check for asOfDate field (common in financial data)
      if (dataItem.asOfDate) {
        const itemYear = dataItem.asOfDate.toString().replace(/^FY/i, "");
        console.log(
          `🔍 Found asOfDate field: ${itemYear} vs target: ${normalizedTargetYear}`
        );
        if (itemYear === normalizedTargetYear) {
          console.log(
            `✅ Found matching asOfDate! Returning ${field}: ${dataItem[field]}`
          );
          return dataItem[field];
        }
      }
    }

    // Year not found, return null
    console.log(
      `⚠️ Could not find data for year ${targetYear} in field ${field}`
    );
    console.log(
      `⚠️ Available data items:`,
      dataArray.map((item) => ({
        year: item.year,
        fiscalYear: item.fiscalYear,
        period: item.period,
        date: item.date,
        reportingDate: item.reportingDate,
        endDate: item.endDate,
        asOfDate: item.asOfDate,
      }))
    );
    return null;
  }

  private buildPayload() {
    const payload: any = {};

    if (
      Array.isArray(this.locationSelection) &&
      this.locationSelection.length > 0
    ) {
      payload.GEOGRAPHY = this.locationSelection;
    } else if (
      this.locationSelection &&
      typeof this.locationSelection === "object" &&
      this.locationSelection.grouped
    ) {
      // Handle object format location selection
      payload.GEOGRAPHY = this.locationSelection;
    }

    if (
      this.sectorSelection.GICS_PRIMARY_INDUSTRY &&
      this.sectorSelection.GICS_PRIMARY_INDUSTRY.length > 0
    ) {
      payload.GICS_PRIMARY_INDUSTRY =
        this.sectorSelection.GICS_PRIMARY_INDUSTRY;
    }

    return payload;
  }

  private buildFilterSteps(): FilterStep[] {
    console.log("🔍 BUILDFILTER DEBUG: Starting buildFilterSteps()");
    const filterSteps: FilterStep[] = [];

    // Transform sector selection
    if (
      this.sectorSelection.GICS_PRIMARY_INDUSTRY &&
      this.sectorSelection.GICS_PRIMARY_INDUSTRY.length > 0
    ) {
      console.log(
        "🔍 BUILDFILTER DEBUG: Processing sector selection:",
        this.sectorSelection
      );
      const sectorSteps = this.transformationService.transformSectorSelection(
        this.sectorSelection
      );
      console.log("🔍 BUILDFILTER DEBUG: Generated sector steps:", sectorSteps);
      filterSteps.push(...sectorSteps);
    }

    // Transform location selection
    if (
      this.locationSelection &&
      ((Array.isArray(this.locationSelection) &&
        this.locationSelection.length > 0) ||
        (typeof this.locationSelection === "object" &&
          this.locationSelection.grouped))
    ) {
      console.log(
        "🔍 BUILDFILTER DEBUG: Processing location selection:",
        this.locationSelection
      );
      console.log(
        "🔍 BUILDFILTER DEBUG: locationSelection type:",
        typeof this.locationSelection
      );
      console.log(
        "🔍 BUILDFILTER DEBUG: locationSelection structure:",
        JSON.stringify(this.locationSelection, null, 2)
      );

      const locationSteps =
        this.transformationService.transformLocationSelection(
          this.locationSelection
        );
      console.log(
        "🔍 BUILDFILTER DEBUG: Generated location steps:",
        locationSteps
      );
      console.log(
        "🔍 BUILDFILTER DEBUG: Location steps length:",
        locationSteps.length
      );
      filterSteps.push(...locationSteps);
    } else {
      console.log(
        "🔍 BUILDFILTER DEBUG: Location selection is empty or invalid:"
      );
      console.log(
        "🔍 BUILDFILTER DEBUG: locationSelection:",
        this.locationSelection
      );
      console.log(
        "🔍 BUILDFILTER DEBUG: locationSelection type:",
        typeof this.locationSelection
      );
      if (
        this.locationSelection &&
        typeof this.locationSelection === "object"
      ) {
        console.log(
          "🔍 BUILDFILTER DEBUG: locationSelection.grouped:",
          this.locationSelection.grouped
        );
      }
    }

    // Transform company type and status
    if (this.selectedCompanyType || this.selectedCompanyStatus) {
      console.log(
        "🔍 BUILDFILTER DEBUG: Processing company type/status selection:"
      );
      console.log(
        "🔍 BUILDFILTER DEBUG: selectedCompanyType:",
        this.selectedCompanyType
      );
      console.log(
        "🔍 BUILDFILTER DEBUG: selectedCompanyStatus:",
        this.selectedCompanyStatus
      );
      console.log(
        "🔍 BUILDFILTER DEBUG: selectedCompanyType type:",
        typeof this.selectedCompanyType
      );
      console.log(
        "🔍 BUILDFILTER DEBUG: selectedCompanyStatus type:",
        typeof this.selectedCompanyStatus
      );

      // Check if they have the expected structure
      if (this.selectedCompanyType) {
        console.log(
          "🔍 BUILDFILTER DEBUG: selectedCompanyType.COMPANY_TYPE:",
          this.selectedCompanyType.COMPANY_TYPE
        );
      }
      if (this.selectedCompanyStatus) {
        console.log(
          "🔍 BUILDFILTER DEBUG: selectedCompanyStatus.COMPANY_STATUS:",
          this.selectedCompanyStatus.COMPANY_STATUS
        );
      }

      const companySteps =
        this.transformationService.transformCompanyTypeSelection(
          this.selectedCompanyType,
          this.selectedCompanyStatus
        );
      console.log(
        "🔍 BUILDFILTER DEBUG: Generated company type/status steps:",
        companySteps
      );
      filterSteps.push(...companySteps);
    } else {
      console.log(
        "🔍 BUILDFILTER DEBUG: No company type/status selection found"
      );
    }

    // Transform financial metrics
    if (
      this.selectedFinancialMetrics &&
      Object.keys(this.selectedFinancialMetrics).length > 0
    ) {
      console.log(
        "🔍 BUILDFILTER DEBUG: Processing financial metrics selection:"
      );
      console.log(
        "🔍 BUILDFILTER DEBUG: selectedFinancialMetrics:",
        this.selectedFinancialMetrics
      );
      console.log(
        "🔍 BUILDFILTER DEBUG: selectedFinancialMetrics type:",
        typeof this.selectedFinancialMetrics
      );
      console.log(
        "🔍 BUILDFILTER DEBUG: selectedFinancialMetrics keys:",
        Object.keys(this.selectedFinancialMetrics)
      );

      const financialSteps =
        this.transformationService.transformFinancialMetrics(
          this.selectedFinancialMetrics
        );
      console.log(
        "🔍 BUILDFILTER DEBUG: Generated financial metrics steps:",
        financialSteps
      );
      filterSteps.push(...financialSteps);
    } else {
      console.log("🔍 BUILDFILTER DEBUG: No financial metrics selection found");
      console.log(
        "🔍 BUILDFILTER DEBUG: selectedFinancialMetrics:",
        this.selectedFinancialMetrics
      );
      if (this.selectedFinancialMetrics) {
        console.log(
          "🔍 BUILDFILTER DEBUG: selectedFinancialMetrics keys length:",
          Object.keys(this.selectedFinancialMetrics).length
        );
      }
    }

    // Transform added criteria (from dropdown)
    if (this.addedCriteria && this.addedCriteria.length > 0) {
      console.log(
        "🔍 BUILDFILTER DEBUG: Processing addedCriteria:",
        JSON.stringify(this.addedCriteria)
      );
      console.log(
        "🔍 BUILDFILTER DEBUG: Current filterSteps before addedCriteria:",
        JSON.stringify(filterSteps)
      );

      // Convert addedCriteria to the format expected by transformNewCriteria
      const newCriteriaData: any = {};
      let extractedYear: string | undefined;

      this.addedCriteria.forEach((criteria) => {
        const year = criteria.year;
        // Extract the year from the first criteria (assuming all criteria use the same year)
        if (!extractedYear && year) {
          extractedYear = year;
        }
        Object.keys(criteria).forEach((key) => {
          if (key !== "year") {
            newCriteriaData[key] = criteria[key];
          }
        });
      });

      console.log(
        "🔍 BUILDFILTER DEBUG: Built newCriteriaData:",
        JSON.stringify(newCriteriaData)
      );

      // Convert FY2024 format to 2024
      let processedYear: string | undefined;
      if (extractedYear) {
        // Extract numeric year from formats like "FY2024", "2024", etc.
        const yearMatch = extractedYear.match(/(\d{4})/);
        if (yearMatch) {
          processedYear = yearMatch[1];
        } else {
          processedYear = extractedYear; // Fallback to original value
        }
      }

      console.log(
        "🔍 BUILDFILTER DEBUG: Extracted year from criteria:",
        extractedYear
      );
      console.log(
        "🔍 BUILDFILTER DEBUG: Processed year for transformNewCriteria:",
        processedYear
      );

      const newCriteriaSteps = this.transformationService.transformNewCriteria(
        newCriteriaData,
        processedYear
      );
      console.log(
        "🔍 BUILDFILTER DEBUG: Generated newCriteria steps:",
        JSON.stringify(newCriteriaSteps)
      );
      filterSteps.push(...newCriteriaSteps);
      console.log(
        "🔍 BUILDFILTER DEBUG: FilterSteps after adding newCriteria:",
        JSON.stringify(filterSteps)
      );
    }

    console.log(
      "🔍 BUILDFILTER DEBUG: Final filterSteps before combine:",
      JSON.stringify(filterSteps)
    );

    // Combine and remove duplicates
    const combinedSteps =
      this.transformationService.combineFilterSteps(filterSteps);
    console.log(
      "🔍 BUILDFILTER DEBUG: Final combined filterSteps:",
      JSON.stringify(combinedSteps)
    );

    return combinedSteps;
  }
  loadCompaniesData() {
    // DEBUG: Log current state before building filter steps

    // Use preserved filter steps if available, otherwise build new ones
    let filterSteps: any[];
    
    if (this.currentFilterSteps && this.currentFilterSteps.length > 0) {
      // Use preserved filter steps to maintain criteria across pagination
      filterSteps = this.currentFilterSteps;
      console.log("🔍 Using preserved filter steps for pagination:", filterSteps);
    } else {
      // Build new FilterSteps using the transformation service
      filterSteps = this.buildFilterSteps();
      console.log("🔍 Built new filter steps:", filterSteps);
    }

    // Build/refresh the field-to-section-year mapping from the filter steps
    this.populateFieldSectionYearMap(filterSteps as FilterStep[]);

    this.apiService
      .searchCompanies(filterSteps, this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          console.log("✅ searchCompanies SUCCESS for page", this.currentPage);
          this.companiesClusterData = response.content;
          this.totalElements = response.totalElements;
          this.totalPages = response.totalPages;

          // Discover available fields from the response data
          if (response.content && response.content.length > 0) {
            const availableFields = this.discoverAvailableFields(
              response.content
            );
            console.log(
              `🔍 Available fields for table columns:`,
              availableFields
            );
          }
        },
        error: (error) => {
          console.error("❌ searchCompanies FAILED for page", this.currentPage);
          console.error("Error details:", error);

          // Handle specific error cases
          if (error.status === 504) {
            console.error(
              "🔍 504 Gateway Timeout - Backend processing timeout"
            );
            // Show user-friendly error message
            this.companiesClusterData = [];
            this.totalElements = 0;
            this.totalPages = 0;
            // You could show a toast/alert here: "Search timed out. Please try with fewer criteria."
          } else if (error.status === 0) {
            console.error("🔍 Network error - Check connection");
            this.companiesClusterData = [];
            this.totalElements = 0;
            this.totalPages = 0;
          } else {
            console.error("🔍 API error:", error.status, error.message);
            this.companiesClusterData = [];
            this.totalElements = 0;
            this.totalPages = 0;
          }
        },
      });
  }

  // Build a mapping from field name to its section and years based on current FilterSteps
  private populateFieldSectionYearMap(steps: FilterStep[]): void {
    const map: { [field: string]: { section: string; years?: number[] } } = {};
    for (const step of steps) {
      if (!step || !step.field || !step.section) continue;
      // Prefer the most recent years if multiple entries exist for the same field
      const existing = map[step.field];
      if (!existing) {
        map[step.field] = { section: step.section, years: step.years };
      } else {
        // If new step has years, and either existing has none or new has a more recent year, replace
        if (step.years && step.years.length > 0) {
          if (!existing.years || existing.years.length === 0) {
            map[step.field] = { section: step.section, years: step.years };
          } else {
            const maxExisting = Math.max(...existing.years);
            const maxNew = Math.max(...step.years);
            if (maxNew >= maxExisting) {
              map[step.field] = { section: step.section, years: step.years };
            }
          }
        }
      }
    }
    this.fieldSectionYearMap = map;
    console.log('🔍 Field→Section/Years map:', this.fieldSectionYearMap);
  }

  // Helper methods for template
  getStartRecord(): number {
    if (this.totalElements === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndRecord(): number {
    if (this.totalElements === 0) return 0;
    return Math.min(this.currentPage * this.pageSize, this.totalElements);
  }
  // Pagination methods
  onPageSizeChange(event: any) {
    const newPageSize = +event.target.value;
    this.pageSize = newPageSize;
    this.currentPage = 1;
    this.onPageChangeWithCriteria(1, newPageSize);
  }

  onPreviousPage() {
    if (this.currentPage > 1) {
      this.onPageChangeWithCriteria(this.currentPage - 1, this.pageSize);
    }
  }

  onNextPage() {
    if (this.currentPage < this.totalPages) {
      this.onPageChangeWithCriteria(this.currentPage + 1, this.pageSize);
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.onPageChangeWithCriteria(page, this.pageSize);
    }
  }

  // Method to handle pagination while preserving criteria
  onPageChangeWithCriteria(pageNo: number, pageSize: number = this.pageSize): void {
    // Ensure we have the current filter steps
    if (!this.currentFilterSteps || this.currentFilterSteps.length === 0) {
      // If no preserved filter steps, build new ones
      this.currentFilterSteps = this.buildFilterSteps();
    }
    
    // Update page and size
    this.currentPage = pageNo;
    this.pageSize = pageSize;
    
    // Load data with preserved criteria
    this.loadCompaniesData();
  }

  // Method to refresh criteria data from the criteria component
  refreshCriteriaData(): void {
    if (this.criteriaComponent) {
      // Get the current filter steps and criteria data
      this.currentFilterSteps = this.criteriaComponent.getCurrentFilterSteps();
      const criteriaPayload = this.criteriaComponent.getCurrentCriteriaPayload();
      
      // Update the local criteria data
      this.criteriaPayloadData = criteriaPayload.criteriaPayloadData;
      this.newCriteriaPayloadData = criteriaPayload.newCriteriaPayloadData;
      
      console.log("🔍 Refreshed criteria data:", {
        filterSteps: this.currentFilterSteps,
        criteriaPayload: this.criteriaPayloadData,
        newCriteriaPayload: this.newCriteriaPayloadData
      });

      // Refresh the mapping as well
      this.populateFieldSectionYearMap(this.currentFilterSteps as FilterStep[]);
    }
  }

  // Helper methods for template
  shouldShowColumn(column: string): boolean {
    if (column === "companyName") return true; // Always show company name
    return this.selectedTableCriteria.includes(column);
  }

  getDisplayValue(company: any, field: string): string {
    switch (field) {
      case "sector":
        return company.sector || "";
      case "geography":
        return company.countryName || "";
      case "primaryIndustry":
        return company.primaryIndustry || "";
      case "state":
        return company.state || "";
      default:
        const value = this.getNestedFinancialValue(company, field);
        if (value === null || value === undefined || value === "") {
          return "";
        }

        // Dynamically determine if this is a numeric field and how to format it
        return this.formatValueDynamically(value, field);
    }
  }

  /**
   * Dynamically formats values based on their type and content
   */
  private formatValueDynamically(value: any, field: string): string {
    // If it's already a string, return as is
    if (typeof value === "string") {
      return value;
    }

    // If it's a number, determine the best formatting
    if (typeof value === "number") {
      // Check if it's a ratio/percentage (typically between 0-1 or 0-100)
      if (value >= 0 && value <= 100) {
        // If it's a small decimal, format as ratio with 2 decimal places
        if (value < 1) {
          return value.toFixed(4); // e.g., 0.1234
        } else if (value <= 10) {
          return value.toFixed(2); // e.g., 5.67
        } else {
          return value.toFixed(2); // e.g., 25.50
        }
      }

      // For large numbers, format as currency with thousands separators
      if (Math.abs(value) >= 1000) {
        return new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(value);
      }

      // For medium numbers, just return as is
      return value.toString();
    }

    // For other types, convert to string
    return value.toString();
  }

  // Check if a column contains numeric values for right alignment
  isNumericColumn(column: string): boolean {
    // Skip known non-numeric columns
    const nonNumericColumns = [
      "sector",
      "geography",
      "primaryIndustry",
      "state",
      "companyName",
    ];
    if (nonNumericColumns.includes(column)) {
      return false;
    }

    // For dynamic columns, check if the first few companies have numeric values
    if (this.companiesClusterData.length > 0) {
      const sampleSize = Math.min(5, this.companiesClusterData.length);
      let numericCount = 0;
      let totalChecked = 0;

      for (let i = 0; i < sampleSize; i++) {
        const company = this.companiesClusterData[i];
        const value = this.getNestedFinancialValue(company, column);

        if (value !== null && value !== undefined && value !== "") {
          totalChecked++;
          // Check if the value is numeric (number or string that can be converted to number)
          const numValue =
            typeof value === "number" ? value : parseFloat(value);
          if (!isNaN(numValue)) {
            numericCount++;
          }
        }
      }

      // If we checked at least 2 values and more than 50% are numeric, consider it a numeric column
      if (totalChecked >= 2) {
        const isNumeric = numericCount > totalChecked / 2;
        console.log(
          `🔍 Column ${column}: ${numericCount}/${totalChecked} values are numeric -> ${
            isNumeric ? "NUMERIC" : "NOT NUMERIC"
          }`
        );
        return isNumeric;
      }
    }

    // If we can't determine from data, check if it's a known financial field pattern
    // This is a fallback for when no data is available yet
    const financialFieldPatterns = [
      /^(total|current|longTerm|shortTerm|net|gross|operating|ebit|ebitda|revenue|sales|income|profit|loss|debt|equity|assets|liabilities|ratio|margin|return)/i,
      /(assets|liabilities|equity|debt|revenue|income|profit|loss|ratio|margin|return|earnings|stock|investment|receivable|payable|inventory|equipment|goodwill|intangible)/i,
    ];

    const matchesPattern = financialFieldPatterns.some((pattern) =>
      pattern.test(column)
    );
    console.log(
      `🔍 Column ${column}: pattern match fallback -> ${
        matchesPattern ? "LIKELY NUMERIC" : "LIKELY NOT NUMERIC"
      }`
    );

    return matchesPattern;
  }

  // Generate page numbers for pagination display
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  }

  //FUNCTIONALITY to open criteria from selection
  onDropdownCriteriaChange(criteria: CategoryItem) {
    console.log(
      "🔍 DEBUG: onDropdownCriteriaChange called with criteria:",
      criteria
    );
    console.log("🔍 DEBUG: criteria.fiscalYear:", criteria.fiscalYear);
    console.log("🔍 DEBUG: criteria.fiscalQuarter:", criteria.fiscalQuarter);
    console.log("🔍 DEBUG: criteria.yearType:", criteria.yearType);
    console.log(
      "🔍 DEBUG: criteria.defaultYear:",
      (criteria as any).defaultYear
    );

    // FIX: If this is a financial criteria with a default year, auto-populate the form
    if ((criteria as any).defaultYear) {
      console.log("🔧 FIX: Auto-populating year fields for financial criteria");
      this.selectedYearType = "Fiscal Year"; // Default to Fiscal Year
      this.selectedPeriod = (criteria as any).defaultYear; // Use the default year
      console.log("🔧 FIX: Set selectedYearType to:", this.selectedYearType);
      console.log("🔧 FIX: Set selectedPeriod to:", this.selectedPeriod);
    }

    // Show the category template first
    this.showCategoryTemplate();

    // Then traverse and highlight the criteria
    setTimeout(() => {
      this.traverseAndHighlightCriteria(criteria);
    }, 100); // Small delay to ensure DOM is updated
  }
  @ViewChild("selectCriteriaSection")
  selectCriteriaSection!: ElementRef<HTMLDivElement>;
  showCategoryTemplate(): void {
    // Hide the category template
    this.selectCriteriaSection.nativeElement.style.display = "block";
    // const categoryTemplate = document.querySelector(".select-criteria-box");
    // if (categoryTemplate) {
    //   (categoryTemplate as HTMLElement).style.display = "block";
    // }
  }

  traverseAndHighlightCriteria(targetCriteria: CategoryItem): void {
    // First, find the path to the target criteria
    const pathToTarget = this.findPathToCriteria(
      this.categoryData,
      targetCriteria.id
    );
    console.log(targetCriteria);

    if (pathToTarget && pathToTarget.length > 0) {
      // Expand all parent nodes in the path
      this.expandPathToTarget(pathToTarget);

      // Wait for DOM updates, then highlight the target
      setTimeout(() => {
        this.highlightTargetCriteria(targetCriteria.id);
        this.selectCriteria(targetCriteria);
      }, 500); // Increased timeout to ensure DOM is ready
    }
  }
  findPathToCriteria(
    items: CategoryItem[],
    targetId: string,
    currentPath: CategoryItem[] = []
  ): CategoryItem[] | null {
    for (const item of items) {
      const newPath = [...currentPath, item];

      // If this is the target item, return the path
      if (item.id === targetId) {
        return newPath;
      }

      // If item has children, search recursively
      if (item.children && item.children.length > 0) {
        const foundPath = this.findPathToCriteria(
          item.children,
          targetId,
          newPath
        );
        if (foundPath) {
          return foundPath;
        }
      }
    }

    return null;
  }
  expandPathToTarget(pathToTarget: CategoryItem[]): void {
    // Expand all items in the path except the last one (which is the target leaf node)
    for (let i = 0; i < pathToTarget.length - 1; i++) {
      const item = pathToTarget[i];
      if (item.children && item.children.length > 0) {
        item.expanded = true;
      }
    }
  }
  highlightTargetCriteria(targetId: string): void {
    console.log("Highlighting target criteria with ID:", targetId);

    // Remove any existing highlights
    this.removeExistingHighlights();

    // Find and highlight the target element
    const targetElement = document.querySelector(
      `[data-criteria-id="${targetId}"]`
    );
    console.log("Target element found:", targetElement);

    if (targetElement) {
      targetElement.classList.add("highlighted-from-dropdown");
      console.log("Added highlight class to element");

      // Scroll into view
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });

      // Optional: Remove highlight after a few seconds
      setTimeout(() => {
        targetElement.classList.remove("highlighted-from-dropdown");
      }, 3000);
    } else {
      console.warn("Could not find element with data-criteria-id:", targetId);
      // Let's see what elements we have
      const allCriteriaElements =
        document.querySelectorAll("[data-criteria-id]");
      console.log("All criteria elements found:", allCriteriaElements);
      allCriteriaElements.forEach((el, index) => {
        console.log(`Element ${index}:`, el.getAttribute("data-criteria-id"));
      });
    }
  }
  removeExistingHighlights(): void {
    const highlightedElements = document.querySelectorAll(
      ".highlighted-from-dropdown"
    );
    highlightedElements.forEach((element) => {
      element.classList.remove("highlighted-from-dropdown");
    });
  }

  // Enhanced selectCriteria method to work with dropdown selection
  selectCriteriaFromDropdown(item: CategoryItem): void {
    // Only select items that have no children (leaf nodes)
    if (!item.children || item.children.length === 0) {
      this.selectedCriteria = item;
      this.resetSelections();

      // Also highlight it visually
      setTimeout(() => {
        this.highlightTargetCriteria(item.id);
      }, 100);
    }
  }

  // Method to collapse all and then expand specific path
  collapseAllAndExpandPath(targetCriteria: CategoryItem): void {
    // First collapse all
    this.collapseAll(this.categoryData);

    // Then expand path to target
    setTimeout(() => {
      this.traverseAndHighlightCriteria(targetCriteria);
    }, 100);
  }

  // Helper method to find criteria by ID or name in the category data
  private findCriteriaById(
    items: CategoryItem[],
    criteriaId: string
  ): CategoryItem | null {
    // Format the criteriaId the same way as the criteria component does
    const formattedCriteriaId = this.formatCriteriaDisplayName(criteriaId);

    for (const item of items) {
      // Try to match by ID first
      if (item.id === criteriaId) {
        return item;
      }

      // Try to match by name (case-insensitive)
      if (item.name.toLowerCase() === criteriaId.toLowerCase()) {
        return item;
      }

      // Try to match by formatted name (case-insensitive)
      if (item.name.toLowerCase() === formattedCriteriaId.toLowerCase()) {
        return item;
      }

      if (item.children && item.children.length > 0) {
        const found = this.findCriteriaById(item.children, criteriaId);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  // Helper method to format criteria display name (same as in criteria component)
  private formatCriteriaDisplayName(criteriaKey: string): string {
    return criteriaKey
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  // Helper method to populate form with existing data
  private populateFormWithExistingData(
    criteria: CategoryItem,
    criteriaData: any
  ) {
    // Set the selected criteria
    this.selectedCriteria = criteria;

    // Extract operator and value from criteria data
    const operator = Object.keys(criteriaData)[0];
    const value = criteriaData[operator];

    // Map the operator back to display format
    const operatorMap: { [key: string]: string } = {
      eq: "=",
      ne: "≠",
      lt: "<",
      gt: ">",
      gte: "≥",
      lte: "≤",
      between: "Between",
    };

    // Find the display operator - the operator is the key, we want the value
    const displayOperator = operatorMap[operator] || operator;

    // Set the form values
    this.selectedOperator = displayOperator;
    if (operator === "between" && Array.isArray(value)) {
      this.selectedValue = null;
      this.selectedValueMin = Number(value[0]);
      this.selectedValueMax = Number(value[1]);
    } else {
      this.selectedValue = Number(value);
      this.selectedValueMin = null;
      this.selectedValueMax = null;
    }

    // Reset year type and period as they might need to be re-selected
    this.selectedYearType = "";
    this.selectedPeriod = "";
  }

  // Debug method to search all criteria
  private searchAllCriteria(items: CategoryItem[], searchKey: string) {
    const formattedSearchKey = this.formatCriteriaDisplayName(searchKey);
    console.log("Searching for criteria with key:", searchKey);
    console.log("Formatted search key:", formattedSearchKey);
    this.searchAllCriteriaRecursive(items, searchKey, "");
  }

  private searchAllCriteriaRecursive(
    items: CategoryItem[],
    searchKey: string,
    path: string
  ) {
    const formattedSearchKey = this.formatCriteriaDisplayName(searchKey);

    for (const item of items) {
      const currentPath = path ? `${path} > ${item.name}` : item.name;
      console.log(
        `Checking: ${currentPath} (ID: ${item.id}, Name: ${item.name})`
      );

      if (item.id === searchKey) {
        console.log(`FOUND MATCH BY ID: ${currentPath} (ID: ${item.id})`);
      }

      if (item.name.toLowerCase() === searchKey.toLowerCase()) {
        console.log(`FOUND MATCH BY NAME: ${currentPath} (Name: ${item.name})`);
      }

      if (item.name.toLowerCase() === formattedSearchKey.toLowerCase()) {
        console.log(
          `FOUND MATCH BY FORMATTED NAME: ${currentPath} (Name: ${item.name})`
        );
      }

      if (item.children && item.children.length > 0) {
        this.searchAllCriteriaRecursive(item.children, searchKey, currentPath);
      }
    }
  }

  /**
   * Dynamically analyzes the company data structure to understand available fields
   */
  private analyzeCompanyDataStructure(company: any): void {
    console.log(
      `🔍 Analyzing company data structure for: ${
        company.companyName || company.name || "Unknown"
      }`
    );

    const structure: any = {};

    // Analyze all top-level properties
    Object.keys(company).forEach((key) => {
      const value = company[key];
      if (Array.isArray(value)) {
        structure[key] = {
          type: "array",
          length: value.length,
          sampleItems: value.slice(0, 2).map((item: any) => {
            if (typeof item === "object" && item !== null) {
              return {
                keys: Object.keys(item).slice(0, 10), // Show first 10 keys
                hasYear: item.year !== undefined,
                hasFiscalYear: item.fiscalYear !== undefined,
                hasPeriod: item.period !== undefined,
              };
            }
            return typeof item;
          }),
        };
      } else if (typeof value === "object" && value !== null) {
        structure[key] = {
          type: "object",
          keys: Object.keys(value).slice(0, 10),
        };
      } else {
        structure[key] = {
          type: typeof value,
          value: value,
        };
      }
    });

    console.log(`🔍 Company data structure:`, structure);
  }

  /**
   * Dynamically discovers all available fields from the company data
   */
  private discoverAvailableFields(companies: any[]): string[] {
    if (!companies || companies.length === 0) {
      return [];
    }

    const allFields = new Set<string>();

    companies.forEach((company) => {
      // Add top-level fields
      Object.keys(company).forEach((key) => {
        if (key !== "companyName" && key !== "name" && key !== "ticker") {
          allFields.add(key);
        }
      });

      // Add fields from array data
      Object.keys(company).forEach((key) => {
        const value = company[key];
        if (Array.isArray(value) && value.length > 0) {
          const firstItem = value[0];
          if (typeof firstItem === "object" && firstItem !== null) {
            Object.keys(firstItem).forEach((fieldKey) => {
              allFields.add(fieldKey);
            });
          }
        }
      });
    });

    const sortedFields = Array.from(allFields).sort();
    console.log(`🔍 Discovered available fields:`, sortedFields);

    return sortedFields;
  }

  /**
   * Debug method to show the payload structure and available sections/fields
   */
  private debugPayloadStructure(): void {
    console.log(`🔍 === PAYLOAD STRUCTURE DEBUG ===`);
    console.log(`🔍 newCriteriaPayloadData:`, this.newCriteriaPayloadData);
    console.log(`🔍 addedCriteria:`, this.addedCriteria);

    if (
      this.newCriteriaPayloadData &&
      Object.keys(this.newCriteriaPayloadData).length > 0
    ) {
      console.log(`🔍 Available sections in payload:`);
      Object.keys(this.newCriteriaPayloadData).forEach((section) => {
        const sectionData = this.newCriteriaPayloadData[section];
        if (sectionData && typeof sectionData === "object") {
          console.log(`  📁 Section: ${section}`);
          Object.keys(sectionData).forEach((field) => {
            console.log(`    └── Field: ${field}`);
          });
        }
      });
    }

    if (this.addedCriteria && this.addedCriteria.length > 0) {
      console.log(`🔍 Added criteria details:`);
      this.addedCriteria.forEach((criteria, index) => {
        console.log(`  📋 Criteria ${index + 1}:`);
        console.log(`    Year: ${criteria.year}`);
        Object.keys(criteria).forEach((key) => {
          if (key !== "year") {
            console.log(`    Section: ${key}`);
            const sectionData = criteria[key];
            if (sectionData && typeof sectionData === "object") {
              Object.keys(sectionData).forEach((field) => {
                console.log(`      └── Field: ${field}`);
              });
            }
          }
        });
      });
    }
    console.log(`🔍 === END PAYLOAD DEBUG ===`);
  }

  onCriteriaDataChanged(payload: {
    filterSteps: any[];
    criteriaPayloadData: { [key: string]: any };
    newCriteriaPayloadData: { [key: string]: any };
  }) {
    // Store the current filter steps for pagination
    this.currentFilterSteps = payload.filterSteps;
    
    // Update the criteria payload data
    this.criteriaPayloadData = payload.criteriaPayloadData;
    this.newCriteriaPayloadData = payload.newCriteriaPayloadData;
    
    // Update selected criteria
    this.updateSelectedCriteria();
    
    // Also refresh the criteria data to ensure synchronization
    this.refreshCriteriaData();
  }
}
