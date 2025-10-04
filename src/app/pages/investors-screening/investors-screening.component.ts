import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, ViewChild, HostListener, OnInit, AfterViewInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { InvestorsCriteriaComponent } from '../../components/investors-criteria/investors-criteria.component';

import { ApiService } from '../../services/api.service';
import { PayloadTransformationService } from '../../services/payload-transformation.service';


export interface CheckboxNode {
  name: string;
  checked?: boolean;
  indeterminate?: boolean;
  children?: CheckboxNode[];
  expanded?: boolean;
  type?: string;
  keyValue?: string;
}

interface SelectionPayload {
  grouped: { [key: string]: string[] };
  minimal: string[];
}

@Component({
  selector: 'app-investors-screening',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    InvestorsCriteriaComponent
  ],
  templateUrl: './investors-screening.component.html',
  styleUrl: './investors-screening.component.scss'
})
export class InvestorsScreeningComponent implements OnInit, AfterViewInit {
  http = inject(HttpClient);
  apiService = inject(ApiService);
  transformationService = inject(PayloadTransformationService);
  router = inject(Router);

  @ViewChild(InvestorsCriteriaComponent) investorsCriteriaComponent!: InvestorsCriteriaComponent;

  // Selection criteria
  selectedCriteriaFilter: 
    | undefined 
    | "financial-investor-profile" 
    | "financial-investment-preference";

  // Options for checkboxes - centralized configuration
  investorTypeOptions = [
    { label: 'Private Company' },
    { label: 'Public Company' },
    { label: 'Other' }
  ];

  investmentFirmTypeOptions = [
    { label: 'Private Equity or Venture Capital' },
    { label: 'Corporate Investor' },
    { label: 'Corporate Pension Plan Sponsor' },
    { label: 'Endowment Fund Sponsor' },
    { label: 'Family Office or Family Trust' },
    { label: 'Financial Investor' },
    { label: 'Foundation Fund Sponsor' },
    { label: 'Government Pension Plan Sponsor' },
    { label: 'REIT or Real Estate Investment Manager' },
    { label: 'Sovereign Wealth Fund' },
    { label: 'Structured Finance Pool Manager' },
    { label: 'Traditional Investment Manager' },
    { label: 'Union Pension Plan Sponsor' },
    { label: 'Hedge Fund Manager' },
    { label: 'Insurance Company' },
    { label: 'Investment Banking or Investment Firm' },
    { label: 'Other or Unknown' }
  ];

  locationOptions = [
    { label: 'United States and Canada' },
    { label: 'Europe' },
    { label: 'Asia Pacific' },
    { label: 'Africa' },
    { label: 'Middle East' },
    { label: 'Latin America & Caribbean' }
  ];

  sectorOptions = [
    { label: 'Health Care' },
    { label: 'Consumer Discretionary' },
    { label: 'Consumer Staples' },
    { label: 'Information Technology' },
    { label: 'Industrials' },
    { label: 'Real Estate' },
    { label: 'Financials' },
    { label: 'Utilities' },
    { label: 'Energy' },
    { label: 'Materials' },
    { label: 'Communication Services' }
  ];

  // Financial Investor Profile data - using labels as keys
  selectedInvestorProfile: any = {
    investorTypes: {},
    investmentFirmTypes: {},
    aum: {
      min: null as number | null,
      max: null as number | null
    }
  };

  // Financial Investment Preference data - using labels as keys
  selectedInvestmentPreference: any = {
    locations: {},
    sectors: {}
  };

  // Additional properties needed by criteria component
  selectedSector: any = {};
  minimalSelectedSector: string[] = [];
  selectedCompanyStatus: any = {};
  selectedFinancialMetrics: any = {};
  categoryData: any[] = [];
  newCriteriaToAdd: any = null;

  // Investor criteria selection properties (using same data as company screening)
  // investorCategoryData is now just an alias for categoryData
  selectedInvestorCriteria: any | null = null;
  selectedInvestorMinValue: number | null = null;
  selectedInvestorMaxValue: number | null = null;
  addedInvestorCriteria: any[] = [];
  newInvestorCriteriaToAdd: any = null;

  // Custom criteria types for investors
  investorCriteriaTypes = [
    { type: "Financial Investor Profile", fixedPosition: 0 },
    { type: "Financial Investment Preference", fixedPosition: 1 }
  ];

  // Clear selection flags
  clearInvestorProfileSelection: boolean = false;
  clearInvestmentPreferenceSelection: boolean = false;

  // Table data properties
  investorsData: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalElements: number = 0;
  totalPages: number = 0;
  pageSizeOptions: number[] = [10, 20, 30];
  selectedTableCriteria: string[] = [];


 

  ngOnInit() {
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    this.fetchInvestorCategoryData();
  }

  ngAfterViewInit() {
    // Trigger initial criteria update after view is initialized
    setTimeout(() => {
      if (this.investorsCriteriaComponent) {
        this.investorsCriteriaComponent.triggerCriteriaUpdate();
      }
    }, 0);
  }

  // Financial Investor Profile selection handlers
  onInvestorTypeChange(label: string, checked: boolean) {
    this.selectedInvestorProfile.investorTypes[label] = checked;
    this.updateSelectedCriteria();
    // Trigger criteria update in the child component
    if (this.investorsCriteriaComponent) {
      this.investorsCriteriaComponent.triggerCriteriaUpdate();
    }
  }

  onInvestmentFirmTypeChange(label: string, checked: boolean) {
    this.selectedInvestorProfile.investmentFirmTypes[label] = checked;
    this.updateSelectedCriteria();
    // Trigger criteria update in the child component
    if (this.investorsCriteriaComponent) {
      this.investorsCriteriaComponent.triggerCriteriaUpdate();
    }
  }

  onAumChange(min: number | null, max: number | null) {
    this.selectedInvestorProfile.aum.min = min;
    this.selectedInvestorProfile.aum.max = max;
    this.updateSelectedCriteria();
    // Trigger criteria update in the child component
    if (this.investorsCriteriaComponent) {
      this.investorsCriteriaComponent.triggerCriteriaUpdate();
    }
  }

  // Financial Investment Preference selection handlers
  onLocationChange(label: string, checked: boolean) {
    this.selectedInvestmentPreference.locations[label] = checked;
    this.updateSelectedCriteria();
    // Trigger criteria update in the child component
    if (this.investorsCriteriaComponent) {
      this.investorsCriteriaComponent.triggerCriteriaUpdate();
    }
  }

  onSectorChange(label: string, checked: boolean) {
    this.selectedInvestmentPreference.sectors[label] = checked;
    this.updateSelectedCriteria();
    // Trigger criteria update in the child component
    if (this.investorsCriteriaComponent) {
      this.investorsCriteriaComponent.triggerCriteriaUpdate();
    }
  }

  // Clear selection handlers
  onClearSelection(type: string) {
    if (type === "Financial Investor Profile") {
      this.selectedInvestorProfile = {
        investorTypes: {},
        investmentFirmTypes: {},
        aum: { min: null, max: null }
      };
      this.clearInvestorProfileSelection = true;
    } else if (type === "Financial Investment Preference") {
      this.selectedInvestmentPreference = {
        locations: {},
        sectors: {}
      };
      this.clearInvestmentPreferenceSelection = true;
    }
    this.updateSelectedCriteria();
    // Trigger criteria update in the child component
    if (this.investorsCriteriaComponent) {
      this.investorsCriteriaComponent.triggerCriteriaUpdate();
    }
  }

  // Show criteria selector
  showCriteriaSelector(type: string) {
    if (type === "Financial Investor Profile") {
      this.selectedCriteriaFilter = "financial-investor-profile";
    } else if (type === "Financial Investment Preference") {
      this.selectedCriteriaFilter = "financial-investment-preference";
    }
  }

  // Update selected table criteria
  private updateSelectedCriteria() {
    this.selectedTableCriteria = [];

    // Add investor profile criteria
    if (this.selectedInvestorProfile?.investorTypes || this.selectedInvestorProfile?.investmentFirmTypes) {
      const hasInvestorTypes = Object.values(this.selectedInvestorProfile.investorTypes || {}).some(Boolean);
      const hasInvestmentFirmTypes = Object.values(this.selectedInvestorProfile.investmentFirmTypes || {}).some(Boolean);
      if (hasInvestorTypes || hasInvestmentFirmTypes || this.selectedInvestorProfile.aum?.min || this.selectedInvestorProfile.aum?.max) {
        this.selectedTableCriteria.push("investmentFirmType");
      }
    }

    // Add investment preference criteria
    if (this.selectedInvestmentPreference?.locations || this.selectedInvestmentPreference?.sectors) {
      const hasLocations = Object.values(this.selectedInvestmentPreference.locations || {}).some(Boolean);
      const hasSectors = Object.values(this.selectedInvestmentPreference.sectors || {}).some(Boolean);
      if (hasLocations || hasSectors) {
        this.selectedTableCriteria.push("comprehensiveFilter");
      }
    }
  }

  // Filter investors data based on selections
 

  // Pagination methods
  onPageSizeChange(event: any) {
    const newPageSize = +event.target.value;
    this.pageSize = newPageSize;
    this.currentPage = 1;
    // Fetch data with new page size
    this.fetchInvestorsForCurrentPage();
  }

  onPreviousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.fetchInvestorsForCurrentPage();
    }
  }

  onNextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.fetchInvestorsForCurrentPage();
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.fetchInvestorsForCurrentPage();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.currentPage - 2);
    const end = Math.min(this.totalPages, this.currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
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

  shouldShowColumn(column: string): boolean {
    // For the new simplified table, show all columns
    return true;
  }

  getDisplayValue(investor: any, field: string): string {
    switch (field) {
      case "investorName":
        return investor.entityName || investor.companyName || "";
      case "investmentFirmType":
        return investor.invType || "";
      case "companyType":
        return investor.companyType || "";
      case "aum":
        return this.getAumDisplay(investor);
      case "geography":
        return investor.geography || "";
      case "location":
        return investor.location || "";
      case "country":
        return investor.country || "";
      case "state":
        return investor.state || "";
      case "totalInvestments":
        return investor.totalInvestments ? investor.totalInvestments.toString() : "";
      case "totalFunding":
        return investor.totalFunding ? this.formatCurrency(investor.totalFunding) : "";
      case "averageInvestment":
        return investor.averageInvestment ? this.formatCurrency(investor.averageInvestment) : "";
      case "foundedYear":
        return investor.foundedYear ? investor.foundedYear.toString() : "";
      default:
        return investor[field] || "";
    }
  }

  getColumnDisplayName(column: string): string {
    const displayMap: { [key: string]: string } = {
      investorName: "Investor Name",
      investmentFirmType: "Investment Firm Type",
      companyType: "Company Type",
      aum: "AUM",
      geography: "Geography",
      location: "Location",
      country: "Country", 
      state: "State",
      totalInvestments: "Total Investments",
      totalFunding: "Total Funding",
      averageInvestment: "Average Investment",
      foundedYear: "Founded Year"
    };
    return displayMap[column] || column;
  }

  isNumericColumn(column: string): boolean {
    const numericColumns = ["totalInvestments", "totalFunding", "averageInvestment", "foundedYear"];
    return numericColumns.includes(column);
  }

  private formatCurrency(value: number): string {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  }

  private getAumDisplay(investor: any): string {
    // Extract AUM from investmentFirmDetailsGeneral array
    if (investor.investmentFirmDetailsGeneral && investor.investmentFirmDetailsGeneral.length > 0) {
      const details = investor.investmentFirmDetailsGeneral[0];
      if (details.aum) {
        const min = details.aum.min;
        const max = details.aum.max;
        
        if (min !== null && max !== null) {
          return `$${min}M - $${max}M`;
        } else if (min !== null) {
          return `$${min}M+`;
        } else if (max !== null) {
          return `Up to $${max}M`;
        }
      }
    }
    return "N/A";
  }

  navigateToInvestorDetails(investor: any) {
    // Navigate to company profile with query parameters
    const companyId = investor.companyId || investor.company_id || investor.id;

    if (!companyId) {
      console.error("❌ No company ID found in company object:", investor);
      console.error("Available fields:", Object.keys(investor));
      return;
    }

    const url = `${window.location.origin}/company-profile?&id=${companyId}`;
    window.open(url, "_blank");
  }

  // Get paginated data for display
  getPaginatedInvestors(): any[] {
    // Since we're now doing server-side pagination, 
    // the investorsData already contains the current page's data
    return this.investorsData;
  }

  // Event handler for when criteria is expanded/collapsed
  onCriteriaExpanded(isExpanded: boolean) {
    // This can be used to show/hide the criteria selection areas
    console.log('Criteria expanded:', isExpanded);
  }

  // Event handler for when "Run Screen" is clicked in criteria component
  onRunScreenGetInvestorsClusterData(data: any) {
    console.log('Run screen clicked with data:', data);
    // This is where the filtered investor data would come from the API
    // For now, we'll use our filtered local data
    this.investorsData = data.content || this.investorsData;
    this.totalElements = data.totalElements || this.totalElements;
    this.totalPages = data.totalPages || this.totalPages;
    this.currentPage = 1;
  }

  // Event handler for dropdown criteria change
  onDropdownCriteriaChange(criteria: any) {
    console.log('Dropdown criteria changed:', criteria);
    
    // Show the investor criteria selection popup
    this.showInvestorCriteriaSelector();
    
    // Find the criteria in the category data and select it
    setTimeout(() => {
      const targetCriteria = this.findInvestorCriteriaById(this.categoryData, criteria.id);
      if (targetCriteria) {
        // Navigate to the criteria and highlight it
        this.traverseAndHighlightInvestorCriteria(targetCriteria);
      }
    }, 100);
  }

  // Event handler for criteria payload change
  onCriteriaPayloadChanged(payload: any) {
    console.log('Criteria payload changed:', payload);
    // Handle payload changes
  }

  // Event handler for run screen clicked
  onRunScreenClicked() {
    console.log('Run screen clicked');
    // Trigger filtering and search
  
  }

  // Event handler for edit criteria
  onEditCriteria(event: any) {
    console.log('Edit criteria:', event);
    // Handle criteria editing
  }

  // Event handler for criteria data changed
  onCriteriaDataChanged(data: any) {
    console.log('Criteria data changed:', data);
    // Handle criteria data changes
  }

  // Helper method to convert string to number
  toNumber(value: string): number | null {
    const num = Number(value);
    return isNaN(num) ? null : num;
  }

  // Method to fetch investor counts
  fetchInvestorCounts() {
    if (this.investorsCriteriaComponent) {
      this.investorsCriteriaComponent.fetchCounts();
    }
  }

  // Method to fetch investors for current page
  private fetchInvestorsForCurrentPage() {
    if (this.investorsCriteriaComponent) {
      // Get the current filter steps from the criteria component (aligned with rows)
      const filterSteps = this.investorsCriteriaComponent.buildFilterStepsAlignedWithRows();
      
      // Call the API with current page and page size
      this.apiService.searchInvestors(filterSteps, this.currentPage, this.pageSize).subscribe({
        next: (res) => {
          this.investorsData = res.content || [];
          this.totalElements = res.totalElements || 0;
          this.totalPages = res.totalPages || 0;
        },
        error: (err) => {
          console.error("❌ searchInvestors FAILED:", err);
          this.investorsData = [];
          this.totalElements = 0;
          this.totalPages = 0;
        },
      });
    }
  }

  // Investor criteria selection methods (same as company screening)
  fetchInvestorCategoryData() {
    this.http.get<any>("/json-data/category-fields-fh_bs_ic.json").subscribe({
      next: (data) => {
        this.categoryData = Array.isArray(data) ? data : [data];
        console.log('✅ Investor category data loaded:', this.categoryData.length, 'items');
      },
      error: (err) => {
        console.error("Error fetching investor category data:", err);
      },
    });
  }

  selectInvestorCriteria(item: any): void {
    // Only select items that have no children (leaf nodes)
    if (!item.children || item.children.length === 0) {
      this.selectedInvestorCriteria = item;
      this.resetInvestorSelections();
    }
  }

  resetInvestorSelections(): void {
    this.selectedInvestorMinValue = null;
    this.selectedInvestorMaxValue = null;
  }

  isInvestorCriteriaSelected(item: any): boolean {
    return this.selectedInvestorCriteria?.id === item.id;
  }

  onInvestorMinValueChange(value: number): void {
    this.selectedInvestorMinValue = Number(value);
  }

  onInvestorMaxValueChange(value: number): void {
    this.selectedInvestorMaxValue = Number(value);
  }

  isValidInvestorCriteriaToAdd(): boolean {
    return !!(
      this.selectedInvestorCriteria &&
      (this.selectedInvestorMinValue !== null || this.selectedInvestorMaxValue !== null)
    );
  }

  addInvestorCriteria(): void {
    if (this.isValidInvestorCriteriaToAdd()) {
      const parentFilter = this.selectedInvestorCriteria.parentFilter || 'investmentFirmDetailsFilters';
      const criteriaKey = this.selectedInvestorCriteria.key || this.selectedInvestorCriteria.id;

      // Create min/max range object similar to company screening but simpler
      const rangeValue: any = {};
      if (this.selectedInvestorMinValue !== null && this.selectedInvestorMaxValue !== null) {
        rangeValue.between = [this.selectedInvestorMinValue, this.selectedInvestorMaxValue];
      } else if (this.selectedInvestorMinValue !== null) {
        rangeValue.gte = this.selectedInvestorMinValue;
      } else if (this.selectedInvestorMaxValue !== null) {
        rangeValue.lte = this.selectedInvestorMaxValue;
      }

      const criteriaObject = {
        [parentFilter]: {
          [criteriaKey]: rangeValue
        }
      };

      this.newInvestorCriteriaToAdd = criteriaObject;
      this.addedInvestorCriteria.push(criteriaObject);
      console.log("Added investor criteria:", criteriaObject);
      console.log("All investor criteria:", this.addedInvestorCriteria);

      // Add to child criteria table and trigger counts
      if (this.investorsCriteriaComponent) {
        this.investorsCriteriaComponent.addQuantitativeCriteriaFromParent(
          { id: criteriaKey, name: this.selectedInvestorCriteria.name, key: criteriaKey, parentFilter },
          this.selectedInvestorMinValue,
          this.selectedInvestorMaxValue
        );
        // After adding, fetch counts for all rows
        this.investorsCriteriaComponent.fetchCounts();
      }

      // Reset selections
      this.selectedInvestorCriteria = null;
      this.resetInvestorSelections();
    }
  }

  removeInvestorCriteria(index: number): void {
    const criteriaObject = this.addedInvestorCriteria[index];
    if (criteriaObject && this.investorsCriteriaComponent) {
      const parentKey = this.getFirstKey(criteriaObject);
      const criteriaKey = this.getFirstKey(criteriaObject[parentKey]);
      this.investorsCriteriaComponent.removeQuantitativeCriteria(criteriaKey);
    }
    this.addedInvestorCriteria.splice(index, 1);
  }

  clearAllInvestorCriteria(): void {
    this.addedInvestorCriteria = [];
    this.selectedInvestorCriteria = null;
    this.resetInvestorSelections();
    if (this.investorsCriteriaComponent) {
      this.investorsCriteriaComponent.clearAllQuantitativeCriteria();
    }
  }

  hasInvestorChildren(item: any): boolean {
    return item.children && item.children.length > 0;
  }

  isInvestorLeafNode(item: any): boolean {
    return !item.children || item.children.length === 0;
  }

  toggleInvestorExpand(item: any): void {
    if (item.children && item.children.length > 0) {
      item.expanded = !item.expanded;
    }
  }

  // Helper methods for template operations
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj || {});
  }

  getFirstKey(obj: any): string {
    const keys = Object.keys(obj || {});
    return keys.length > 0 ? keys[0] : '';
  }

  // Helper methods for investor criteria selection popup
  showInvestorCriteriaSelector(): void {
    const selectCriteriaSection = document.getElementById('selectInvestorCriteriaSection');
    if (selectCriteriaSection) {
      selectCriteriaSection.style.display = 'block';
      selectCriteriaSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest",
      });
    }
  }

  hideInvestorCriteriaSelector(): void {
    const selectCriteriaSection = document.getElementById('selectInvestorCriteriaSection');
    if (selectCriteriaSection) {
      selectCriteriaSection.style.display = 'none';
    }
  }

  private findInvestorCriteriaById(items: any[], criteriaId: string): any | null {
    for (const item of items) {
      // Try to match by ID first
      if (item.id === criteriaId) {
        return item;
      }

      // Try to match by name (case-insensitive)
      if (item.name.toLowerCase() === criteriaId.toLowerCase()) {
        return item;
      }

      if (item.children && item.children.length > 0) {
        const found = this.findInvestorCriteriaById(item.children, criteriaId);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }

  // Helper method to check if criteria is selectable (has key)
  isSelectableCriteria(criteria: any): boolean {
    return criteria && criteria.key && !criteria.children?.length;
  }

  private traverseAndHighlightInvestorCriteria(targetCriteria: any): void {
    // First, find the path to the target criteria
    const pathToTarget = this.findPathToInvestorCriteria(
      this.categoryData,
      targetCriteria.id
    );

    if (pathToTarget && pathToTarget.length > 0) {
      // Expand all parent nodes in the path
      this.expandPathToInvestorTarget(pathToTarget);

      // Wait for DOM updates, then highlight the target
      setTimeout(() => {
        this.highlightTargetInvestorCriteria(targetCriteria.id);
        this.selectInvestorCriteria(targetCriteria);
      }, 500);
    }
  }

  private findPathToInvestorCriteria(
    items: any[],
    targetId: string,
    currentPath: any[] = []
  ): any[] | null {
    for (const item of items) {
      const newPath = [...currentPath, item];

      // If this is the target item, return the path
      if (item.id === targetId) {
        return newPath;
      }

      // If item has children, search recursively
      if (item.children && item.children.length > 0) {
        const foundPath = this.findPathToInvestorCriteria(
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

  private expandPathToInvestorTarget(pathToTarget: any[]): void {
    // Expand all items in the path except the last one (which is the target leaf node)
    for (let i = 0; i < pathToTarget.length - 1; i++) {
      const item = pathToTarget[i];
      if (item.children && item.children.length > 0) {
        item.expanded = true;
      }
    }
  }

  private highlightTargetInvestorCriteria(targetId: string): void {
    console.log("Highlighting target investor criteria with ID:", targetId);

    // Find and highlight the target element
    const targetElement = document.querySelector(
      `[data-investor-criteria-id="${targetId}"]`
    );

    if (targetElement) {
      targetElement.classList.add("highlighted-from-dropdown");

      // Scroll into view
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });

      // Remove highlight after a few seconds
      setTimeout(() => {
        targetElement.classList.remove("highlighted-from-dropdown");
      }, 3000);
    }
  }
}