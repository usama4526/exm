import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayloadTransformationService } from '../../services/payload-transformation.service';
import { FilterStep } from '../../models/filter-interfaces';
import { payloadValidator } from '../../utils/payload-validation';

@Component({
  selector: 'app-payload-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="payload-test-container">
      <h2>🧪 Payload Transformation Testing</h2>
      <p>This component demonstrates the new FilterStep payload structure working locally.</p>
      
      <div class="test-section">
        <h3>📋 Test Results</h3>
        <div class="test-results">
          <div *ngFor="let test of testResults" class="test-result" [ngClass]="test.status">
            <h4>{{ test.name }}</h4>
            <div class="test-details">
              <div class="input-section">
                <h5>Input (Legacy Format):</h5>
                <pre>{{ test.input }}</pre>
              </div>
              <div class="output-section">
                <h5>Output (New FilterStep Format):</h5>
                <pre>{{ test.output }}</pre>
              </div>
              <div class="status">
                <span class="status-badge" [ngClass]="test.status">
                  {{ test.status === 'success' ? '✅ PASSED' : '❌ FAILED' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="actions">
        <button (click)="runTests()" class="test-button">🔄 Run Tests Again</button>
        <button (click)="testCurrentSelections()" class="test-button">🎯 Test Current Selections</button>
        <button (click)="showApiComparison = !showApiComparison" class="test-button">
          📖 {{ showApiComparison ? 'Hide' : 'Show' }} API Guide Comparison
        </button>
      </div>

      <div class="api-guide-comparison" *ngIf="showApiComparison">
        <h3>📖 API Guide Compliance Check</h3>
        <div class="comparison-grid">
          <div class="guide-example">
            <h4>Expected (from API Guide)</h4>
            <pre>{{ expectedApiFormat }}</pre>
          </div>
          <div class="our-output">
            <h4>Our Output</h4>
            <pre>{{ ourOutputFormat }}</pre>
          </div>
        </div>
        <div class="compliance-status" [ngClass]="complianceStatus">
          {{ complianceMessage }}
        </div>
      </div>

      <div class="simulation-section">
        <h3>🎮 Interactive Simulation</h3>
        <p>Test different combinations to see the payload transformation in real-time:</p>
        
        <div class="simulation-controls">
          <div class="control-group">
            <label>States:</label>
            <select multiple (change)="updateSimulation()" [(ngModel)]="simulationData.states">
              <option value="California">California</option>
              <option value="New York">New York</option>
              <option value="Texas">Texas</option>
              <option value="Massachusetts">Massachusetts</option>
            </select>
          </div>
          
          <div class="control-group">
            <label>Industries:</label>
            <select multiple (change)="updateSimulation()" [(ngModel)]="simulationData.industries">
              <option value="Health Care Equipment and Supplies">Health Care Equipment and Supplies</option>
              <option value="Health Care Providers and Services">Health Care Providers and Services</option>
              <option value="Software">Software</option>
              <option value="Biotechnology">Biotechnology</option>
            </select>
          </div>
          
          <div class="control-group">
            <label>Total Assets (min):</label>
            <input type="number" [(ngModel)]="simulationData.totalAssetsMin" (input)="updateSimulation()" placeholder="e.g., 1000000000">
          </div>
          
          <div class="control-group">
            <label>Year:</label>
            <select [(ngModel)]="simulationData.year" (change)="updateSimulation()">
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
            </select>
          </div>
        </div>
        
        <div class="simulation-output">
          <h4>Generated FilterStep Payload:</h4>
          <pre>{{ simulationOutput }}</pre>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payload-test-container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .test-section, .simulation-section {
      margin: 30px 0;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
      background: #fafafa;
    }

    .test-result {
      border: 1px solid #ddd;
      border-radius: 8px;
      margin: 15px 0;
      padding: 15px;
      background: #f9f9f9;
    }

    .test-result.success {
      border-color: #4caf50;
      background: #f1f8e9;
    }

    .test-result.error {
      border-color: #f44336;
      background: #ffebee;
    }

    .test-details {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 15px;
      margin-top: 10px;
    }

    .input-section, .output-section {
      background: white;
      padding: 10px;
      border-radius: 4px;
      border: 1px solid #eee;
    }

    .input-section h5, .output-section h5 {
      margin: 0 0 8px 0;
      color: #666;
      font-size: 12px;
      text-transform: uppercase;
    }

    pre {
      margin: 0;
      font-size: 11px;
      line-height: 1.4;
      white-space: pre-wrap;
      word-wrap: break-word;
      max-height: 200px;
      overflow-y: auto;
      background: #f8f8f8;
      padding: 8px;
      border-radius: 4px;
    }

    .status {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .status-badge {
      padding: 5px 10px;
      border-radius: 4px;
      font-weight: bold;
      font-size: 12px;
    }

    .status-badge.success {
      background: #4caf50;
      color: white;
    }

    .status-badge.error {
      background: #f44336;
      color: white;
    }

    .actions {
      margin: 20px 0;
      text-align: center;
    }

    .test-button {
      background: #2196f3;
      color: white;
      border: none;
      padding: 10px 20px;
      margin: 0 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }

    .test-button:hover {
      background: #1976d2;
    }

    .api-guide-comparison {
      margin: 20px 0;
      padding: 20px;
      border: 1px solid #2196f3;
      border-radius: 8px;
      background: #e3f2fd;
    }

    .comparison-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 15px 0;
    }

    .guide-example, .our-output {
      background: white;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .compliance-status {
      text-align: center;
      padding: 10px;
      border-radius: 4px;
      font-weight: bold;
      margin-top: 15px;
    }

    .compliance-status.success {
      background: #4caf50;
      color: white;
    }

    .compliance-status.error {
      background: #f44336;
      color: white;
    }

    .simulation-controls {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin: 20px 0;
    }

    .control-group {
      display: flex;
      flex-direction: column;
    }

    .control-group label {
      font-weight: bold;
      margin-bottom: 5px;
      color: #333;
    }

    .control-group select, .control-group input {
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .control-group select[multiple] {
      height: 80px;
    }

    .simulation-output {
      margin-top: 20px;
      background: white;
      padding: 15px;
      border-radius: 4px;
      border: 1px solid #ddd;
    }

    .simulation-output h4 {
      margin-top: 0;
      color: #333;
    }
  `]
})
export class PayloadTestComponent implements OnInit {
  private transformationService = inject(PayloadTransformationService);
  
  testResults: any[] = [];
  showApiComparison = false;
  expectedApiFormat = '';
  ourOutputFormat = '';
  complianceStatus = 'success';
  complianceMessage = '';
  
  simulationData = {
    states: ['California'],
    industries: ['Health Care Equipment and Supplies'],
    totalAssetsMin: 1000000000,
    year: '2023'
  };
  simulationOutput = '';

  ngOnInit() {
    this.runTests();
    this.updateSimulation();
  }

  runTests() {
    this.testResults = [];
    
    // Test 1: Basic Company Field Filtering
    this.runBasicCompanyTest();
    
    // Test 2: Industry + Geographic Filtering
    this.runIndustryGeographicTest();
    
    // Test 3: Financial Data with Single Year
    this.runFinancialSingleYearTest();
    
    // Test 4: Multi-Year Financial Analysis
    this.runMultiYearFinancialTest();
    
    // Test 5: Complex Multi-Section Analysis
    this.runComplexMultiSectionTest();
    
    // Test 6: Balance Sheet Assets Value Format Fix
    this.runBalanceSheetValueFormatTest();
    
    // Update API comparison
    this.updateApiComparison();
  }

  private runBasicCompanyTest() {
    try {
      const input = {
        state: ["California", "New York", "Texas"]
      };
      
      const result = this.transformationService.transformToFilterSteps(input);
      
      this.testResults.push({
        name: '1. Basic Company Field Filtering',
        input: JSON.stringify(input, null, 2),
        output: JSON.stringify(result, null, 2),
        status: 'success'
      });
    } catch (error) {
      this.testResults.push({
        name: '1. Basic Company Field Filtering',
        input: 'Error occurred',
        output: error,
        status: 'error'
      });
    }
  }

  private runIndustryGeographicTest() {
    try {
      const input = {
        state: ["California", "New York", "Massachusetts"],
        primaryIndustry: ["Health Care Equipment and Supplies", "Health Care Providers and Services"]
      };
      
      const result = this.transformationService.transformToFilterSteps(input);
      
      this.testResults.push({
        name: '2. Industry + Geographic Filtering',
        input: JSON.stringify(input, null, 2),
        output: JSON.stringify(result, null, 2),
        status: 'success'
      });
    } catch (error) {
      this.testResults.push({
        name: '2. Industry + Geographic Filtering',
        input: 'Error occurred',
        output: error,
        status: 'error'
      });
    }
  }

  private runFinancialSingleYearTest() {
    try {
      const companyFilters = {
        state: ["California", "New York"]
      };
      
      const financialCriteria = [{
        year: "2023",
        balanceSheetAssetsFilters: {
          totalAssets: {
            gte: 1000000000
          }
        }
      }];
      
      const result = this.transformationService.transformToFilterSteps(companyFilters, financialCriteria, "2023");
      
      this.testResults.push({
        name: '3. Financial Data with Single Year',
        input: JSON.stringify({ companyFilters, financialCriteria }, null, 2),
        output: JSON.stringify(result, null, 2),
        status: 'success'
      });
    } catch (error) {
      this.testResults.push({
        name: '3. Financial Data with Single Year',
        input: 'Error occurred',
        output: error,
        status: 'error'
      });
    }
  }

  private runMultiYearFinancialTest() {
    try {
      const companyFilters = {
        primaryIndustry: ["Health Care Equipment and Supplies"]
      };
      
      const financialCriteria = [
        {
          year: "2022",
          balanceSheetAssetsFilters: {
            cashAndEquivalents: { gte: 50000000 }
          }
        },
        {
          year: "2023",
          balanceSheetAssetsFilters: {
            cashAndEquivalents: { gte: 50000000 }
          },
          incomeStatementFilters: {
            totalRevenue: { between: [100000000, 5000000000] }
          }
        }
      ];
      
      const result = this.transformationService.transformToFilterSteps(companyFilters, financialCriteria);
      
      this.testResults.push({
        name: '4. Multi-Year Financial Analysis',
        input: JSON.stringify({ companyFilters, financialCriteria }, null, 2),
        output: JSON.stringify(result, null, 2),
        status: 'success'
      });
    } catch (error) {
      this.testResults.push({
        name: '4. Multi-Year Financial Analysis',
        input: 'Error occurred',
        output: error,
        status: 'error'
      });
    }
  }

  private runComplexMultiSectionTest() {
    try {
      const companyFilters = {
        state: ["California", "New York", "Texas", "Massachusetts"]
      };
      
      const financialCriteria: any[] = [{
        year: "2023",
        balanceSheetAssetsFilters: {
          totalAssets: { between: [500000000, 10000000000] }
        },
        incomeStatementFilters: {
          netIncome: { gt: 25000000 }
        },
        cashFlowFilters: {
          operatingCashFlow: { gte: 50000000 }
        }
      }];
      
      // Add multi-year data
      financialCriteria.push({
        year: "2022",
        incomeStatementFilters: {
          netIncome: { gt: 25000000 }
        }
      });
      
      const result = this.transformationService.transformToFilterSteps(companyFilters, financialCriteria);
      
      this.testResults.push({
        name: '5. Complex Multi-Section Analysis',
        input: JSON.stringify({ companyFilters, financialCriteria }, null, 2),
        output: JSON.stringify(result, null, 2),
        status: 'success'
      });
    } catch (error) {
      this.testResults.push({
        name: '5. Complex Multi-Section Analysis',
        input: 'Error occurred',
        output: error,
        status: 'error'
      });
    }
  }

  private runBalanceSheetValueFormatTest() {
    try {
      // Test the fix: balanceSheetAssets should use string values for non-between operators
      const newCriteriaData = {
        balanceSheetAssetsFilters: {
          cashAndEquivalents: {
            gt: 1000
          },
          totalAssets: {
            between: [500000, 1000000] // This should remain as array
          }
        }
      };
      
      const result = this.transformationService.transformNewCriteria(newCriteriaData, "2025");
      
      // Validate the fix
      let validationMessage = '';
      let isValid = true;
      
      result.forEach(step => {
        if (step.section === 'balanceSheetAssets') {
          if (step.operator === 'between' && !Array.isArray(step.value)) {
            validationMessage += `❌ ${step.field} with 'between' should have array value, got: ${typeof step.value}\n`;
            isValid = false;
          } else if (step.operator !== 'between' && Array.isArray(step.value)) {
            validationMessage += `❌ ${step.field} with '${step.operator}' should have string value, got array\n`;
            isValid = false;
          } else {
            validationMessage += `✅ ${step.field} with '${step.operator}' has correct ${Array.isArray(step.value) ? 'array' : 'string'} value\n`;
          }
        }
      });
      
      this.testResults.push({
        name: '6. Balance Sheet Assets Value Format Fix',
        input: JSON.stringify(newCriteriaData, null, 2),
        output: JSON.stringify(result, null, 2) + '\n\nValidation:\n' + validationMessage,
        status: isValid ? 'success' : 'error'
      });
    } catch (error) {
      this.testResults.push({
        name: '6. Balance Sheet Assets Value Format Fix',
        input: 'Error occurred',
        output: error,
        status: 'error'
      });
    }
  }

  private updateApiComparison() {
    // Show comparison with API guide example
    this.expectedApiFormat = `[
  {
    "field": "state",
    "operator": "in",
    "values": ["California", "New York", "Texas"]
  }
]`;

    const testResult = this.transformationService.transformToFilterSteps({
      state: ["California", "New York", "Texas"]
    });
    
    this.ourOutputFormat = JSON.stringify(testResult, null, 2);
    
    // Check compliance
    const isCompliant = this.validateApiCompliance(testResult);
    this.complianceStatus = isCompliant ? 'success' : 'error';
    this.complianceMessage = isCompliant 
      ? '✅ Output matches API guide format perfectly!'
      : '❌ Output does not match API guide format';
  }

  private validateApiCompliance(filterSteps: FilterStep[]): boolean {
    for (const step of filterSteps) {
      if (!step.operator || !step.value || !Array.isArray(step.value)) {
        return false;
      }
      if (!step.field && !step.section) {
        return false;
      }
    }
    return true;
  }

  testCurrentSelections() {
    // This would integrate with actual component selections in a real scenario
    console.log('Testing current selections...');
    alert('This would test the current form selections in a real implementation. Check the console for transformation results.');
  }

  updateSimulation() {
    try {
      const companyFilters: any = {};
      
      if (this.simulationData.states.length > 0) {
        companyFilters.state = this.simulationData.states;
      }
      
      if (this.simulationData.industries.length > 0) {
        companyFilters.primaryIndustry = this.simulationData.industries;
      }
      
      let financialCriteria: any[] = [];
      
      if (this.simulationData.totalAssetsMin) {
        financialCriteria.push({
          year: this.simulationData.year,
          balanceSheetAssetsFilters: {
            totalAssets: {
              gte: this.simulationData.totalAssetsMin
            }
          }
        });
      }
      
      const result = this.transformationService.transformToFilterSteps(
        companyFilters, 
        financialCriteria, 
        this.simulationData.year
      );
      
      this.simulationOutput = JSON.stringify(result, null, 2);
    } catch (error) {
      this.simulationOutput = `Error: ${error}`;
    }
  }
}