import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  FilterStep,
  FilterResponseDto,
  PagedResponse,
  CompanyGridResponseDto,
} from "../models/filter-interfaces";

export interface AumYearData {
  periodEnded: string | null;
  assetsUnderManagementMillion: string | null;
  growthRate: string | null;
}

export interface InvestmentFirmProfile {
  companyId: string;
  companyName: string;
  entityName: string;
  aumData: {
    year2024: AumYearData;
    year2023: AumYearData;
    year2022: AumYearData;
  };
  corporateData: {
    monthOfYearEnd: string | null;
    investorType: string | null;
    fundTypesManaged: string[];
    categories: string[];
    localRegistryId: string | null;
    dateOfIncorporation: string | null;
    sicCode: string | null;
    naicsCode: string | null;
  };
  contactData: {
    headquarters: string | null;
    phone: string | null;
    webAddress: string | null;
  };
  companyDescription: string | null;
}

@Injectable({ providedIn: "root" })
export class ApiService {
  // Use relative URLs for Amplify proxy, absolute for local development
  private baseUrl = "http://13.59.44.96:8083/api"

  constructor(private http: HttpClient) {}

  /**
   * Get HTTP options with proper headers for API calls
   */
  private getHttpOptions() {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Origin': window.location.origin,
        'X-Requested-With': 'XMLHttpRequest'
      }
    };
  }

  /**
   * New Progressive Counts API - Get step-by-step filtering counts
   */
  getProgressiveCounts(
    filterSteps: FilterStep[]
  ): Observable<FilterResponseDto> {
    return this.http.post<FilterResponseDto>(
      `${this.baseUrl}/companies/financial-screening/progressive-counts`,
      filterSteps,
      this.getHttpOptions()
    );
  }

  /**
   * Investor Counts API - Get counts for investor criteria
   */
  getInvestorCounts(
    filterSteps: FilterStep[]
  ): Observable<FilterResponseDto> {
    return this.http.post<FilterResponseDto>(
      `${this.baseUrl}/companies/financial-screening/invst-counts`,
      filterSteps,
      this.getHttpOptions()
    );
  }

  /**
   * New Company Search API - Get actual company data with pagination
   */
  searchCompanies(
    filterSteps: FilterStep[],
    pageNo: number = 1,
    pageSize: number = 10
  ): Observable<PagedResponse<CompanyGridResponseDto>> {
    return this.http.post<PagedResponse<CompanyGridResponseDto>>(
      `${this.baseUrl}/companies/financial-screening/search-detailed?pageNo=${pageNo}&pageSize=${pageSize}`,
      filterSteps,
      this.getHttpOptions()
    );
  }

  /**
   * New Investors Search API - Get actual investor data with pagination
   */
  searchInvestors(
    filterSteps: FilterStep[],
    pageNo: number = 1,
    pageSize: number = 10
  ): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}/companies/financial-screening/search?pageNo=${pageNo}&pageSize=${pageSize}`,
      filterSteps,
      this.getHttpOptions()
    );
  }

  getCompanyBusinessInfo(ticker: string): Observable<any> {
    return this.http.get(
      `https://zwb4vdb40c.execute-api.us-east-2.amazonaws.com/dev/api/business-info/${ticker}`
    );
  }

  /**
   * Legacy methods - kept for backward compatibility during transition
   * @deprecated Use getProgressiveCounts instead
   */
  getCount(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/filter-counts`, payload, this.getHttpOptions());
  }

  /**
   * @deprecated Use searchCompanies instead
   */
  getCompanyCluster(
    payload: any,
    pageNo: number,
    pageSize: number
  ): Observable<any> {
    return this.http.post(
      `${this.baseUrl}/get-company-cluster?pageNo=${pageNo}&pageSize=${pageSize}`,
      payload,
      this.getHttpOptions()
    );
  }

  /**
   * Get individual company by ID
   */
  getCompanyById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/companies/id/${id}`);
  }

  /**
   * Get balance sheet data by period (via netlify function)
   */
  getBalanceSheetDataByPeriod(
    companyTicker: string,
    min: number,
    max: number
  ): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/balance-sheet/${companyTicker}?start=${min}&end=${max}`
    );
  }

  /**
   * Get cash flows data by period (via netlify function)
   */
  getCashFlowsDataByPeriod(
    companyTicker: string,
    min: number,
    max: number
  ): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/cash-flows/${companyTicker}?start=${min}&end=${max}`
    );
  }

  /**
   * Get income statement data by period (via netlify function)
   */
  getIncomeStatementDataByPeriod(
    companyTicker: string,
    min: number,
    max: number
  ): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/income-statement/${companyTicker}?start=${min}&end=${max}`
    );
  }

  getPerformanceAnalysisData(
    companyTicker: string,
    min: number,
    max: number
  ): Observable<any> {
    return this.http.get(
      `${this.baseUrl}/performance-analysis/${companyTicker}?start=${min}&end=${max}`
    );
  }

  /**
   * Get investment firm profile by ID
   */
  getInvestmentFirmProfile(id: string): Observable<InvestmentFirmProfile> {
    return this.http.get<InvestmentFirmProfile>(
      `${this.baseUrl}/companies/investment_firm/${id}`
    );
  }
}
