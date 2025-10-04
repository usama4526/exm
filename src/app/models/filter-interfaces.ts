// Core filter step interface
export interface FilterStep {
  field?: string;           // For company fields (state, primaryIndustry, etc.)
  section?: string;         // For financial sections (balanceSheetAssets, incomeStatement, company, etc.)
  operator: string;         // eq, in, gte, lte, gt, lt, between
  value: string | string[]; // String for single values (balanceSheetAssets non-between), Array for multiple values
  years?: number[];         // Optional years for financial data
}

// API response interfaces
export interface FilterResponseDto {
  totalCount: number;
  filterSteps: FilterStepResult[];
}

export interface FilterStepResult {
  stepNumber: number;
  fieldName: string;
  count: number;
}

// Actual API response format (what the API currently returns)
export interface ProgressiveCountsResponse {
  counts: CountItem[];
  finalCount: number;
}

export interface CountItem {
  category: string;
  count: number;
}

// Pagination response
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Company response interface
export interface CompanyGridResponseDto {
  id: number;
  companyName: string;
  state: string;
  primaryIndustry: string;
  // Add other company fields as needed
}

// Legacy payload interfaces for transformation
export interface LegacyCompanyFilters {
  primaryIndustry?: string[];
  state?: string[];
  province?: string[];
  countryName?: string[];
  usRegion?: string[];
  geography?: string[];
  COMPANY_TYPE?: string[];
  COMPANY_STATUS?: string[];
  [key: string]: any; // For financial metrics with dynamic keys
}

export interface LegacyFinancialCriteria {
  year: string;
  [filterGroup: string]: any; // balanceSheetAssetsFilters, incomeStatementFilters, etc.
}

// Field mapping for transformation
export interface FieldMapping {
  legacyField: string;
  newField?: string;
  section?: string;
  defaultOperator: string;
}

// Operator mapping
export const OPERATOR_MAP: { [key: string]: string } = {
  "Equal (=)": "eq",
  "Does Not Equal (<>)": "ne", 
  "Less Than (<)": "lt",
  "Greater Than (>)": "gt",
  "Greater Than or Equal (>=)": "gte",
  "Less Than or Equal (<=)": "lte",
  "Plus (+)": "plus",
  "Minus (-)": "minus",
  "Times (*)": "times",
  "Divided By (/)": "div",
  "Between": "between",
  "Is NA": "isna",
  "Is Not NA": "isnotna"
};

// Field mappings for transformation
export const FIELD_MAPPINGS: FieldMapping[] = [
  // Company fields
  { legacyField: 'primaryIndustry', newField: 'primaryIndustry', defaultOperator: 'in' },
  { legacyField: 'state', newField: 'state', defaultOperator: 'in' },
  { legacyField: 'province', newField: 'province', defaultOperator: 'in' },
  { legacyField: 'countryName', newField: 'countryName', defaultOperator: 'in' },
  { legacyField: 'usRegion', newField: 'usRegion', defaultOperator: 'in' },
  { legacyField: 'geography', newField: 'geography', defaultOperator: 'in' },
  { legacyField: 'COMPANY_TYPE', newField: 'companyType', defaultOperator: 'in' },
  { legacyField: 'COMPANY_STATUS', newField: 'companyStatus', defaultOperator: 'in' },
  
  // Financial fields - Balance Sheet Assets
  { legacyField: 'totalAssets', section: 'balanceSheetAssets', defaultOperator: 'gte' },
  { legacyField: 'cashAndEquivalents', section: 'balanceSheetAssets', defaultOperator: 'gte' },
  { legacyField: 'currentAssets', section: 'balanceSheetAssets', defaultOperator: 'gte' },
  { legacyField: 'nonCurrentAssets', section: 'balanceSheetAssets', defaultOperator: 'gte' },
  
  // Financial fields - Income Statement
  { legacyField: 'totalRevenue', section: 'incomeStatementGrossProfit', defaultOperator: 'gte' },
  { legacyField: 'netIncome', section: 'incomeStatementGrossProfit', defaultOperator: 'gte' },
  { legacyField: 'grossProfit', section: 'incomeStatementGrossProfit', defaultOperator: 'gte' },
  { legacyField: 'operatingIncome', section: 'incomeStatementGrossProfit', defaultOperator: 'gte' },
  
  // Financial fields - Cash Flow
  { legacyField: 'operatingCashFlow', section: 'cashFlow', defaultOperator: 'gte' },
  { legacyField: 'investingCashFlow', section: 'cashFlow', defaultOperator: 'gte' },
  { legacyField: 'financingCashFlow', section: 'cashFlow', defaultOperator: 'gte' },
  
  // Financial fields - Financial Ratios
  { legacyField: 'currentRatio', section: 'financialRatios', defaultOperator: 'gte' },
  { legacyField: 'debtToEquity', section: 'financialRatios', defaultOperator: 'lte' },
  { legacyField: 'returnOnEquity', section: 'financialRatios', defaultOperator: 'gte' }
];

// Section mappings for legacy filter groups
export const SECTION_MAPPINGS: { [key: string]: string } = {
  'balanceSheetAssetsFilters': 'balanceSheetAssets',
  'incomeStatementFilters': 'incomeStatementGrossProfit', 
  'cashFlowFilters': 'cashFlow',
  'financialRatiosFilters': 'financialRatios'
};