import { Injectable } from "@angular/core";
import {
  FilterStep,
  LegacyCompanyFilters,
  LegacyFinancialCriteria,
  FIELD_MAPPINGS,
  SECTION_MAPPINGS,
  OPERATOR_MAP,
} from "../models/filter-interfaces";

@Injectable({
  providedIn: "root",
})
export class PayloadTransformationService {
  constructor() {}

  /**
   * Transform legacy payload to new FilterStep array format
   */
  transformToFilterSteps(
    companyFilters: LegacyCompanyFilters = {},
    financialCriteria: LegacyFinancialCriteria[] = [],
    currentYear?: string
  ): FilterStep[] {
    const filterSteps: FilterStep[] = [];

    // Transform company filters
    this.transformCompanyFilters(companyFilters, filterSteps);

    // Transform financial criteria
    this.transformFinancialCriteria(
      financialCriteria,
      filterSteps,
      currentYear
    );

    return filterSteps;
  }

  /**
   * Transform company filters (locations, sectors, company types, etc.)
   */
  private transformCompanyFilters(
    companyFilters: LegacyCompanyFilters,
    filterSteps: FilterStep[]
  ): void {
    Object.keys(companyFilters).forEach((legacyField) => {
      const values = companyFilters[legacyField];
      if (!values || !Array.isArray(values) || values.length === 0) {
        return;
      }

      const mapping = FIELD_MAPPINGS.find((m) => m.legacyField === legacyField);
      if (!mapping) {
        console.warn(`No mapping found for legacy field: ${legacyField}`);
        return;
      }

      const filterStep: FilterStep = {
        section: "company",
        field: mapping.newField || legacyField,
        operator: mapping.defaultOperator,
        value: values.map((v) => String(v)),
      };

      filterSteps.push(filterStep);
    });
  }

  /**
   * Transform financial criteria with sections and years
   */
  private transformFinancialCriteria(
    financialCriteria: LegacyFinancialCriteria[],
    filterSteps: FilterStep[],
    currentYear?: string
  ): void {
    financialCriteria.forEach((criteria) => {
      const year = criteria.year || currentYear;
      const years = year && year !== 'undefined' && year !== 'null' ? [parseInt(year)] : undefined;

      Object.keys(criteria).forEach((key) => {
        if (key === "year") return;

        const filterGroup = criteria[key];
        const section = SECTION_MAPPINGS[key];

        if (!section) {
          console.warn(`No section mapping found for filter group: ${key}`);
          return;
        }

        this.transformFilterGroup(filterGroup, section, years, filterSteps);
      });
    });
  }

  /**
   * Transform individual filter group (e.g., balanceSheetAssetsFilters)
   */
  private transformFilterGroup(
    filterGroup: any,
    section: string,
    years: number[] | undefined,
    filterSteps: FilterStep[]
  ): void {
    Object.keys(filterGroup).forEach((fieldName) => {
      const fieldData = filterGroup[fieldName];

      Object.keys(fieldData).forEach((operator) => {
        const value = fieldData[operator];

        const filterStep: FilterStep = {
          section: section,
          field: fieldName,
          operator: operator,
          value: Array.isArray(value)
            ? value.map((v) => String(v))
            : [String(value)],
        };

        // Only add years field if it has a valid value
        if (years && years.length > 0) {
          filterStep.years = years;
        }

        filterSteps.push(filterStep);
      });
    });
  }

  /**
   * Transform sector selection to FilterStep
   */
  transformSectorSelection(sectorSelection: {
    GICS_PRIMARY_INDUSTRY?: string[];
  }): FilterStep[] {
    const filterSteps: FilterStep[] = [];

    if (
      sectorSelection.GICS_PRIMARY_INDUSTRY &&
      sectorSelection.GICS_PRIMARY_INDUSTRY.length > 0
    ) {
      filterSteps.push({
        section: "company",
        field: "primaryIndustry",
        operator: "in",
        value: sectorSelection.GICS_PRIMARY_INDUSTRY,
      });
    }

    return filterSteps;
  }

  /**
   * Transform location selection to FilterStep
   */
  transformLocationSelection(locationSelection: any): FilterStep[] {
    const filterSteps: FilterStep[] = [];

    if (!locationSelection || !locationSelection.grouped) {
      return filterSteps;
    }

    const grouped = locationSelection.grouped;

    // Transform state selections
    if (grouped.STATE && grouped.STATE.length > 0) {
      filterSteps.push({
        section: "company",
        field: "state",
        operator: "in",
        value: grouped.STATE,
      });
    }

    // Transform province selections
    if (grouped.PROVINCE && grouped.PROVINCE.length > 0) {
      filterSteps.push({
        section: "company",
        field: "province",
        operator: "in",
        value: grouped.PROVINCE,
      });
    }

    // Transform country selections
    if (grouped.COUNTRY_NAME && grouped.COUNTRY_NAME.length > 0) {
      filterSteps.push({
        section: "company",
        field: "countryName",
        operator: "in",
        value: grouped.COUNTRY_NAME,
      });
    }

    // Transform US region selections
    if (grouped.US_REGION && grouped.US_REGION.length > 0) {
      filterSteps.push({
        section: "company",
        field: "usRegion",
        operator: "in",
        value: grouped.US_REGION,
      });
    }

    // Transform geography selections
    if (grouped.GEOGRAPHY && grouped.GEOGRAPHY.length > 0) {
      filterSteps.push({
        section: "company",
        field: "geography",
        operator: "in",
        value: grouped.GEOGRAPHY,
      });
    }

    return filterSteps;
  }

  /**
   * Transform company type and status selections to FilterStep
   */
  transformCompanyTypeSelection(
    companyType: { COMPANY_TYPE?: string[] },
    companyStatus: { COMPANY_STATUS?: string[] }
  ): FilterStep[] {
    const filterSteps: FilterStep[] = [];

    if (companyType?.COMPANY_TYPE && companyType.COMPANY_TYPE.length > 0) {
      filterSteps.push({
        section: "company",
        field: "companyType",
        operator: "in",
        value: companyType.COMPANY_TYPE,
      });
    }

    if (
      companyStatus?.COMPANY_STATUS &&
      companyStatus.COMPANY_STATUS.length > 0
    ) {
      filterSteps.push({
        section: "company",
        field: "companyStatus",
        operator: "in",
        value: companyStatus.COMPANY_STATUS,
      });
    }

    return filterSteps;
  }

  /**
   * Transform financial metrics selection to FilterStep
   */
  transformFinancialMetrics(
    financialMetrics: any,
    currentYear?: string
  ): FilterStep[] {
    const filterSteps: FilterStep[] = [];
    const years = currentYear
      ? [parseInt(currentYear)]
      : [new Date().getFullYear()];

    // Map legacy financial metric keys to new structure
    const financialFieldMap: {
      [key: string]: { section: string; field: string };
    } = {
      TOTAL_REVENUE__LATEST_FISCAL_YEAR____000__1: {
        section: "incomeStatement",
        field: "totalRevenue",
      },
      EBITDA__LATEST_FISCAL_YEAR____000__1: {
        section: "incomeStatement",
        field: "ebitda",
      },
      NET_INCOME__LATEST_FISCAL_YEAR____000__1: {
        section: "incomeStatement",
        field: "netIncome",
      },
      ENTERPRISE_VALUE__LATEST_FISCAL_YEAR____000__1: {
        section: "financialRatios",
        field: "enterpriseValue",
      },
      FISCAL_PERIOD__1: { section: "incomeStatement", field: "fiscalPeriod" },
    };

    Object.keys(financialMetrics).forEach((key) => {
      const metric = financialMetrics[key];
      const mapping = financialFieldMap[key];

      if (!mapping || !metric) {
        return;
      }

      // Handle range values (min/max)
      if (metric.min != null && metric.max != null) {
        const filterStep: FilterStep = {
          section: mapping.section,
          field: mapping.field,
          operator: "between",
          value: [String(metric.min), String(metric.max)],
        };
        if (years && years.length > 0) {
          filterStep.years = years;
        }
        filterSteps.push(filterStep);
      } else if (metric.min != null) {
        const filterStep: FilterStep = {
          section: mapping.section,
          field: mapping.field,
          operator: "gte",
          value: [String(metric.min)],
        };
        if (years && years.length > 0) {
          filterStep.years = years;
        }
        filterSteps.push(filterStep);
      } else if (metric.max != null) {
        const filterStep: FilterStep = {
          section: mapping.section,
          field: mapping.field,
          operator: "lte",
          value: [String(metric.max)],
        };
        if (years && years.length > 0) {
          filterStep.years = years;
        }
        filterSteps.push(filterStep);
      }
    });

    return filterSteps;
  }

  /**
   * Transform new criteria (from dropdown selection) to FilterStep
   */
  transformNewCriteria(
    newCriteriaPayloadData: any,
    currentYear?: string
  ): FilterStep[] {
    const filterSteps: FilterStep[] = [];

    // DEBUG: Log the input parameters
    // console.log("🔍 DEBUG: transformNewCriteria called with:");
    // console.log("🔍 DEBUG: newCriteriaPayloadData:", newCriteriaPayloadData);
    // console.log("🔍 DEBUG: currentYear:", currentYear);
    // console.log("🔍 DEBUG: currentYear type:", typeof currentYear);

    // FIX: Provide fallback year for financial criteria if none provided
    let effectiveYear = currentYear;
    if (
      !effectiveYear ||
      effectiveYear === "undefined" ||
      effectiveYear === "null"
    ) {
      // Default to current year for financial criteria
      effectiveYear = new Date().getFullYear().toString();
      // console.log(
      //   "🔧 FIX: Using fallback year for financial criteria:",
      //   effectiveYear
      // );
    }

    // Extract numeric year from formats like "FY2024", "2024", etc.
    let processedYear: number | undefined;
    if (effectiveYear) {
      const yearMatch = effectiveYear.match(/(\d{4})/);
      if (yearMatch) {
        processedYear = parseInt(yearMatch[1]);
        console.log(
          "🔧 FIX: Extracted year from format:",
          effectiveYear,
          "->",
          processedYear
        );
      } else {
        // Try to parse as direct number
        const parsed = parseInt(effectiveYear);
        if (!isNaN(parsed)) {
          processedYear = parsed;
          console.log(
            "🔧 FIX: Parsed year directly:",
            effectiveYear,
            "->",
            processedYear
          );
        }
      }
    }

    // Only set years if we have a valid processed year
    const years = processedYear ? [processedYear] : undefined;

    // DEBUG: Log the processed years
    // console.log("🔍 DEBUG: Processed years array:", years);

    Object.keys(newCriteriaPayloadData).forEach((sectionKey) => {
      // Handle both formats: with and without "Filters" suffix
      const cleanSectionKey = sectionKey.replace(/Filters$/, "");
      const section = SECTION_MAPPINGS[sectionKey] || SECTION_MAPPINGS[cleanSectionKey] || cleanSectionKey;
      const sectionData = newCriteriaPayloadData[sectionKey];

      // console.log(
      //   `🔍 DEBUG: Processing section '${sectionKey}' -> '${section}':`,
      //   sectionData
      // );

      Object.keys(sectionData).forEach((fieldName) => {
        const fieldData = sectionData[fieldName];

        // console.log(`🔍 DEBUG: Processing field '${fieldName}':`, fieldData);

        Object.keys(fieldData).forEach((operator) => {
          const value = fieldData[operator];

          // Preserve arrays for 'between' and 'in'; otherwise use single string
          let processedValue: string | string[];
          if (operator === "between") {
            processedValue = Array.isArray(value)
              ? value.map((v) => String(v))
              : [String(value)];
          } else if (operator === "in") {
            processedValue = Array.isArray(value)
              ? value.map((v) => String(v))
              : [String(value)];
          } else {
            processedValue = Array.isArray(value)
              ? String(value[0])
              : String(value);
          }

          const filterStep: FilterStep = {
            section: section,
            field: fieldName,
            operator: operator,
            value: processedValue,
          };

          // Only add years for non-company sections
          if (section !== "company" && years && years.length > 0) {
            filterStep.years = years;
          }

          filterSteps.push(filterStep);
        });
      });
    });

    console.log("🔍 DEBUG: Final filterSteps array:", filterSteps);
    return filterSteps;
  }

  /**
   * Combine all filter steps and remove duplicates
   */
  combineFilterSteps(...filterStepArrays: FilterStep[][]): FilterStep[] {
    const allSteps = filterStepArrays.flat();

    // Remove duplicates based on field/section + operator + values combination
    const uniqueSteps = allSteps.filter((step, index, array) => {
      return (
        index ===
        array.findIndex(
          (s) =>
            s.field === step.field &&
            s.section === step.section &&
            s.operator === step.operator &&
            JSON.stringify(s.value) === JSON.stringify(step.value) &&
            JSON.stringify(s.years) === JSON.stringify(step.years)
        )
      );
    });

    return uniqueSteps;
  }

  /**
   * Convert operator display text to API operator
   */
  convertOperator(displayOperator: string): string {
    return OPERATOR_MAP[displayOperator] || displayOperator;
  }
}
