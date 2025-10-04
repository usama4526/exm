import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
  ChangeDetectorRef,
  OnInit,
  OnDestroy,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { CountUpModule } from "ngx-countup";
import { Subject, debounceTime } from "rxjs";
import { ApiService } from "../../services/api.service";

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
  selector: "app-investors-criteria",
  standalone: true,
  imports: [CommonModule, FormsModule, CountUpModule],
  templateUrl: "./investors-criteria.component.html",
  styleUrl: "./investors-criteria.component.scss",
})
export class InvestorsCriteriaComponent implements OnChanges, OnInit, OnDestroy {
  http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);
  private apiService = inject(ApiService);

  constructor() {
    // Set up the subscription to handle debounced count updates
    this.countUpdateTrigger.pipe(debounceTime(300)).subscribe(() => {
      // Check if we have any criteria data to send
      const hasAnyCriteria =
        Object.keys(this.criteriaPayloadData).length > 0 ||
        this.selectedQuantitativeCriteria.length > 0 ||
        Object.keys(this.quantitativeCriteriaPayload).length > 0;

      if (hasAnyCriteria) {
        this.fetchCountForAllCriteria();
      } else {
        // Clear all counts when no criteria
        this.criteriaTableData.forEach((row) => {
          row.count = null;
        });
        this.cdr.detectChanges();
      }
    });
  }

  // Method to fetch counts for all criteria
  fetchCountForAllCriteria() {
    // Transform current data to FilterStep format, aligned with rows
    const filterSteps = this.buildFilterStepsAlignedWithRows();

    // Set loading state for all criteria with data
    this.criteriaTableData.forEach((row) => {
      if (row.display.length > 0) {
        row.count = "Loading";
      }
    });
    this.cdr.detectChanges();

    // Call the investor counts API instead of progressive counts
    this.apiService.getInvestorCounts(filterSteps).subscribe({
      next: (res: any) => {
        this.updateAllCountsFromFilterSteps(res);
      },
      error: (err) => {
        console.error("Investor counts fetch error:", err);
        this.criteriaTableData.forEach((row) => {
          if (row.display.length > 0) {
            row.count = "Error";
          }
        });
        this.cdr.detectChanges();
      },
    });
  }

  // Helper method to build FilterSteps aligned to table rows (one step per row)
  public buildFilterStepsAlignedWithRows(): any[] {
    const filterSteps: any[] = [];
    const locations = this.criteriaPayloadData["locations"] || [];
    const sectors = this.criteriaPayloadData["sectors"] || [];
    // Combine all quantitative into one map with camelCase keys
    const quantitativeCombined: { [key: string]: { min?: number; max?: number } } = {};
    Object.keys(this.quantitativeCriteriaPayload || {}).forEach((k) => {
      const camel = this.toCamelCase(k);
      quantitativeCombined[camel] = this.quantitativeCriteriaPayload[k];
    });

    // Investor profile step (if any)
    const hasInvestorProfile =
      !!this.criteriaPayloadData["investmentFirmType"] &&
      this.criteriaTableData.some(r => r.type === "Financial Investor Profile" && r.display.length > 0);
    if (hasInvestorProfile) {
      filterSteps.push({
        section: "investmentFirmDetailsGeneral",
        field: "investmentFirmType",
        operator: "in",
        value: this.criteriaPayloadData["investmentFirmType"]
      });
    }

    // Single comprehensive step including locations, sectors, and all quantitative
    if (locations.length > 0 || sectors.length > 0 || Object.keys(quantitativeCombined).length > 0) {
      filterSteps.push({
        section: "investmentFirmComprehensive",
        field: "comprehensiveFilter",
        operator: "in",
        value: {
          companyStages: [],
          locations: locations,
          sectors: sectors,
          industries: [],
          industryGroups: [],
          investmentFeatures: [],
          quantitativeCriteria: quantitativeCombined
        }
      });
    }

    return filterSteps;
  }

  // Method to update counts from API response
  private updateAllCountsFromFilterSteps(response: any) {
    // Handle both new API format and legacy format
    if (response.counts && response.counts.length > 0) {
      // New format: response.counts is an array of progressive counts
      this.updateCountsFromNewFormat(response);
    } else if (response.totalCount !== undefined && response.filterSteps) {
      // Legacy format: response has filterSteps and totalCount
      this.updateCountsFromFilterStepsFormat(response);
    } else {
      console.warn("Unknown API response format:", response);
      // Fallback: use final count for all criteria
      this.criteriaTableData.forEach((row) => {
        if (row.display.length > 0) {
          row.count = response.finalCount || response.totalCount || null;
        }
      });
    }

    this.cdr.detectChanges();
  }

  // Handle new API format (counts array)
  private updateCountsFromNewFormat(response: any) {
    const counts = response.counts || [];
    const profileCount = counts.find((c: any) => c.category === "investmentFirmType");
    const comprehensiveCount = counts.find((c: any) => c.category === "comprehensiveFilter");

    this.criteriaTableData.forEach((row) => {
      if (row.display.length === 0) { row.count = null; return; }
      if (row.type === "Financial Investor Profile") {
        row.count = profileCount ? profileCount.count : null;
      } else if (row.type === "Financial Investment Preference" || (typeof row.type === 'string' && row.type.startsWith("Quantitative:"))) {
        row.count = comprehensiveCount ? comprehensiveCount.count : null;
      } else {
        row.count = null;
      }
    });
  }

  // Handle legacy format (filterSteps with counts)
  private updateCountsFromFilterStepsFormat(response: any) {
    const steps = response.filterSteps || [];
    const profileStep = steps.find((s: any) => s.fieldName === "investmentFirmType");
    const comprehensiveStep = steps.find((s: any) => s.fieldName === "comprehensiveFilter");

    this.criteriaTableData.forEach((row) => {
      if (row.display.length === 0) { row.count = null; return; }
      if (row.type === "Financial Investor Profile") {
        row.count = profileStep ? profileStep.count : null;
      } else if (row.type === "Financial Investment Preference" || (typeof row.type === 'string' && row.type.startsWith("Quantitative:"))) {
        row.count = comprehensiveStep ? comprehensiveStep.count : null;
      } else {
        row.count = null;
      }
    });
  }

  @Output() clearSelection = new EventEmitter<string>();
  @Output() openCriteriaSelector = new EventEmitter<string>();
  @Output() investorsClusterData = new EventEmitter<any>();
  @Output() criteriaExpanded = new EventEmitter<boolean>();
  @Output() runScreenClicked = new EventEmitter<void>();
  @Output() changedDropdownCriteria = new EventEmitter<any>();

  // Input properties for the new investor criteria types
  // These will be handled internally through the new data structures

  // Criteria table data for the 3 investor criteria types
  criteriaTableData: any[] = [];

  // Track the selection order of criteria
  private selectionOrder: string[] = [];

  // Store the actual payload data for API calls
  criteriaPayloadData: { [key: string]: any } = {};

  // Input properties for the new investor criteria types
  @Input() selectedInvestorProfile!: any;
  @Input() selectedInvestmentPreference!: any;
  
  // Input properties for options from parent
  @Input() investorTypeOptions: any[] = [];
  @Input() investmentFirmTypeOptions: any[] = [];
  @Input() locationOptions: any[] = [];
  @Input() sectorOptions: any[] = [];

  // Add a subject to trigger count update with debounce
  private countUpdateTrigger = new Subject<void>();

  // Search functionality properties
  searchText: string = '';
  isDropdownOpen: boolean = false;
  filteredCriteria: any[] = [];
  highlightedIndex: number = -1;
  selectedDropdownCriteria: any = null;

  // Additional properties needed for template compatibility
  minimalSelectedLocation: string[] = [];
  minimalSelectedSector: string[] = [];

  // Dropdown functionality properties
  @Input() dropdownAllCriteria: any[] = [];
  selectedInvestorCriteria: any | null = null;
  searchTextInvestor: string = '';
  isInvestorDropdownOpen: boolean = false;
  filteredInvestorCriteria: any[] = [];
  flattenedInvestorCriteria: any[] = [];
  highlightedInvestorIndex: number = -1;
  selectedDropdownInvestorCriteria: any = null;

  // Quantitative criteria properties
  selectedQuantitativeCriteria: any[] = [];
  quantitativeCriteriaPayload: { [key: string]: { min?: number; max?: number } } = {};

  // Define which criteria are manual (won't be fully deleted)
  private readonly MANUAL_CRITERIA = ["Financial Investor Profile", "Financial Investment Preference"];

  // Define the fixed positions for mandatory criteria
  private readonly FIXED_POSITIONS = {
    "Financial Investor Profile": 0,
    "Financial Investment Preference": 1,
  };

  ngOnInit(): void {
    // Initialize manual criteria objects in fixed positions
    this.criteriaTableData = [
      {
        count: null,
        display: [],
        type: "Financial Investor Profile",
        isManual: true,
        isFixed: true,
        fixedPosition: 0,
      },
      {
        count: null,
        display: [],
        type: "Financial Investment Preference",
        isManual: true,
        isFixed: true,
        fixedPosition: 1,
      },
    ];

    // Initialize selection order with fixed criteria in their predefined positions
    this.selectionOrder = Object.keys(this.FIXED_POSITIONS).sort(
      (a, b) =>
        this.FIXED_POSITIONS[a as keyof typeof this.FIXED_POSITIONS] -
        this.FIXED_POSITIONS[b as keyof typeof this.FIXED_POSITIONS]
    );

    // Process criteria data if available
    this.processInvestorCriteriaData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle dropdownAllCriteria input changes
    if (changes["dropdownAllCriteria"]) {
      this.processInvestorCriteriaData();
    }
    
    let criteriaChanged = false;

    criteriaChanged =
      this.updateCriteria("Financial Investor Profile", () => {
        if (!this.selectedInvestorProfile) return null;

        const display = this.getInvestorProfileDisplay();
        if (!display.length) return null;

        const payload = {
          investmentFirmType: this.getInvestorProfilePayload()
        };
        return {
          display,
          payload,
          keys: ["investmentFirmType"],
        };
      }) || criteriaChanged;

    criteriaChanged =
      this.updateCriteria("Financial Investment Preference", () => {
        if (!this.selectedInvestmentPreference) return null;

        const display = this.getInvestmentPreferenceDisplay();
        if (!display.length) return null;

        const payload = {
          locations: this.getLocationPayload(),
          sectors: this.getSectorPayload()
        };
        return {
          display,
          payload,
          keys: ["locations", "sectors"],
        };
      }) || criteriaChanged;

    // Only trigger the count update if criteria actually changed
    if (criteriaChanged) {
      // Trigger the count update
      this.countUpdateTrigger.next();
    }
  }

  // Helper methods for Financial Investor Profile
  getInvestorProfileDisplay(): string[] {
    const display: string[] = [];
    
    if (!this.selectedInvestorProfile) return display;
    
    // Add investor types - now using labels directly
    const selectedInvestorTypes = this.getSelectedValues(this.selectedInvestorProfile.investorTypes);
    
    if (selectedInvestorTypes.length > 0) {
      display.push(`Investor Type: ${selectedInvestorTypes.join(', ')}`);
    }
    
    // Add investment firm types - now using labels directly
    const selectedFirmTypes = this.getSelectedValues(this.selectedInvestorProfile.investmentFirmTypes);
    
    if (selectedFirmTypes.length > 0) {
      display.push(`Firm Types: ${selectedFirmTypes.join(', ')}`);
    }
    
    // Add AUM range
    if (this.selectedInvestorProfile.aum?.min !== null || this.selectedInvestorProfile.aum?.max !== null) {
      const min = this.selectedInvestorProfile.aum?.min || 0;
      const max = this.selectedInvestorProfile.aum?.max || '∞';
      display.push(`AUM: $${min}M - $${max}M`);
    }
    
    return display;
  }

  getInvestorProfilePayload(): any {
    if (!this.selectedInvestorProfile) return { name: [], investorType: [], aum: {} };

    // Get selected investor types and expand them to include fund types
    const selectedInvestorTypes = this.getSelectedValues(this.selectedInvestorProfile.investorTypes);
    const expandedInvestorTypes = this.expandInvestorTypes(selectedInvestorTypes);
    
    const investmentFirmTypes = this.getSelectedValues(this.selectedInvestorProfile.investmentFirmTypes);

    // AUM should be an object with min and max properties
    const aumObject: { min?: number; max?: number } = {};
    if (this.selectedInvestorProfile.aum?.min !== null) {
      aumObject.min = this.selectedInvestorProfile.aum.min;
    }
    if (this.selectedInvestorProfile.aum?.max !== null) {
      aumObject.max = this.selectedInvestorProfile.aum.max;
    }

    return {
      name: investmentFirmTypes, // Investment firm types
      investorType: expandedInvestorTypes, // Investor types (expanded to include fund types)
      aum: aumObject
    };
  }

  // Helper methods for Financial Investment Preference
  getInvestmentPreferenceDisplay(): string[] {
    const display: string[] = [];
    
    if (!this.selectedInvestmentPreference) return display;
    
    // Add locations - now using labels directly
    const selectedLocations = this.getSelectedValues(this.selectedInvestmentPreference.locations);
    
    if (selectedLocations.length > 0) {
      display.push(`Locations: ${selectedLocations.join(', ')}`);
    }
    
    // Add sectors - now using labels directly
    const selectedSectors = this.getSelectedValues(this.selectedInvestmentPreference.sectors);
    
    if (selectedSectors.length > 0) {
      display.push(`Sectors: ${selectedSectors.join(', ')}`);
    }
    
    return display;
  }

  getLocationPayload(): string[] {
    if (!this.selectedInvestmentPreference) return [];
    
    // Now using labels directly - no mapping needed
    return this.getSelectedValues(this.selectedInvestmentPreference.locations);
  }

  getSectorPayload(): string[] {
    if (!this.selectedInvestmentPreference) return [];
    
    // Now using labels directly - no mapping needed
    return this.getSelectedValues(this.selectedInvestmentPreference.sectors);
  }

  // Generic helper method to get selected values from object
  private getSelectedValues(obj: any): string[] {
    const selectedValues: string[] = [];
    if (!obj) return selectedValues;
    
    Object.keys(obj).forEach(key => {
      if (obj[key]) {
        selectedValues.push(key); // Now using the key directly as it's the label
      }
    });
    
    return selectedValues;
  }

  // Helper method to expand investor types to include fund types
  private expandInvestorTypes(selectedTypes: string[]): string[] {
    const expandedTypes: string[] = [];
    
    selectedTypes.forEach(type => {
      if (type === 'Private Company') {
        expandedTypes.push('Private Company', 'Private Fund');
      } else if (type === 'Public Company') {
        expandedTypes.push('Public Company', 'Public Fund');
      } else if (type === 'Other') {
        // When "Other" is selected, include all the other organization types
        expandedTypes.push(
          'Other',
          'U.S. Statutory Insurance Group',
          'Government Institution',
          'Foundation or Charitable Institution',
          'Labor Union',
          'Trade Association',
          'Educational Institution',
          'Arts Institution',
          'Religious Institution'
        );
      } else {
        // For any other types, just add them as-is
        expandedTypes.push(type);
      }
    });
    
    return expandedTypes;
  }

  updateCriteria(
    type: string,
    getData: () => {
      display: string[];
      payload: { [key: string]: any };
      keys: string[];
    } | null
  ): boolean {
    const result = getData();
    const hasData = !!result;
    let criteriaChanged = false;
    const isManual = this.MANUAL_CRITERIA.includes(type);
    const isFixed = this.FIXED_POSITIONS.hasOwnProperty(type);

    if (!hasData) {
      if (isManual) {
        // For manual criteria, just clear display and count but keep the object
        const existingRow = this.criteriaTableData.find((r) => r.type === type);
        if (
          existingRow &&
          (existingRow.display.length > 0 || existingRow.count !== null)
        ) {
          existingRow.display = [];
          existingRow.count = null;
          criteriaChanged = true;

          // Remove from selection order only if not fixed
          if (!isFixed) {
            const orderIndex = this.selectionOrder.indexOf(type);
            if (orderIndex > -1) {
              this.selectionOrder.splice(orderIndex, 1);
            }
          }

          // Re-sort to maintain proper order
          this.sortCriteriaData();
        }
      } else {
        // For non-manual criteria, remove completely
        if (this.criteriaTableData.some((r) => r.type === type)) {
          criteriaChanged = true;
        }
        this.criteriaTableData = this.criteriaTableData.filter(
          (r) => r.type !== type
        );

        // Remove from selection order
        const orderIndex = this.selectionOrder.indexOf(type);
        if (orderIndex > -1) {
          this.selectionOrder.splice(orderIndex, 1);
        }
      }

      return criteriaChanged;
    }

    const { display, payload, keys } = result;

    // Check if the payload actually changed
    let payloadChanged = false;
    for (const key of keys) {
      const oldValue = JSON.stringify(this.criteriaPayloadData[key]);
      const newValue = JSON.stringify(payload[key]);
      if (oldValue !== newValue) {
        payloadChanged = true;
        this.criteriaPayloadData[key] = payload[key];
      }
    }

    const existingRow = this.criteriaTableData.find((r) => r.type === type);

    if (!payloadChanged && existingRow && existingRow.display.length > 0) {
      // If nothing changed and we already have data, don't update anything
      return false;
    }

    criteriaChanged = true;

    // Add to selection order if not already there
    if (!this.selectionOrder.includes(type)) {
      if (isFixed) {
        // Fixed criteria should maintain their predefined positions
        // Don't add to selection order - they're handled by fixedPosition
      } else {
        // Dynamic criteria should be added at the end
        this.selectionOrder.push(type);
      }
    }

    const rowData = {
      type,
      display,
      count: "Loading", // Placeholder until we get the actual count
      isManual,
      isFixed,
      fixedPosition: isFixed
        ? this.FIXED_POSITIONS[type as keyof typeof this.FIXED_POSITIONS]
        : undefined,
    };

    if (existingRow) {
      // Preserve the count if it exists and is not a placeholder
      if (existingRow.count && existingRow.count !== "...") {
        rowData.count = existingRow.count;
      }
      // Update existing row
      Object.assign(existingRow, rowData);
    } else {
      // Add new row (for non-manual criteria)
      this.criteriaTableData.push(rowData);
    }

    // Sort the criteria data to maintain proper order
    this.sortCriteriaData();

    return criteriaChanged;
  }

  private sortCriteriaData(): void {
    this.criteriaTableData.sort((a, b) => {
      // Fixed criteria always stay in their positions
      if (a.isFixed && b.isFixed) {
        return (a.fixedPosition || 0) - (b.fixedPosition || 0);
      }

      if (a.isFixed) return -1;
      if (b.isFixed) return 1;

      // For dynamic criteria, sort by their dynamic position
      const aOrder = this.selectionOrder.indexOf(a.type);
      const bOrder = this.selectionOrder.indexOf(b.type);

      // If both have data (are in selection order), sort by selection order
      if (aOrder !== -1 && bOrder !== -1) {
        return aOrder - bOrder;
      }

      // If only one has data, the one with data comes first
      if (aOrder !== -1 && bOrder === -1) return -1;
      if (aOrder === -1 && bOrder !== -1) return 1;

      // If neither has data, maintain original order
      return 0;
    });
  }

  // Get only the rows that have data (for arrow visibility logic)
  get visibleRows(): any[] {
    return this.criteriaTableData.filter((row) => row.display.length > 0);
  }

  // Get only the dynamic rows that have data (for arrow logic)
  get visibleDynamicRows(): any[] {
    return this.criteriaTableData.filter(
      (row) => row.display.length > 0 && !row.isFixed
    );
  }

  // Check if up arrow should be visible
  canMoveUp(index: number): boolean {
    const currentRow = this.criteriaTableData[index];

    // Fixed criteria cannot be moved
    if (currentRow.isFixed) {
      return false;
    }

    // Only show arrows if there are at least 2 dynamic criteria
    if (this.visibleDynamicRows.length < 2) {
      return false;
    }

    const visibleDynamicRows = this.visibleDynamicRows;
    const visibleIndex = visibleDynamicRows.findIndex(
      (row) => row.type === currentRow.type
    );

    // Can move up if not the first dynamic criteria
    return visibleIndex > 0 && currentRow.display.length > 0;
  }

  // Check if down arrow should be visible
  canMoveDown(index: number): boolean {
    const currentRow = this.criteriaTableData[index];

    // Fixed criteria cannot be moved
    if (currentRow.isFixed) {
      return false;
    }

    // Only show arrows if there are at least 2 dynamic criteria
    if (this.visibleDynamicRows.length < 2) {
      return false;
    }

    const visibleDynamicRows = this.visibleDynamicRows;
    const visibleIndex = visibleDynamicRows.findIndex(
      (row) => row.type === currentRow.type
    );

    // Can move down if not the last dynamic criteria
    return (
      visibleIndex < visibleDynamicRows.length - 1 &&
      visibleIndex !== -1 &&
      currentRow.display.length > 0
    );
  }

  // Move row up
  moveRowUp(index: number): void {
    const currentRow = this.criteriaTableData[index];
    if (!this.canMoveUp(index)) return;

    // Find the current position in selection order
    const currentOrderIndex = this.selectionOrder.indexOf(currentRow.type);
    if (currentOrderIndex > 0) {
      // Find the previous dynamic criteria in selection order
      let previousIndex = currentOrderIndex - 1;
      while (previousIndex >= 0) {
        const previousType = this.selectionOrder[previousIndex];
        const previousRow = this.criteriaTableData.find(
          (r) => r.type === previousType
        );

        // Skip fixed criteria when moving up
        if (previousRow && !previousRow.isFixed) {
          // Swap with the previous dynamic criteria in selection order
          [
            this.selectionOrder[currentOrderIndex],
            this.selectionOrder[previousIndex],
          ] = [
            this.selectionOrder[previousIndex],
            this.selectionOrder[currentOrderIndex],
          ];

          // Re-sort the table data
          this.sortCriteriaData();
          break;
        }
        previousIndex--;
      }
    }
  }

  // Move row down
  moveRowDown(index: number): void {
    const currentRow = this.criteriaTableData[index];
    if (!this.canMoveDown(index)) return;

    // Find the current position in selection order
    const currentOrderIndex = this.selectionOrder.indexOf(currentRow.type);
    if (
      currentOrderIndex < this.selectionOrder.length - 1 &&
      currentOrderIndex !== -1
    ) {
      // Find the next dynamic criteria in selection order
      let nextIndex = currentOrderIndex + 1;
      while (nextIndex < this.selectionOrder.length) {
        const nextType = this.selectionOrder[nextIndex];
        const nextRow = this.criteriaTableData.find((r) => r.type === nextType);

        // Skip fixed criteria when moving down
        if (nextRow && !nextRow.isFixed) {
          // Swap with the next dynamic criteria in selection order
          [
            this.selectionOrder[currentOrderIndex],
            this.selectionOrder[nextIndex],
          ] = [
            this.selectionOrder[nextIndex],
            this.selectionOrder[currentOrderIndex],
          ];

          // Re-sort the table data
          this.sortCriteriaData();
          break;
        }
        nextIndex++;
      }
    }
  }

  deleteRow(table: any) {
    const type = table.type;
    const isManual = this.MANUAL_CRITERIA.includes(type);
    const isFixed = this.FIXED_POSITIONS.hasOwnProperty(type);

    if (isManual) {
      // For manual criteria, clear display and count
      table.display = [];
      table.count = null;

      // Remove from selection order only if not fixed
      if (!isFixed) {
        const orderIndex = this.selectionOrder.indexOf(type);
        if (orderIndex > -1) {
          this.selectionOrder.splice(orderIndex, 1);
        }
      }
    } else if (typeof type === 'string' && type.startsWith("Quantitative:")) {
      // For quantitative rows, remove the specific criterion
      const criteriaId = table.criteriaId;
      if (criteriaId) {
        this.selectedQuantitativeCriteria = this.selectedQuantitativeCriteria.filter(c => c.id !== criteriaId);
        delete this.quantitativeCriteriaPayload[criteriaId];
      }
      this.criteriaTableData = this.criteriaTableData.filter((r) => r !== table);

      // Trigger counts update after removal
      this.countUpdateTrigger.next();
    } else {
      // For non-manual criteria, remove completely
      this.criteriaTableData = this.criteriaTableData.filter(
        (r) => r.type !== type
      );

      // Remove from selection order
      const orderIndex = this.selectionOrder.indexOf(type);
      if (orderIndex > -1) {
        this.selectionOrder.splice(orderIndex, 1);
      }
    }

    // Re-sort to maintain proper order
    this.sortCriteriaData();

    // Remove payload keys for the deleted criteria
    this.removePayloadKeys(type);

    // Tell parent to clear original selection
    this.clearSelection.emit(type);

    // Update counts with the modified payload (manual or other deletions)
    if (!type.startsWith("Quantitative:")) {
      this.countUpdateTrigger.next();
    }
  }

  // Helper method to remove payload keys when criteria are deleted
  private removePayloadKeys(type: string): void {
    if (type === "Financial Investor Profile") {
      delete this.criteriaPayloadData["investmentFirmType"];
    } else if (type === "Financial Investment Preference") {
      delete this.criteriaPayloadData["locations"];
      delete this.criteriaPayloadData["sectors"];
    }
  }

  showCriteria(type: string, table?: any) {
    // This is a legacy criteria, use the original behavior
    this.openCriteriaSelector.emit(type);
  }



  // Method to manually trigger criteria update
  triggerCriteriaUpdate() {
    let criteriaChanged = false;

    criteriaChanged =
      this.updateCriteria("Financial Investor Profile", () => {
        if (!this.selectedInvestorProfile) return null;

        const display = this.getInvestorProfileDisplay();
        if (!display.length) return null;

        const payload = {
          investmentFirmType: this.getInvestorProfilePayload()
        };
        return {
          display,
          payload,
          keys: ["investmentFirmType"],
        };
      }) || criteriaChanged;

    criteriaChanged =
      this.updateCriteria("Financial Investment Preference", () => {
        if (!this.selectedInvestmentPreference) return null;

        const display = this.getInvestmentPreferenceDisplay();
        if (!display.length) return null;

        const payload = {
          locations: this.getLocationPayload(),
          sectors: this.getSectorPayload()
        };
        return {
          display,
          payload,
          keys: ["locations", "sectors"],
        };
      }) || criteriaChanged;

    // Only trigger the count update if criteria actually changed
    if (criteriaChanged) {
      // Trigger the count update
      this.countUpdateTrigger.next();
    }
  }

  // Search functionality methods
  onSearchInput(event: any) {
    this.searchText = event.target.value;
    this.filterCriteria();
  }

  onSearchFocus() {
    this.isDropdownOpen = true;
    this.filterCriteria();
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.isDropdownOpen) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.highlightedIndex = Math.min(this.highlightedIndex + 1, this.filteredCriteria.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.highlightedIndex >= 0 && this.highlightedIndex < this.filteredCriteria.length) {
          this.selectDropdownCriteria(this.filteredCriteria[this.highlightedIndex]);
        }
        break;
      case 'Escape':
        this.isDropdownOpen = false;
        this.highlightedIndex = -1;
        break;
    }
  }

  clearDropdownSearch() {
    this.searchText = '';
    this.isDropdownOpen = false;
    this.filteredCriteria = [];
    this.highlightedIndex = -1;
  }

  filterCriteria() {
    if (!this.searchText.trim()) {
      this.filteredCriteria = [];
      return;
    }

    // For now, return empty array since we don't have additional criteria to search
    // This can be extended later if needed
    this.filteredCriteria = [];
  }

  selectDropdownCriteria(criteria: any) {
    this.selectedDropdownCriteria = criteria;
    this.searchText = criteria.name;
    this.isDropdownOpen = false;
    this.highlightedIndex = -1;
  }

  // Method to manually trigger count fetching
  fetchCounts() {
    this.countUpdateTrigger.next();
  }

  // Method to get investors cluster data
  getInvestorsCluster() {
    // Emit the run screen clicked event
    this.runScreenClicked.emit();
    
    // Build FilterSteps for the API
    const filterSteps = this.buildFilterStepsAlignedWithRows();

    // Log the filter steps for debugging
    console.log("🔍 DEBUG: Filter steps being sent to investors API:", filterSteps);

    // Call the investors search API
    this.apiService.searchInvestors(filterSteps, 1, 10).subscribe({
      next: (res) => {
        this.investorsClusterData.emit(res);
      },
      error: (err) => {
        console.error("❌ searchInvestors FAILED:", err);
        const emptyData = {
          content: [],
          totalElements: 0,
          totalPages: 0,
        };
        this.investorsClusterData.emit(emptyData);
      },
    });
  }

  toggleCriteriaExpanded() {
    // This will be implemented later when we add the expand/collapse functionality
    this.criteriaExpanded.emit(true);
  }


  processInvestorCriteriaData() {
    if (this.dropdownAllCriteria && this.dropdownAllCriteria.length > 0) {
      this.flattenedInvestorCriteria = [];
      this.flattenInvestorData(this.dropdownAllCriteria, "");
      this.filteredInvestorCriteria = [...this.flattenedInvestorCriteria];
      console.log('Processed investor criteria:', this.flattenedInvestorCriteria.length, 'items');
      console.log('Sample criteria:', this.flattenedInvestorCriteria.slice(0, 5));
    }
  }

  flattenInvestorData(items: any[], parentPath: string = "", parentFilter?: string) {
    items.forEach((item) => {
      const currentPath = parentPath
        ? `${parentPath} > ${item.name}`
        : item.name;

      // Determine parent filter based on the structure
      let currentParentFilter = item.parentFilter || parentFilter;
      
      // For financial data structure, assign parent filters based on common patterns
      if (!currentParentFilter) {
        const nameLower = item.name.toLowerCase();
        if (nameLower.includes('balance sheet') || nameLower.includes('assets') || nameLower.includes('liabilities')) {
          currentParentFilter = 'balanceSheetAssetsFilters';
        } else if (nameLower.includes('income') || nameLower.includes('revenue') || nameLower.includes('earnings')) {
          currentParentFilter = 'incomeStatementFilters';
        } else if (nameLower.includes('cash flow') || nameLower.includes('cash')) {
          currentParentFilter = 'cashFlowFilters';
        } else if (nameLower.includes('ratio') || nameLower.includes('financial')) {
          currentParentFilter = 'financialRatiosFilters';
        } else {
          // Default fallback
          currentParentFilter = 'investmentFirmDetailsFilters';
        }
      }

      // If item has children, recursively flatten them
      if (item.children && item.children.length > 0) {
        this.flattenInvestorData(
          item.children,
          currentPath,
          currentParentFilter
        );
      } else if (item.key) {
        // This is a leaf node with a key (actual criteria), add it to flattened criteria
        this.flattenedInvestorCriteria.push({
          id: item.id,
          name: item.name,
          fullPath: currentPath,
          parentFilter: currentParentFilter,
          key: item.key,
          parameters: item.parameters || [],
          yearType: item.yearType || [],
          fiscalYear: item.fiscalYear || [],
          fiscalQuarter: item.fiscalQuarter || []
        });
      }
    });
  }

  // Investor dropdown search methods
  onInvestorSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTextInvestor = target.value;
    this.filterInvestorCriteria();
    this.isInvestorDropdownOpen = this.searchTextInvestor.length > 0;
    this.highlightedInvestorIndex = -1;
  }

  onInvestorSearchFocus() {
    if (this.searchTextInvestor.length > 0) {
      this.isInvestorDropdownOpen = true;
    }
  }

  filterInvestorCriteria() {
    if (!this.searchTextInvestor.trim()) {
      this.filteredInvestorCriteria = [...this.flattenedInvestorCriteria];
    } else {
      const searchLower = this.searchTextInvestor.toLowerCase();
      this.filteredInvestorCriteria = this.flattenedInvestorCriteria.filter((criteria) =>
        criteria.name.toLowerCase().includes(searchLower) ||
        criteria.fullPath.toLowerCase().includes(searchLower) ||
        (criteria.key && criteria.key.toLowerCase().includes(searchLower))
      );
    }
  }

  selectInvestorDropdownCriteria(criteria: any) {
    this.selectedDropdownInvestorCriteria = criteria;
    this.searchTextInvestor = criteria.name;
    this.isInvestorDropdownOpen = false;
    this.highlightedInvestorIndex = -1;
    this.clearInvestorDropdownSearch();
    
    // Emit the criteria selection for parent component to handle
    this.changedDropdownCriteria.emit(criteria);
  }

  onInvestorKeyDown(event: KeyboardEvent) {
    if (!this.isInvestorDropdownOpen) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        this.isInvestorDropdownOpen = true;
        event.preventDefault();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this.highlightedInvestorIndex = Math.min(
          this.highlightedInvestorIndex + 1,
          this.filteredInvestorCriteria.length - 1
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        this.highlightedInvestorIndex = Math.max(this.highlightedInvestorIndex - 1, -1);
        break;
      case "Enter":
        event.preventDefault();
        if (
          this.highlightedInvestorIndex >= 0 &&
          this.highlightedInvestorIndex < this.filteredInvestorCriteria.length
        ) {
          this.selectInvestorDropdownCriteria(
            this.filteredInvestorCriteria[this.highlightedInvestorIndex]
          );
        }
        break;
      case "Escape":
        this.isInvestorDropdownOpen = false;
        this.highlightedInvestorIndex = -1;
        break;
    }
  }

  clearInvestorDropdownSearch() {
    this.searchTextInvestor = "";
    this.selectedDropdownInvestorCriteria = null;
    this.filteredInvestorCriteria = [...this.flattenedInvestorCriteria];
    this.isInvestorDropdownOpen = false;
    this.highlightedInvestorIndex = -1;
  }

  // Quantitative criteria methods
  addQuantitativeCriteria(criteria: any) {
    // Check if criteria already exists
    const existingIndex = this.selectedQuantitativeCriteria.findIndex(c => c.id === criteria.id);
    
    if (existingIndex === -1) {
      // Add new criteria
      this.selectedQuantitativeCriteria.push({
        ...criteria,
        minValue: null,
        maxValue: null
      });
      
      // Update the criteria table display
      this.updateQuantitativeCriteriaTable();
    }
  }

  removeQuantitativeCriteria(criteriaId: string) {
    const removed = this.selectedQuantitativeCriteria.find(c => c.id === criteriaId);
    const apiKey = this.toCamelCase(removed?.key || criteriaId);
    this.selectedQuantitativeCriteria = this.selectedQuantitativeCriteria.filter(c => c.id !== criteriaId);
    delete this.quantitativeCriteriaPayload[apiKey];
    this.updateQuantitativeCriteriaTable();
    // Trigger counts update since payload changed
    this.countUpdateTrigger.next();
  }

  updateQuantitativeCriteriaTable() {
    // Remove any existing quantitative rows
    this.criteriaTableData = this.criteriaTableData.filter(row => !row.type.startsWith("Quantitative:"));

    // Add one row per quantitative criterion
    this.selectedQuantitativeCriteria.forEach((criteria) => {
      this.criteriaTableData.push({
        count: null,
        display: [{
          id: criteria.id,
          name: criteria.name,
          key: criteria.key,
          minValue: criteria.minValue,
          maxValue: criteria.maxValue,
          parentFilter: criteria.parentFilter
        }],
        type: criteria.name,
        criteriaId: criteria.id,
        isQuantitative: true,
        isManual: false,
        isFixed: false
      });
    });

    this.sortCriteriaData();
  }

  updateQuantitativeCriteriaValues(criteriaId: string, minValue: number | null, maxValue: number | null) {
    const criteria = this.selectedQuantitativeCriteria.find(c => c.id === criteriaId);
    if (criteria) {
      criteria.minValue = minValue;
      criteria.maxValue = maxValue;
      
      // Update payload
      const apiKey = this.toCamelCase(criteria.key || criteriaId);
      if (minValue !== null || maxValue !== null) {
        this.quantitativeCriteriaPayload[apiKey] = {
          min: minValue ?? undefined,
          max: maxValue ?? undefined
        };
      } else {
        delete this.quantitativeCriteriaPayload[apiKey];
      }
      
      this.updateQuantitativeCriteriaTable();
      // Trigger counts update since payload changed
      this.countUpdateTrigger.next();
    }
  }

  // Method to open criteria editing popup
  editQuantitativeCriteria(criteria: any) {
    // Editing popup removed per requirements
  }

  // Properties for criteria editing popup
  editingCriteria: any = null;
  editingMinValue: number | null = null;
  editingMaxValue: number | null = null;
  showCriteriaEditPopup: boolean = false;

  // Method to save criteria values
  saveCriteriaValues() {
    // Removed
  }

  // Method to close criteria editing popup
  closeCriteriaEditPopup() {
    // Removed
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions or resources
    if (this.countUpdateTrigger) {
      this.countUpdateTrigger.complete();
    }
  }

  // ===== New public methods for parent integration =====
  // Add a quantitative criteria from parent (upon explicit "Add Criteria")
  addQuantitativeCriteriaFromParent(criteria: any, minValue: number | null, maxValue: number | null) {
    if (!criteria || !criteria.id) return;

    const existingIndex = this.selectedQuantitativeCriteria.findIndex(c => c.id === criteria.id);
    if (existingIndex === -1) {
      this.selectedQuantitativeCriteria.push({
        ...criteria,
        minValue: minValue ?? null,
        maxValue: maxValue ?? null
      });
    } else {
      this.selectedQuantitativeCriteria[existingIndex].minValue = minValue ?? null;
      this.selectedQuantitativeCriteria[existingIndex].maxValue = maxValue ?? null;
    }

    // Update payload
    const apiKey = this.toCamelCase(criteria.key || criteria.id);
    if (minValue !== null || maxValue !== null) {
      this.quantitativeCriteriaPayload[apiKey] = {
        min: minValue ?? undefined,
        max: maxValue ?? undefined
      };
    } else {
      // Keep the criteria but without constraints
      this.quantitativeCriteriaPayload[apiKey] = {} as any;
    }

    // Reflect in table and trigger counts
    this.updateQuantitativeCriteriaTable();
    this.countUpdateTrigger.next();
  }

  // Fetch counts including a temporary quantitative criterion without altering table
  fetchCountsWithTemporaryQuantitative(criteriaId: string, minValue: number | null, maxValue: number | null) {
    const tempQuantitative: { [key: string]: { min?: number; max?: number } } = { ...this.quantitativeCriteriaPayload };

    if (criteriaId) {
      if (minValue !== null || maxValue !== null) {
        tempQuantitative[criteriaId] = {
          min: minValue ?? undefined,
          max: maxValue ?? undefined
        };
      } else {
        tempQuantitative[criteriaId] = {} as any;
      }
    }

    // Build steps with overridden quantitative and fetch counts
    const filterSteps = this.buildFilterStepsWithQuantitative(tempQuantitative);

    // Set loading states where applicable
    this.criteriaTableData.forEach((row) => {
      if (row.display.length > 0) {
        row.count = "Loading";
      }
    });
    this.cdr.detectChanges();

    this.apiService.getInvestorCounts(filterSteps).subscribe({
      next: (res: any) => this.updateAllCountsFromFilterSteps(res),
      error: (err) => {
        console.error("Investor counts fetch error:", err);
        this.criteriaTableData.forEach((row) => {
          if (row.display.length > 0) {
            row.count = "Error";
          }
        });
        this.cdr.detectChanges();
      }
    });
  }

  // Helper to build filter steps with provided quantitative payload
  private buildFilterStepsWithQuantitative(quantitative: { [key: string]: { min?: number; max?: number } }): any[] {
    const filterSteps: any[] = [];
    // Convert keys to camelCase for API
    const quantitativeCamel: { [key: string]: { min?: number; max?: number } } = {};
    Object.keys(quantitative).forEach((k) => {
      const camel = this.toCamelCase(k);
      quantitativeCamel[camel] = quantitative[k];
    });

    // Add investor profile if present
    if (this.criteriaPayloadData["investmentFirmType"]) {
      filterSteps.push({
        section: "investmentFirmDetailsGeneral",
        field: "investmentFirmType",
        operator: "in",
        value: this.criteriaPayloadData["investmentFirmType"]
      });
    }

    // Always include comprehensive step if we have locations/sectors/quantitative
    const locations = this.criteriaPayloadData["locations"] || [];
    const sectors = this.criteriaPayloadData["sectors"] || [];
    if (locations.length > 0 || sectors.length > 0 || Object.keys(quantitativeCamel).length > 0) {
      filterSteps.push({
        section: "investmentFirmComprehensive",
        field: "comprehensiveFilter",
        operator: "in",
        value: {
          companyStages: [],
          locations: locations,
          sectors: sectors,
          industries: [],
          industryGroups: [],
          investmentFeatures: [],
          quantitativeCriteria: quantitativeCamel
        }
      });
    }

    return filterSteps;
  }

  // Convert snake_case or kebab-case to camelCase
  private toCamelCase(input: string): string {
    if (!input) return input;
    return input.replace(/[\-_]([a-zA-Z0-9])/g, (_, c: string) => c.toUpperCase());
  }

  // Clear all quantitative criteria (used by parent Clear All)
  clearAllQuantitativeCriteria() {
    this.selectedQuantitativeCriteria = [];
    this.quantitativeCriteriaPayload = {};
    this.updateQuantitativeCriteriaTable();
    this.countUpdateTrigger.next();
  }
}
