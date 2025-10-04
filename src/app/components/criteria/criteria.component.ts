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
  ViewChild,
  ElementRef,
  HostListener,
  OnDestroy,
} from "@angular/core";
import { ApiService } from "../../services/api.service";
import { PayloadTransformationService } from "../../services/payload-transformation.service";
import { Subject, debounceTime } from "rxjs";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { CountUpModule } from "ngx-countup";
import {
  FilterStep,
  FilterResponseDto,
  ProgressiveCountsResponse,
} from "../../models/filter-interfaces";

@Component({
  selector: "criteria",
  standalone: true,
  imports: [CommonModule, FormsModule, CountUpModule],
  templateUrl: "./criteria.component.html",
  styleUrl: "./criteria.component.scss",
})
export class CriteriaComponent implements OnChanges, OnInit, OnDestroy {
  isCriteriaExpanded: boolean = true;
  _apiService = inject(ApiService);
  _transformationService = inject(PayloadTransformationService);
  http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  @Output() clearSelection = new EventEmitter<string>();
  @Output() openCriteriaSelector = new EventEmitter<string>();
  @Output() companiesClusterData = new EventEmitter<any[]>();
  @Input() selectedSector!: {
    GICS_PRIMARY_INDUSTRY?: string[];
  };
  @Output() changedDropdownCriteria = new EventEmitter<any>();
  @Output() criteriaPayloadChanged = new EventEmitter<{
    criteriaPayloadData: { [key: string]: any };
    newCriteriaPayloadData: { [key: string]: any };
  }>();
  @Output() runScreenClicked = new EventEmitter<void>();
  @Output() criteriaExpanded = new EventEmitter<boolean>();
  @Output() editCriteria = new EventEmitter<{
    type: string;
    parentFilter?: string;
    criteriaKey?: string;
    criteriaData?: any;
  }>();
  @Output() criteriaDataChanged = new EventEmitter<{
    filterSteps: any[];
    criteriaPayloadData: { [key: string]: any };
    newCriteriaPayloadData: { [key: string]: any };
  }>();

  @Input() selectedLocation!: any;
  @Input() minimalSelectedLocation!: string[];
  @Input() minimalSelectedSector!: string[];
  @Input() selectedCompanyType!: { COMPANY_TYPE: string[] };
  @Input() selectedCompanyStatus!: { COMPANY_STATUS: string[] };
  @Input() selectedFinancialMetrics!: any;
  //all criteria
  @Input() dropdownAllCriteria!: any[];

  criteriaTableData: any[] = [];
  criteriaPayloadData: { [key: string]: any } = {};

  //new criteria
  @Input() newCriteriaToAdd!: any;
  newCriteriaPayloadData: { [key: string]: any } = {};
  currentYear: string = "";
  // Operator display mapping
  private operatorDisplayMap: { [key: string]: string } = {
    eq: "=",
    ne: "≠",
    lt: "<",
    gt: ">",
    gte: "≥",
    lte: "≤",
    plus: "+",
    minus: "-",
    times: "×",
    div: "÷",
    between: "Between",
    isna: "Is NA",
    isnotna: "Is Not NA",
  };

  // Track the selection order of ALL criteria
  private selectionOrder: string[] = [];

  // Define which criteria are manual (won't be fully deleted)
  private readonly MANUAL_CRITERIA = ["Sectors and Industries", "Location"];

  // Define the fixed positions for mandatory criteria
  private readonly FIXED_POSITIONS = {
    "Sectors and Industries": 0,
    Location: 1,
  };

  // Add a subject to trigger count update with debounce
  private countUpdateTrigger = new Subject<void>();

  // Exchange reference list to determine "all selected"
  private readonly ALL_EXCHANGES: string[] = [
    "ADX","AIM","ARCA","ASE","ASX","ATSE","BASE","BATS","BELEX","BIT","BME","BMV","BNV","BOS","BOVESPA","BSE","BSSE","BST","BUL","BUSE","BVB","BVC","BVL","BVMT","CASE","Catalist","CBSE","CNSX","COSE","CPSE","CSE","DB","DSE","DSM","DUSE","DZASE","ENXTAM","ENXTBR","ENXTLS","ENXTPA","GHSE","HLSE","HMSE","HNX","HOSE","IBSE","IDX","IRTSE","ISE","JMSE","JSE","KASE","KLSE","KOSDAQ","KOSE","KWSE","LJSE","LSE","ME","MISX","MUN","MUSE","NASDAQCM","NASDAQGM","NASDAQGS","NEOE","NGM","NGSE","NSE","NSEI","NSX","NYSE","NYSEAM","NZSE","OB","OFEX","OM","OTC","OTCBB","OTCEM","OTCNO","OTCPK","OTCQB","OTCQX","PLSE","PSE","PSGM","SASE","SEHK","SET","SGX","SHSE","SNSE","SPSE","SWX","SZSE","TASE","TLSE","TPEX","TSE","TSX","TSXV","TTSE","TWSE","UGSE","WBAG","WSE","XKON","XSAT","XTRA","ZGSE"
  ];

  constructor() {
    // Set up the subscription to handle debounced count updates
    this.countUpdateTrigger.pipe(debounceTime(300)).subscribe(() => {
      // Check if we have any criteria data to send (legacy or new)
      const hasLegacy = Object.keys(this.criteriaPayloadData).length > 0;
      const hasNew = Object.values(this.newCriteriaPayloadData || {}).some(
        (section: any) => section && Object.keys(section).length > 0
      );
      const hasAnyCriteria = hasLegacy || hasNew;

      if (hasAnyCriteria) {
        this.fetchCountForAllCriteria();
      } else {
        // Clear all counts when no criteria
        this.criteriaTableData.forEach((row) => {
          row.count = null;
        });
        this.cdr.detectChanges();
      }

      // Emit criteria payload to parent component
      this.criteriaPayloadChanged.emit({
        criteriaPayloadData: this.criteriaPayloadData,
        newCriteriaPayloadData: this.newCriteriaPayloadData,
      });

      // Emit criteria data changes for external components
      this.emitCriteriaDataChanged();
    });
  }

  ngOnInit(): void {
    // Initialize manual criteria objects in fixed positions

    this.criteriaTableData = [
      {
        count: null,
        display: [],
        type: "Sectors and Industries",
        isManual: true,
        isFixed: true,
        fixedPosition: 0,
      },
      {
        count: null,
        display: [],
        type: "Location",
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

    this.processCriteriaData();
    
    // Synchronize criteria data
    this.synchronizeCriteriaData();
  }

  // Method to synchronize criteria data
  private synchronizeCriteriaData(): void {
    // Ensure all criteria data is properly synchronized
    this.criteriaTableData.forEach((row) => {
      if (row.display.length > 0 && row.parentFilter && row.criteriaKey) {
        // Check if the criteria data exists in the payload
        const hasData = (
          (this.newCriteriaPayloadData[row.parentFilter] && 
           this.newCriteriaPayloadData[row.parentFilter][row.criteriaKey]) ||
          (row.cleanSectionName && 
           this.newCriteriaPayloadData[row.cleanSectionName] && 
           this.newCriteriaPayloadData[row.cleanSectionName][row.criteriaKey])
        );
        
        if (!hasData) {
          console.warn(`⚠️ Synchronization issue: Missing data for criteria: ${row.type}`);
        }
      }
    });
    
    // Emit initial criteria data
    this.emitCriteriaDataChanged();
  }

  ngOnChanges(changes: SimpleChanges): void {
    let criteriaChanged = false;
    criteriaChanged =
      this.updateCriteria("Sectors and Industries", () => {
        const display = this.minimalSelectedSector;
        if (!display?.length) return null;

        const payload = {
          primaryIndustry: this.selectedSector?.GICS_PRIMARY_INDUSTRY || [],
        };
        return {
          display,
          payload,
          keys: ["primaryIndustry"],
        };
      }) || criteriaChanged;

    criteriaChanged =
      this.updateCriteria("Company Type", () => {
        const display = [
          ...(this.selectedCompanyType?.COMPANY_TYPE || []),
          ...(this.selectedCompanyStatus?.COMPANY_STATUS || []),
        ];
        if (!display.length) return null;

        const payload = {
          COMPANY_TYPE: this.selectedCompanyType?.COMPANY_TYPE || [],
          COMPANY_STATUS: this.selectedCompanyStatus?.COMPANY_STATUS || [],
        };
        return {
          display,
          payload,
          keys: ["COMPANY_TYPE", "COMPANY_STATUS"],
        };
      }) || criteriaChanged;

    criteriaChanged =
      this.updateCriteria("Location", () => {
        const display = this.minimalSelectedLocation;
        if (!display?.length) return null;

        const payload = {
          state: this.selectedLocation.grouped?.STATE || [],
          //province: this.selectedLocation.grouped?.PROVINCE || [],
          // countryName: this.selectedLocation.grouped?.COUNTRY_NAME || [],
          // usRegion: this.selectedLocation.grouped?.US_REGION || [],
          // geography: this.selectedLocation.grouped?.GEOGRAPHY || [],
        };
        return {
          display,
          payload,
          keys: ["state", "province", "countryName", "usRegion", "geography"],
        };
      }) || criteriaChanged;

    criteriaChanged =
      this.updateCriteria("Financial Metrics", () => {
        if (
          !this.selectedFinancialMetrics ||
          !Object.keys(this.selectedFinancialMetrics).length
        )
          return null;

        const display: string[] = [];
        const payload: any = {};

        const displayKeyMap: { [key: string]: string } = {
          TOTAL_REVENUE__LATEST_FISCAL_YEAR____000__1: "Revenue",
          EBITDA__LATEST_FISCAL_YEAR____000__1: "EBITDA",
          NET_INCOME__LATEST_FISCAL_YEAR____000__1: "Net Income",
          ENTERPRISE_VALUE__LATEST_FISCAL_YEAR____000__1: "Enterprise Value",
          FISCAL_PERIOD__1: "Fiscal Period",
        };

        for (const key in this.selectedFinancialMetrics) {
          const metric = this.selectedFinancialMetrics[key];
          if (metric?.min != null || metric?.max != null) {
            const min = metric.min != null ? metric.min : "";
            const max = metric.max != null ? metric.max : "";
            const displayKey = displayKeyMap[key] || key;
            display.push(`${displayKey}: ${min || "–"} - ${max || "–"}`);
            payload[key] = { min, max };
          }
        }

        if (!display.length) return null;

        return {
          display,
          payload,
          keys: Object.keys(payload),
        };
      }) || criteriaChanged;

    // Handle new criteria addition
    if (changes["newCriteriaToAdd"] && this.newCriteriaToAdd) {
      this.processNewCriteria(this.newCriteriaToAdd);

      criteriaChanged = true;
    }

    // Only trigger the count update if criteria actually changed
    if (criteriaChanged) {
      this.countUpdateTrigger.next();
    }

    if (changes["dropdownAllCriteria"]) {
      this.processCriteriaData();
    }
  }

  // Process new criteria from dropdown selection
  processNewCriteria(newCriteria: any): void {
    const year = newCriteria.year;
    const originalName = newCriteria.originalName; // Extract original display name

    // DEBUG: Log the incoming criteria and year
    // console.log("🔍 DEBUG: processNewCriteria called with:", newCriteria);
    // console.log("🔍 DEBUG: Extracted year:", year);
    // console.log("🔍 DEBUG: Year type:", typeof year);
    // console.log("🔍 DEBUG: Year is null/undefined?", year == null);

    // Update current year (for now, single year support)
    this.currentYear = year;

    // Process each filter group in the new criteria
    Object.keys(newCriteria).forEach((key) => {
      if (key !== "year" && key !== "originalName") {
        const filterGroup = newCriteria[key];
        this.processFilterGroup(key, filterGroup, originalName);
      }
    });

    // Trigger criteria update after processing all new criteria
    this.countUpdateTrigger.next();

    // Ensure counts compute when only new criteria exists
    setTimeout(() => {
      const hasLegacy = Object.keys(this.criteriaPayloadData).length > 0;
      const hasNew = Object.values(this.newCriteriaPayloadData || {}).some(
        (section: any) => section && Object.keys(section).length > 0
      );
      if (!hasLegacy && hasNew) {
        this.fetchCountForAllCriteria();
      }
    }, 0);
  }
  // Method to handle auto-refresh when new criteria is added
  private handleAutoRefreshForNewCriteria(): void {
    // Check if we already have companies data and should auto-refresh
    if (this.companiesCluster && 
        this.companiesCluster.content && 
        this.companiesCluster.content.length > 0) {
      
      console.log("🔄 Auto-refreshing results due to new criteria");
      
      // Trigger auto-refresh with a small delay to ensure UI updates
      setTimeout(() => {
        this.getCompaniesCluster();
      }, 200);
    }
  }

  // Process individual filter group (e.g., balanceSheetAssetsFilters)
  processFilterGroup(parentFilter: string, filterGroup: any, originalName?: string): void {
    // If this parent filter already exists, merge with existing data
    if (!this.newCriteriaPayloadData[parentFilter]) {
      this.newCriteriaPayloadData[parentFilter] = {};
    }
    
    // Also store the clean section name for easier matching
    const cleanSectionName = parentFilter.replace(/Filters$/, '');
    if (!this.newCriteriaPayloadData[cleanSectionName]) {
      this.newCriteriaPayloadData[cleanSectionName] = {};
    }

    // Process each criteria within the filter group
    Object.keys(filterGroup).forEach((criteriaKey) => {
      const criteriaData = filterGroup[criteriaKey];

      // Handle removal when operator is 'in' with empty array
      const operators = Object.keys(criteriaData || {});
      if (
        criteriaKey &&
        operators.length === 1 &&
        operators[0] === 'in' &&
        Array.isArray(criteriaData['in']) &&
        criteriaData['in'].length === 0
      ) {
        // Remove from payload (both keys)
        if (this.newCriteriaPayloadData[parentFilter]) {
          delete this.newCriteriaPayloadData[parentFilter][criteriaKey];
          if (Object.keys(this.newCriteriaPayloadData[parentFilter]).length === 0) {
            delete this.newCriteriaPayloadData[parentFilter];
          }
        }
        const cleanSectionName = parentFilter.replace(/Filters$/, '');
        if (this.newCriteriaPayloadData[cleanSectionName]) {
          delete this.newCriteriaPayloadData[cleanSectionName][criteriaKey];
          if (Object.keys(this.newCriteriaPayloadData[cleanSectionName]).length === 0) {
            delete this.newCriteriaPayloadData[cleanSectionName];
          }
        }

        // Remove row from table if present
        const typeToRemove = criteriaKey === 'exchange'
          ? 'Exchange'
          : `${this.formatParentFilterName(parentFilter)} - ${this.formatCriteriaDisplayName(criteriaKey)}`;
        const hadRow = this.criteriaTableData.some(r => r.type === typeToRemove);
        if (hadRow) {
          this.criteriaTableData = this.criteriaTableData.filter(r => r.type !== typeToRemove);
          const orderIndex = this.selectionOrder.indexOf(typeToRemove);
          if (orderIndex > -1) this.selectionOrder.splice(orderIndex, 1);
          this.sortCriteriaData();
          this.countUpdateTrigger.next();
        }
        return; // Skip further processing for this key
      }

      // Merge with existing criteria data instead of overwriting
      if (!this.newCriteriaPayloadData[parentFilter][criteriaKey]) {
        this.newCriteriaPayloadData[parentFilter][criteriaKey] = {};
      }
      
      // Also store in clean section name for easier matching
      if (!this.newCriteriaPayloadData[cleanSectionName][criteriaKey]) {
        this.newCriteriaPayloadData[cleanSectionName][criteriaKey] = {};
      }

      // Add the operator and value - preserve existing data
      Object.assign(
        this.newCriteriaPayloadData[parentFilter][criteriaKey],
        criteriaData
      );
      
      // Also store in clean section name
      Object.assign(
        this.newCriteriaPayloadData[cleanSectionName][criteriaKey],
        criteriaData
      );

      // Add to criteria table display
      this.addNewCriteriaToTable(parentFilter, criteriaKey, criteriaData, originalName);
    });

    // Handle auto-refresh for new criteria
    this.handleAutoRefreshForNewCriteria();
  }
  // Add new criteria to the table display
  addNewCriteriaToTable(
    parentFilter: string,
    criteriaKey: string,
    criteriaData: any,
    originalName?: string
  ): void {
    // Use original name if available, otherwise format the key
    const displayName = originalName || this.formatCriteriaDisplayName(criteriaKey);
    const isExchange = criteriaKey === 'exchange';
    const type = isExchange ? 'Exchange' : `${this.formatParentFilterName(parentFilter)} - ${displayName}`;

    // Create display text
    let displayText = this.createCriteriaDisplayText(displayName, criteriaData);
    if (isExchange) {
      const inValues = Array.isArray(criteriaData?.in) ? criteriaData.in : [];
      if (inValues.length >= this.ALL_EXCHANGES.length) {
        displayText = 'All Exchanges';
      } else {
        displayText = inValues.join(', ');
      }
    }

    // Check if this criteria type already exists
    const existingRow = this.criteriaTableData.find((r) => r.type === type);

    if (existingRow) {
      // Update existing row - replace for exchange, append for others
      if (isExchange) {
        existingRow.display = displayText ? [displayText] : [];
      } else {
        if (!existingRow.display.includes(displayText)) {
          existingRow.display.push(displayText);
        }
      }
      existingRow.count = "Loading";
    } else {
      // Add new row with dynamic position (after fixed positions)
      const newRow = {
        type: type,
        display: displayText ? [displayText] : [],
        count: "Loading",
        isManual: false,
        isFixed: false,
        parentFilter: parentFilter,
        criteriaKey: criteriaKey,
        cleanSectionName: parentFilter.replace(/Filters$/, ''),
        dynamicPosition: this.getNextDynamicPosition(),
      };

      this.criteriaTableData.push(newRow);

      // Add to selection order after fixed criteria
      if (!this.selectionOrder.includes(type)) {
        this.selectionOrder.push(type);
      }
    }

    // Re-sort the criteria data
    this.sortCriteriaData();

    // If this is the first dynamic criteria added, trigger count update explicitly
    const hasLegacy = Object.keys(this.criteriaPayloadData).length > 0;
    const hasNew = Object.values(this.newCriteriaPayloadData || {}).some(
      (section: any) => section && Object.keys(section).length > 0
    );
    if (!hasLegacy && hasNew) {
      this.countUpdateTrigger.next();
    }
  }
  createCriteriaDisplayText(displayName: string, criteriaData: any): string {
    const operator = Object.keys(criteriaData)[0];
    const value = criteriaData[operator];
    const operatorSymbol = this.operatorDisplayMap[operator] || operator;

    let displayText = `${displayName} ${operatorSymbol} ${value}`;

    // Add year if available
    if (this.currentYear) {
      displayText += ` (${this.currentYear})`;
    }

    return displayText;
  }

  // Format criteria display name (convert camelCase and underscore-separated to readable)
  formatCriteriaDisplayName(criteriaKey: string): string {
    return criteriaKey
      .replace(/_/g, " ") // Replace underscores with spaces
      .replace(/([A-Z])/g, " $1") // Add space before capital letters
      .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
      .trim();
  }
  formatParentFilterName(parentFilter: string): string {
    const nameMap: { [key: string]: string } = {
      balanceSheetAssetsFilters: "Balance Sheet Assets",
      incomeStatementFilters: "Income Statement",
      cashFlowFilters: "Cash Flow",
      financialRatiosFilters: "Financial Ratios",
    };

    return (
      nameMap[parentFilter] || parentFilter.replace(/([A-Z])/g, " $1").trim()
    );
  }
  clearAllNewCriteria(): void {
    // Remove all new criteria from table, but preserve fixed criteria
    this.criteriaTableData = this.criteriaTableData.filter(
      (row) => row.isFixed || this.MANUAL_CRITERIA.includes(row.type)
    );

    // Clear new criteria payload
    this.newCriteriaPayloadData = {};
    this.currentYear = "";

    // Update selection order - keep only fixed criteria and maintain their order
    this.selectionOrder = Object.keys(this.FIXED_POSITIONS).sort(
      (a, b) =>
        this.FIXED_POSITIONS[a as keyof typeof this.FIXED_POSITIONS] -
        this.FIXED_POSITIONS[b as keyof typeof this.FIXED_POSITIONS]
    );

    // Re-sort and update
    this.sortCriteriaData();
    this.countUpdateTrigger.next();
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

      // Remove payload keys
      this.removePayloadKeys(type);
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

  private removePayloadKeys(type: string): void {
            if (type === "Sectors and Industries") {
          delete this.criteriaPayloadData["primaryIndustry"];
        } else if (type === "Company Type") {
      delete this.criteriaPayloadData["COMPANY_TYPE"];
      delete this.criteriaPayloadData["COMPANY_STATUS"];
    } else if (type === "Financial Metrics") {
      const keys = [
        "TOTAL_REVENUE__LATEST_FISCAL_YEAR____000__1",
        "EBITDA__LATEST_FISCAL_YEAR____000__1",
        "NET_INCOME__LATEST_FISCAL_YEAR____000__1",
        "ENTERPRISE_VALUE__LATEST_FISCAL_YEAR____000__1",
        "FISCAL_PERIOD__1",
      ];
      keys.forEach((key) => delete this.criteriaPayloadData[key]);
    } else if (type === "Location") {
      delete this.criteriaPayloadData["geography"];
      delete this.criteriaPayloadData["countryName"];
      delete this.criteriaPayloadData["usRegion"];
      delete this.criteriaPayloadData["state"];
      delete this.criteriaPayloadData["province"];
    }
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

          // Rebuild payload in new order and trigger API call
          this.rebuildPayloadAndUpdate();
          
          // Emit criteria data changes to ensure parent component is updated
          this.emitCriteriaDataChanged();
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

          // Rebuild payload in new order and trigger API call
          this.rebuildPayloadAndUpdate();
          
          // Emit criteria data changes to ensure parent component is updated
          this.emitCriteriaDataChanged();
          break;
        }
        nextIndex++;
      }
    }
  }

  // Rebuild payload in the new order and trigger API update
  private rebuildPayloadAndUpdate(): void {
    const newLegacyPayload: { [key: string]: any } = {};
    const newNewCriteriaPayload: { [key: string]: any } = {};

    // First, rebuild fixed criteria payloads in their predefined order
    const fixedCriteriaTypes = Object.keys(this.FIXED_POSITIONS).sort(
      (a, b) =>
        this.FIXED_POSITIONS[a as keyof typeof this.FIXED_POSITIONS] -
        this.FIXED_POSITIONS[b as keyof typeof this.FIXED_POSITIONS]
    );

    for (const type of fixedCriteriaTypes) {
      const row = this.criteriaTableData.find((r) => r.type === type);
      if (row && row.display.length > 0) {
        // Handle legacy criteria types
        if (type === "Sectors and Industries") {
          if (this.criteriaPayloadData["primaryIndustry"]) {
            newLegacyPayload["primaryIndustry"] =
              this.criteriaPayloadData["primaryIndustry"];
          }
        } else if (type === "Company Type") {
          if (this.criteriaPayloadData["COMPANY_TYPE"]) {
            newLegacyPayload["COMPANY_TYPE"] =
              this.criteriaPayloadData["COMPANY_TYPE"];
          }
          if (this.criteriaPayloadData["COMPANY_STATUS"]) {
            newLegacyPayload["COMPANY_STATUS"] =
              this.criteriaPayloadData["COMPANY_STATUS"];
          }
        } else if (type === "Location") {
          if (this.criteriaPayloadData["state"]) {
            newLegacyPayload["state"] = this.criteriaPayloadData["state"];
          }
          if (this.criteriaPayloadData["province"]) {
            newLegacyPayload["province"] = this.criteriaPayloadData["province"];
          }
          if (this.criteriaPayloadData["geography"]) {
            newLegacyPayload["geography"] =
              this.criteriaPayloadData["geography"];
          }
          if (this.criteriaPayloadData["countryName"]) {
            newLegacyPayload["countryName"] =
              this.criteriaPayloadData["countryName"];
          }
          if (this.criteriaPayloadData["usRegion"]) {
            newLegacyPayload["usRegion"] = this.criteriaPayloadData["usRegion"];
          }
        } else if (type === "Financial Metrics") {
          const financialKeys = [
            "TOTAL_REVENUE__LATEST_FISCAL_YEAR____000__1",
            "EBITDA__LATEST_FISCAL_YEAR____000__1",
            "NET_INCOME__LATEST_FISCAL_YEAR____000__1",
            "ENTERPRISE_VALUE__LATEST_FISCAL_YEAR____000__1",
            "FISCAL_PERIOD__1",
          ];
          financialKeys.forEach((key) => {
            if (this.criteriaPayloadData[key]) {
              newLegacyPayload[key] = this.criteriaPayloadData[key];
            }
          });
        }
      }
    }

    // Then, rebuild dynamic criteria payloads in the selection order
    for (const type of this.selectionOrder) {
      const row = this.criteriaTableData.find((r) => r.type === type);
      if (row && row.display.length > 0 && !row.isFixed) {
        // Handle new criteria types (from dropdown)
        if (row.parentFilter && row.criteriaKey) {
          // Try to find data in both parentFilter and cleanSectionName
          let criteriaData = null;
          let sourceKey = null;
          
          if (
            this.newCriteriaPayloadData[row.parentFilter] &&
            this.newCriteriaPayloadData[row.parentFilter][row.criteriaKey]
          ) {
            criteriaData = this.newCriteriaPayloadData[row.parentFilter][row.criteriaKey];
            sourceKey = row.parentFilter;
          } else if (
            row.cleanSectionName &&
            this.newCriteriaPayloadData[row.cleanSectionName] &&
            this.newCriteriaPayloadData[row.cleanSectionName][row.criteriaKey]
          ) {
            criteriaData = this.newCriteriaPayloadData[row.cleanSectionName][row.criteriaKey];
            sourceKey = row.cleanSectionName;
          }

          if (criteriaData) {
            // Use the clean section name for the payload to match API response
            const targetSection = row.cleanSectionName || row.parentFilter.replace(/Filters$/, '');
            
            if (!newNewCriteriaPayload[targetSection]) {
              newNewCriteriaPayload[targetSection] = {};
            }

            // Preserve all criteria data for this section
            newNewCriteriaPayload[targetSection][row.criteriaKey] = criteriaData;
          } else {
            console.warn(
              `❌ Could not find data for ${row.parentFilter}.${row.criteriaKey} in original payload`
            );
          }
        } else {
          console.warn(
            `❌ New criteria row missing parentFilter or criteriaKey:`,
            row
          );
        }
      }
    }

    // Update both payloads
    this.criteriaPayloadData = newLegacyPayload;
    this.newCriteriaPayloadData = newNewCriteriaPayload;

    // Trigger the count update
    this.countUpdateTrigger.next();

    // Trigger change detection
    this.cdr.detectChanges();
  }

  // Helper method to build FilterSteps from current data
  private buildFilterSteps(): FilterStep[] {
    const filterSteps: FilterStep[] = [];

    // First, process fixed criteria in their predefined order
    const fixedCriteriaTypes = Object.keys(this.FIXED_POSITIONS).sort(
      (a, b) =>
        this.FIXED_POSITIONS[a as keyof typeof this.FIXED_POSITIONS] -
        this.FIXED_POSITIONS[b as keyof typeof this.FIXED_POSITIONS]
    );

    for (const type of fixedCriteriaTypes) {
      const row = this.criteriaTableData.find((r) => r.type === type);
      if (row && row.display.length > 0) {
        // Handle each legacy criteria type individually
        if (type === "Sectors and Industries") {
          const sectorSteps =
            this._transformationService.transformSectorSelection({
              GICS_PRIMARY_INDUSTRY:
                this.criteriaPayloadData["primaryIndustry"] || [],
            });

          filterSteps.push(...sectorSteps);
        } else if (type === "Location") {
          // Reconstruct location object for transformation
          const locationData = {
            grouped: {
              STATE: this.criteriaPayloadData["state"] || [],
              PROVINCE: this.criteriaPayloadData["province"] || [],
              COUNTRY_NAME: this.criteriaPayloadData["countryName"] || [],
              US_REGION: this.criteriaPayloadData["usRegion"] || [],
              GEOGRAPHY: this.criteriaPayloadData["geography"] || [],
            },
          };
          const locationSteps =
            this._transformationService.transformLocationSelection(
              locationData
            );

          filterSteps.push(...locationSteps);
        } else if (type === "Company Type") {
          const companyTypeSteps =
            this._transformationService.transformCompanyTypeSelection(
              { COMPANY_TYPE: this.criteriaPayloadData["COMPANY_TYPE"] || [] },
              {
                COMPANY_STATUS:
                  this.criteriaPayloadData["COMPANY_STATUS"] || [],
              }
            );

          filterSteps.push(...companyTypeSteps);
        } else if (type === "Financial Metrics") {
          // Extract financial metrics data
          const financialMetricsData: any = {};
          const financialKeys = [
            "TOTAL_REVENUE__LATEST_FISCAL_YEAR____000__1",
            "EBITDA__LATEST_FISCAL_YEAR____000__1",
            "NET_INCOME__LATEST_FISCAL_YEAR____000__1",
            "ENTERPRISE_VALUE__LATEST_FISCAL_YEAR____000__1",
            "FISCAL_PERIOD__1",
          ];

          financialKeys.forEach((key) => {
            if (this.criteriaPayloadData[key]) {
              financialMetricsData[key] = this.criteriaPayloadData[key];
            }
          });

          if (Object.keys(financialMetricsData).length > 0) {
            const financialSteps =
              this._transformationService.transformFinancialMetrics(
                financialMetricsData,
                this.currentYear
              );

            filterSteps.push(...financialSteps);
          }
        }
      }
    }

    // Then, process dynamic criteria in the order specified by selectionOrder
    for (const type of this.selectionOrder) {
      const row = this.criteriaTableData.find((r) => r.type === type);
      if (row && row.display.length > 0 && !row.isFixed) {
        // This is a new criteria type (from dropdown)
        // Process only this specific criteria to maintain order
        const specificNewCriteriaData: { [key: string]: any } = {};

        // Try to find data in both parentFilter and cleanSectionName
        let criteriaData = null;
        let sourceKey = null;
        
        if (
          this.newCriteriaPayloadData[row.parentFilter] &&
          this.newCriteriaPayloadData[row.parentFilter][row.criteriaKey]
        ) {
          criteriaData = this.newCriteriaPayloadData[row.parentFilter][row.criteriaKey];
          sourceKey = row.parentFilter;
        } else if (
          row.cleanSectionName &&
          this.newCriteriaPayloadData[row.cleanSectionName] &&
          this.newCriteriaPayloadData[row.cleanSectionName][row.criteriaKey]
        ) {
          criteriaData = this.newCriteriaPayloadData[row.cleanSectionName][row.criteriaKey];
          sourceKey = row.cleanSectionName;
        }

        if (criteriaData) {
          // Use the clean section name for the payload to match API response
          const targetSection = row.cleanSectionName || row.parentFilter.replace(/Filters$/, '');
          
          if (!specificNewCriteriaData[targetSection]) {
            specificNewCriteriaData[targetSection] = {};
          }
          specificNewCriteriaData[targetSection][row.criteriaKey] = criteriaData;

          const newCriteriaSteps =
            this._transformationService.transformNewCriteria(
              specificNewCriteriaData,
              this.currentYear
            );

          filterSteps.push(...newCriteriaSteps);
        } else {
          console.warn(`❌ Could not process new criteria ${type}:`, {
            parentFilter: row.parentFilter,
            criteriaKey: row.criteriaKey,
            cleanSectionName: row.cleanSectionName,
            hasParentInPayload: !!this.newCriteriaPayloadData[row.parentFilter],
            hasCleanSectionInPayload: !!(
              row.cleanSectionName && this.newCriteriaPayloadData[row.cleanSectionName]
            ),
            hasKeyInPayload: !!(
              (this.newCriteriaPayloadData[row.parentFilter] &&
                this.newCriteriaPayloadData[row.parentFilter][row.criteriaKey]) ||
              (row.cleanSectionName &&
                this.newCriteriaPayloadData[row.cleanSectionName] &&
                this.newCriteriaPayloadData[row.cleanSectionName][row.criteriaKey])
            ),
          });
        }
      }
    }

    // If no selection order or no criteria, fall back to original behavior
    if (this.selectionOrder.length === 0 || filterSteps.length === 0) {
      // Transform company filters (sectors, locations, company types, etc.)
      const companyFilterSteps =
        this._transformationService.transformToFilterSteps(
          this.criteriaPayloadData,
          [],
          this.currentYear
        );
      filterSteps.push(...companyFilterSteps);

      // Transform new criteria (financial metrics from dropdown)
      const newCriteriaSteps = this._transformationService.transformNewCriteria(
        this.newCriteriaPayloadData,
        this.currentYear
      );
      filterSteps.push(...newCriteriaSteps);
    }

    // Don't use combineFilterSteps as it might reorder - return as is to preserve order
    return filterSteps;
  }
  // Helper method to build the payload with companyFilters wrapper (legacy)
  private buildPayloadWithCompanyFilters(): { [key: string]: any } {
    const payload: { [key: string]: any } = {
      companyFilters: { ...this.criteriaPayloadData },
    };

    // Add year if available
    if (this.currentYear) {
      payload["year"] = this.currentYear;
    }

    // Add new criteria payload data (outside companyFilters)
    Object.keys(this.newCriteriaPayloadData).forEach((key) => {
      payload[key] = this.newCriteriaPayloadData[key];
    });

    return payload;
  }

  fetchCountForAllCriteria() {
    // Transform current data to FilterStep format
    const filterSteps = this.buildFilterSteps();



    this._apiService.getProgressiveCounts(filterSteps).subscribe({
      next: (res: any) => {
        // Update counts for all criteria at once
        this.updateAllCountsFromFilterSteps(res);
      },
      error: (err) => {
        console.error("Progressive counts fetch error:", err);
        // Mark all counts as error
        this.criteriaTableData.forEach((row) => {
          if (row.display.length > 0) {
            row.count = "Error";
          }
        });
        this.cdr.detectChanges();
      },
    });
  }

  private updateAllCountsFromFilterSteps(response: any) {
    // Handle both new API format and legacy format

    // Check if response has the new format (counts array + finalCount)
    if (response.counts && response.finalCount !== undefined) {
      this.updateCountsFromNewFormat(response);
    } else if (response.totalCount !== undefined && response.filterSteps) {
      this.updateCountsFromFilterStepsFormat(response);
    } else {
      console.warn("Unknown API response format:", response);
      // Fallback to legacy format
      this.updateAllCounts(response);
    }
  }

  private updateCountsFromNewFormat(response: ProgressiveCountsResponse) {

    // Map counts array to criteria table data
    this.criteriaTableData.forEach((row) => {
              // Find matching count by category name
        let matchingCount = response.counts.find((countItem) => {
          // Try to match by various field mappings
          if (row.type === "Sectors and Industries") {
            return countItem.category === "primaryIndustry";
          } else if (row.type === "Location") {
          return [
            "state",
            "province",
            "countryName",
            "usRegion",
            "geography",
          ].includes(countItem.category);
        } else if (row.type === "Company Type") {
          return [
            "companyType",
            "companyStatus",
            "COMPANY_TYPE",
            "COMPANY_STATUS",
          ].includes(countItem.category);
        } else if (row.criteriaKey) {
          // For new criteria from dropdown
          return countItem.category === row.criteriaKey;
        }
        return false;
      });

      // Update count
      if (matchingCount) {
        row.count = matchingCount.count;
      } else if (row.display.length > 0) {
        // If row has data but no specific count found, use final count
        row.count = response.finalCount;
      } else {
        row.count = null;
      }
    });

    this.cdr.detectChanges();
  }

  private updateCountsFromFilterStepsFormat(response: FilterResponseDto) {

    // Map filter step results to criteria table data
    this.criteriaTableData.forEach((row) => {
              // Find matching filter step result by field name
        let matchingStep = response.filterSteps.find((step) => {
          // Try to match by various field mappings
          if (row.type === "Sectors and Industries") {
            return step.fieldName === "primaryIndustry";
          } else if (row.type === "Location") {
          return [
            "state",
            "province",
            "countryName",
            "usRegion",
            "geography",
          ].includes(step.fieldName);
        } else if (row.type === "Company Type") {
          return ["companyType", "companyStatus"].includes(step.fieldName);
        } else if (row.criteriaKey) {
          // For new criteria from dropdown
          return step.fieldName === row.criteriaKey;
        }
        return false;
      });

      // Update count
      if (matchingStep) {
        row.count = matchingStep.count;
      } else {
        // If no matching step found, use total count for first step or null
        row.count =
          response.filterSteps.length > 0 ? response.totalCount : null;
      }
    });

    this.cdr.detectChanges();
  }

  private updateAllCounts(counts: any[]) {
    const categoryMap: { [key: string]: string } = {
      "Sectors and Industries": "primaryIndustry",
      "Company Type": "COMPANY_STATUS",
      "Financial Metrics": "FINANCIAL_METRICS",
      Location: "geography",
    };

    this.criteriaTableData.forEach((row) => {
      const category = categoryMap[row.type];
      if (category) {
        // Special handling for Location type - check in priority order
        if (row.type === "Location") {
          // Get all location counts
          const geographyCount = counts.find((c) => c.category === "geography");
          const countryCount = counts.find((c) => c.category === "countryName");
          const regionCount = counts.find((c) => c.category === "usRegion");
          const stateCount = counts.find((c) => c.category === "state");
          const provinceCount = counts.find((c) => c.category === "province");

          // Check what data is actually present in the payload
          const hasGeography =
            this.criteriaPayloadData["geography"]?.length > 0;
          const hasCountry =
            this.criteriaPayloadData["countryName"]?.length > 0;
          const hasRegion = this.criteriaPayloadData["usRegion"]?.length > 0;
          const hasState = this.criteriaPayloadData["state"]?.length > 0;
          const hasProvince = this.criteriaPayloadData["province"]?.length > 0;

          // Priority order: state > usRegion > countryName > geography
          if (hasState || hasProvince) {
            // Combine state and province counts if both present
            let totalCount = 0;
            if (hasState && stateCount) {
              totalCount += stateCount.count;
            }
            if (hasProvince && provinceCount) {
              totalCount += provinceCount.count;
            }
            row.count = totalCount > 0 ? totalCount : null;
          } else if (hasRegion && regionCount) {
            row.count = regionCount.count;
          } else if (hasCountry && countryCount) {
            row.count = countryCount.count;
          } else if (hasGeography && geographyCount) {
            row.count = geographyCount.count;
          } else {
            row.count = null; // No location count found
          }
        } else {
          // For other criteria types, use the existing logic
          const countData = counts.find((c) => c.category === category);
          row.count = countData ? countData.count : null; // Null instead of 0 for empty count
        }
      } else {
        // Handle new criteria types (from dropdown)
        if (row.criteriaKey) {
          const countData = counts.find((c) => c.category === row.criteriaKey);
          row.count = countData ? countData.count : null;
        }
      }
    });

    this.cdr.detectChanges();
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
    } else {
      if (table.parentFilter && table.criteriaKey) {
        // Remove from both parentFilter and cleanSectionName if they exist
        if (this.newCriteriaPayloadData[table.parentFilter]) {
          delete this.newCriteriaPayloadData[table.parentFilter][
            table.criteriaKey
          ];

          // If parent filter is empty, remove it
          if (
            Object.keys(this.newCriteriaPayloadData[table.parentFilter])
              .length === 0
          ) {
            delete this.newCriteriaPayloadData[table.parentFilter];
          }
        }
        
        // Also remove from cleanSectionName if it exists
        if (table.cleanSectionName && this.newCriteriaPayloadData[table.cleanSectionName]) {
          delete this.newCriteriaPayloadData[table.cleanSectionName][
            table.criteriaKey
          ];

          // If clean section is empty, remove it
          if (
            Object.keys(this.newCriteriaPayloadData[table.cleanSectionName])
              .length === 0
          ) {
            delete this.newCriteriaPayloadData[table.cleanSectionName];
          }
        }
      }
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

    // Remove payload keys for standard criteria
    this.removePayloadKeys(type);

    // Tell parent to clear original selection
    this.clearSelection.emit(type);

    // Update counts with the modified payload
    this.countUpdateTrigger.next();
    
    // Emit criteria data changes to ensure parent component is updated
    this.emitCriteriaDataChanged();
  }

  showCriteria(type: string, table?: any) {
    // Check if this is a balance sheet filter (new criteria from dropdown)
    if (table && table.parentFilter && table.criteriaKey) {
      // This is a new criteria from dropdown, emit edit event
      // Try to find criteria data in both parentFilter and cleanSectionName
      let criteriaData = null;
      
      if (this.newCriteriaPayloadData[table.parentFilter]?.[table.criteriaKey]) {
        criteriaData = this.newCriteriaPayloadData[table.parentFilter][table.criteriaKey];
      } else if (table.cleanSectionName && this.newCriteriaPayloadData[table.cleanSectionName]?.[table.criteriaKey]) {
        criteriaData = this.newCriteriaPayloadData[table.cleanSectionName][table.criteriaKey];
      }
      


      this.editCriteria.emit({
        type: type,
        parentFilter: table.parentFilter,
        criteriaKey: table.criteriaKey,
        criteriaData: criteriaData,
      });
    } else {
      // This is a legacy criteria, use the original behavior
      this.openCriteriaSelector.emit(type);
    }
  }

  companiesCluster: any;
  
  // Method to preserve criteria data across pagination
  preserveCriteriaData(): void {
    // Store current criteria state in localStorage or component state
    const criteriaState = {
      criteriaPayloadData: this.criteriaPayloadData,
      newCriteriaPayloadData: this.newCriteriaPayloadData,
      currentYear: this.currentYear,
      selectionOrder: this.selectionOrder,
      criteriaTableData: this.criteriaTableData
    };
    
    // Store in component state for immediate access
    this._preservedCriteriaState = criteriaState;
  }

  // Method to restore criteria data
  restoreCriteriaData(): void {
    if (this._preservedCriteriaState) {
      this.criteriaPayloadData = { ...this._preservedCriteriaState.criteriaPayloadData };
      this.newCriteriaPayloadData = { ...this._preservedCriteriaState.newCriteriaPayloadData };
      this.currentYear = this._preservedCriteriaState.currentYear;
      this.selectionOrder = [...this._preservedCriteriaState.selectionOrder];
      this.criteriaTableData = [...this._preservedCriteriaState.criteriaTableData];
      
      // Trigger change detection
      this.cdr.detectChanges();
    }
  }

  // Private property to store preserved criteria state
  private _preservedCriteriaState: any = null;

  getCompaniesCluster() {
    // Preserve current criteria data before making the API call
    this.preserveCriteriaData();
    
    // Validate that all criteria are properly included
    this.validateAndLogCriteria();
    
    // Emit the run screen clicked event
    this.runScreenClicked.emit();

    // Build FilterSteps for the new API
    const filterSteps = this.buildFilterSteps();

    // Log the filter steps for debugging
    console.log("🔍 DEBUG: Filter steps being sent to API:", filterSteps);

    this._apiService.searchCompanies(filterSteps, 1, 10).subscribe({
      next: (res) => {
        this.companiesCluster = res;
        this.companiesClusterData.emit(this.companiesCluster); // Emit the data to the parent component
        //this.isCriteriaExpanded = false;
      },
      error: (err) => {
        console.error("❌ searchCompanies FAILED in getCompaniesCluster:", err);
        // No longer fall back to deprecated API - just clear data
        this.companiesCluster = {
          content: [],
          totalElements: 0,
          totalPages: 0,
        };
        this.companiesClusterData.emit(this.companiesCluster);
      },
    });
  }

  // Method to validate and log all criteria before API call
  private validateAndLogCriteria(): void {
    console.log("🔍 === CRITERIA VALIDATION ===");
    console.log("🔍 Current Year:", this.currentYear);
    console.log("🔍 Legacy Criteria Payload:", this.criteriaPayloadData);
    console.log("🔍 New Criteria Payload:", this.newCriteriaPayloadData);
    console.log("🔍 Criteria Table Data:", this.criteriaTableData);
    console.log("🔍 Selection Order:", this.selectionOrder);
    
    // Check for any missing or incomplete criteria
    let hasIssues = false;
    
    this.criteriaTableData.forEach((row, index) => {
      if (row.display.length > 0) {
        console.log(`🔍 Row ${index + 1}: ${row.type} - ${row.display.length} items`);
        
        if (row.parentFilter && row.criteriaKey) {
          // Check if the criteria data exists in the payload
          const hasData = (
            (this.newCriteriaPayloadData[row.parentFilter] && 
             this.newCriteriaPayloadData[row.parentFilter][row.criteriaKey]) ||
            (row.cleanSectionName && 
             this.newCriteriaPayloadData[row.cleanSectionName] && 
             this.newCriteriaPayloadData[row.cleanSectionName][row.criteriaKey])
          );
          
          if (!hasData) {
            console.warn(`⚠️ Missing data for criteria: ${row.type}`);
            hasIssues = true;
          }
        }
      }
    });
    
    if (hasIssues) {
      console.warn("⚠️ Some criteria may have missing data");
    } else {
      console.log("✅ All criteria appear to have complete data");
    }
    console.log("🔍 === END CRITERIA VALIDATION ===");
  }

  // Updated method using new searchCompanies API
  private getCompaniesClusterNew() {
    // Preserve current criteria data before making the API call
    this.preserveCriteriaData();
    
    // Build FilterSteps for the new API
    const filterSteps = this.buildFilterSteps();

    this._apiService.searchCompanies(filterSteps, 1, 10).subscribe({
      next: (res) => {
        this.companiesCluster = res;
        this.companiesClusterData.emit(this.companiesCluster);
        this.isCriteriaExpanded = false;
      },
      error: (err) => {
        console.error("❌ searchCompanies FAILED in criteria component:", err);
        // Clear data on error instead of falling back to deprecated API
        this.companiesCluster = {
          content: [],
          totalElements: 0,
          totalPages: 0,
        };
        this.companiesClusterData.emit(this.companiesCluster);
      },
    });
  }

  // Method to handle pagination changes while preserving criteria
  onPageChange(pageNo: number, pageSize: number = 10): void {
    // Ensure criteria data is preserved
    if (!this._preservedCriteriaState) {
      this.preserveCriteriaData();
    }
    
    // Build FilterSteps for the new API
    const filterSteps = this.buildFilterSteps();

    // Log the filter steps for debugging
    console.log("🔍 DEBUG: Filter steps for page change:", filterSteps);

    this._apiService.searchCompanies(filterSteps, pageNo, pageSize).subscribe({
      next: (res) => {
        this.companiesCluster = res;
        this.companiesClusterData.emit(this.companiesCluster);
      },
      error: (err) => {
        console.error("❌ searchCompanies FAILED for page change:", err);
        this.companiesCluster = {
          content: [],
          totalElements: 0,
          totalPages: 0,
        };
        this.companiesClusterData.emit(this.companiesCluster);
      },
    });
  }

  toggleCriteriaExpanded() {
    this.isCriteriaExpanded = !this.isCriteriaExpanded;
    this.criteriaExpanded.emit(this.isCriteriaExpanded);
  }

  // New properties for dropdown functionality
  searchText: string = "";
  isDropdownOpen: boolean = false;
  flattenedCriteria: any[] = [];
  filteredCriteria: any[] = [];
  selectedDropdownCriteria: any = null;
  highlightedIndex: number = -1;

  // New methods for dropdown functionality
  processCriteriaData() {
    if (this.dropdownAllCriteria && this.dropdownAllCriteria.length > 0) {
      this.flattenedCriteria = [];
      this.flattenData(this.dropdownAllCriteria, "");
      this.filteredCriteria = [...this.flattenedCriteria];
    }
  }

  flattenData(items: any[], parentPath: string = "", parentFilter?: string) {
    items.forEach((item) => {
      const currentPath = parentPath
        ? `${parentPath} > ${item.name}`
        : item.name;

      // If item has children, recursively flatten them
      if (item.children && item.children.length > 0) {
        this.flattenData(
          item.children,
          currentPath,
          item.parentFilter || parentFilter
        );
      } else {
        // This is a leaf node, add it to flattened criteria
        this.flattenedCriteria.push({
          id: item.id,
          name: item.name,
          fullPath: currentPath,
          parentFilter: item.parentFilter || parentFilter,
          parameters: item.parameters,
          yearType: item.yearType,
          fiscalYear: item.fiscalYear,
          fiscalQuarter: item.fiscalQuarter,
          key: item.key ? item.key : null,
        });
      }
    });
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchText = target.value;
    this.filterCriteria();
    this.isDropdownOpen = this.searchText.length > 0;
    this.highlightedIndex = -1;
  }

  onSearchFocus() {
    if (this.searchText.length > 0) {
      this.isDropdownOpen = true;
    }
  }

  onSearchClick() {
    if (!this.isDropdownOpen && this.filteredCriteria.length > 0) {
      this.isDropdownOpen = true;
    }
  }

  filterCriteria() {
    if (!this.searchText.trim()) {
      this.filteredCriteria = [...this.flattenedCriteria];
    } else {
      const searchLower = this.searchText.toLowerCase();
      this.filteredCriteria = this.flattenedCriteria.filter((criteria) =>
        criteria.name.toLowerCase().includes(searchLower)
      );
    }
  }

  selectDropdownCriteria(criteria: any) {
    this.selectedDropdownCriteria = criteria;
    this.searchText = criteria.name;
    this.isDropdownOpen = false;
    this.highlightedIndex = -1;


    // FIX: For financial criteria, ensure we have a year
    // Check if this is a financial criteria that requires a year
    const isFinancialCriteria =
      criteria.parentFilter &&
      [
        "balanceSheetAssetsFilters",
        "incomeStatementFilters",
        "cashFlowFilters",
        "financialRatiosFilters",
      ].includes(criteria.parentFilter);

    if (isFinancialCriteria) {
      // Default to current year if no year is specified
      const currentYear = new Date().getFullYear().toString();

      // Add year to the criteria object
      criteria.defaultYear = currentYear;
    }
    this.clearDropdownSearch();
    this.changedDropdownCriteria.emit(criteria);
  }

  onKeyDown(event: KeyboardEvent) {
    if (!this.isDropdownOpen) {
      if (event.key === "ArrowDown" || event.key === "Enter") {
        this.isDropdownOpen = true;
        event.preventDefault();
      }
      return;
    }

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        this.highlightedIndex = Math.min(
          this.highlightedIndex + 1,
          this.filteredCriteria.length - 1
        );
        this.scrollToHighlighted();
        break;
      case "ArrowUp":
        event.preventDefault();
        this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
        this.scrollToHighlighted();
        break;
      case "Enter":
        event.preventDefault();
        if (
          this.highlightedIndex >= 0 &&
          this.highlightedIndex < this.filteredCriteria.length
        ) {
          this.selectDropdownCriteria(
            this.filteredCriteria[this.highlightedIndex]
          );
        }
        break;
      case "Escape":
        this.isDropdownOpen = false;
        this.highlightedIndex = -1;
        break;
    }
  }

  scrollToHighlighted() {
    setTimeout(() => {
      const highlightedElement = document.querySelector(
        ".dropdown-item.highlighted"
      );
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    });
  }

  @HostListener("document:click", ["$event"])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (!target.closest(".search_parent")) {
      this.isDropdownOpen = false;
      this.highlightedIndex = -1;
    }
  }

  clearDropdownSearch() {
    this.searchText = "";
    this.selectedDropdownCriteria = null;
    this.filteredCriteria = [...this.flattenedCriteria];
    this.isDropdownOpen = false;
    this.highlightedIndex = -1;
  }

  // addDropdownCriteria() {
  //   if (this.selectedDropdownCriteria) {
  //     console.log(
  //       "Adding criteria from dropdown:",
  //       this.selectedDropdownCriteria
  //     );
  //     // Process the selected criteria here
  //     // You can call your existing logic or emit an event

  //     // Clear after adding
  //     this.clearDropdownSearch();
  //   } else {
  //     console.log("No criteria selected from dropdown");
  //   }
  // }

  getDisplayPath(criteria: any): string {
    const pathParts = criteria.fullPath.split(" > ");
    if (pathParts.length > 3) {
      return `...${pathParts.slice(-2).join(" > ")}`;
    }
    return criteria.fullPath;
  }

  // Get the next available dynamic position (after fixed positions)
  private getNextDynamicPosition(): number {
    const existingDynamicPositions = this.criteriaTableData
      .filter((row) => !row.isFixed)
      .map((row) => row.dynamicPosition || 0);

    if (existingDynamicPositions.length === 0) {
      return 2; // Start after fixed positions (0, 1)
    }

    return Math.max(...existingDynamicPositions) + 1;
  }

  // Method to emit criteria data changes
  private emitCriteriaDataChanged(): void {
    const filterSteps = this.buildFilterSteps();
    this.criteriaDataChanged.emit({
      filterSteps,
      criteriaPayloadData: this.criteriaPayloadData,
      newCriteriaPayloadData: this.newCriteriaPayloadData
    });
  }

  // Method to get current filter steps for external use
  getCurrentFilterSteps(): any[] {
    return this.buildFilterSteps();
  }

  // Method to get current criteria payload data
  getCurrentCriteriaPayload(): {
    criteriaPayloadData: { [key: string]: any };
    newCriteriaPayloadData: { [key: string]: any };
  } {
    return {
      criteriaPayloadData: this.criteriaPayloadData,
      newCriteriaPayloadData: this.newCriteriaPayloadData
    };
  }

  ngOnDestroy(): void {
    // Ensure criteria data is preserved before component destruction
    this.preserveCriteriaData();
    
    // Clean up any subscriptions or resources
    if (this.countUpdateTrigger) {
      this.countUpdateTrigger.complete();
    }
  }

  // Method to handle external refresh requests
  refreshCriteriaData(): void {
    // Synchronize criteria data
    this.synchronizeCriteriaData();
    
    // Trigger count update
    this.countUpdateTrigger.next();
    
    // Emit criteria data changes
    this.emitCriteriaDataChanged();
  }

  // Method to check if criteria data is valid
  isCriteriaDataValid(): boolean {
    let isValid = true;
    
    this.criteriaTableData.forEach((row) => {
      if (row.display.length > 0 && row.parentFilter && row.criteriaKey) {
        // Check if the criteria data exists in the payload
        const hasData = (
          (this.newCriteriaPayloadData[row.parentFilter] && 
           this.newCriteriaPayloadData[row.parentFilter][row.criteriaKey]) ||
          (row.cleanSectionName && 
           this.newCriteriaPayloadData[row.cleanSectionName] && 
           this.newCriteriaPayloadData[row.cleanSectionName][row.criteriaKey])
        );
        
        if (!hasData) {
          isValid = false;
        }
      }
    });
    
    return isValid;
  }
}
