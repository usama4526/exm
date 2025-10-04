import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { ApiService } from "../../services/api.service";
import { CriteriaComponent } from "../../components/criteria/criteria.component";

import { NestedCheckboxesComponent } from "../../components/nested-checkboxes/nested-checkboxes.component";

@Component({
  selector: "app-locations",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NestedCheckboxesComponent
],
  templateUrl: "./locations.component.html",
  styleUrl: "./locations.component.scss",
})
export class LocationsComponent {
  constructor(private apiService: ApiService) {
    this.ensureKeyValueOnLeaves();
  }

  selectAllChecked: boolean = false;

  locationsData: any =  [
    {
      name: "United States and Canada",
      checked: false,
      expanded: true,
      keyValue: "GEOGRAPHY",
      value: "United States and Canada",
      children: [
        {
          name: "USA",
          checked: false,
          expanded: false,
          keyValue: "COUNTRY_NAME",
          value: "USA",
          children: [
            {
              name: "Mid Atlantic",
              value: "Mid Atlantic",
              checked: false,
              expanded: true,
              keyValue: "US_REGION",
              children: [
                {
                  name: "Delaware",
                  value: "Delaware",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "District of Columbia",
                  value: "District of Columbia",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Maryland",
                  value: "Maryland",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "New Jersey",
                  value: "New Jersey",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "New York",
                  value: "New York",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Pennsylvania",
                  value: "Pennsylvania",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Puerto Rico",
                  value: "Puerto Rico",
                  checked: false,
                  keyValue: "STATE",
                },
              ],
            },
            {
              name: "Mid West",
              value: "Mid West",
              checked: false,
              expanded: false,
              keyValue: "US_REGION",
              children: [
                {
                  name: "Illinois",
                  value: "Illinois",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Indiana",
                  value: "Indiana",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Iowa",
                  value: "Iowa",
                  checked: false,
                  keyValue: "STATE",
                }, // Note: should be "Iowa"?
                {
                  name: "Kansas",
                  value: "Kansas",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Kentucky",
                  value: "Kentucky",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Michigan",
                  value: "Michigan",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Minnesota",
                  value: "Minnesota",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Missouri",
                  value: "Missouri",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Nebraska",
                  value: "Nebraska",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "North Dakota",
                  value: "North Dakota",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Ohio",
                  value: "Ohio",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "South Dakota",
                  value: "South Dakota",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Wisconsin",
                  value: "Wisconsin",
                  checked: false,
                  keyValue: "STATE",
                },
              ],
            },
            {
              name: "North East",
              value: "North East",
              checked: false,
              expanded: false,
              keyValue: "US_REGION",
              children: [
                {
                  name: "Connecticut",
                  value: "Connecticut",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Maine",
                  value: "Maine",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Massachusetts",
                  value: "Massachusetts",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "New Hampshire",
                  value: "New Hampshire",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Rhode Island",
                  value: "Rhode Island",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Vermont",
                  value: "Vermont",
                  checked: false,
                  keyValue: "STATE",
                },
              ],
            },
            {
              name: "South East",
              value: "South East",
              checked: false,
              expanded: false,
              keyValue: "US_REGION",
              children: [
                {
                  name: "Alabama",
                  value: "Alabama",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Arkansas",
                  value: "Arkansas",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Florida",
                  value: "Florida",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Georgia",
                  value: "Georgia",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Mississippi",
                  value: "Mississippi",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "North Carolina",
                  value: "North Carolina",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "South Carolina",
                  value: "South Carolina",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Tennessee",
                  value: "Tennessee",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Virgin Islands, U.S.",
                  value: "Virgin Islands, U.S.",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Virginia",
                  value: "Virginia",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "West Virginia",
                  value: "West Virginia",
                  checked: false,
                  keyValue: "STATE",
                },
              ],
            },
            {
              name: "South West",
              value: "South West",
              checked: false,
              expanded: false,
              keyValue: "US_REGION",
              children: [
                {
                  name: "Colorado",
                  value: "Colorado",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Louisiana",
                  value: "Louisiana",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "New Mexico",
                  value: "New Mexico",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Oklahoma",
                  value: "Oklahoma",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Texas",
                  value: "Texas",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Utah",
                  value: "Utah",
                  checked: false,
                  keyValue: "STATE",
                },
              ],
            },
            {
              name: "West",
              value: "West",
              checked: false,
              expanded: false,
              keyValue: "US_REGION",
              children: [
                {
                  name: "Alaska",
                  value: "Alaska",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "American Samoa",
                  value: "American Samoa",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Arizona",
                  value: "Arizona",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "California",
                  value: "California",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Guam",
                  value: "Guam",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Hawaii",
                  value: "Hawaii",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Idaho",
                  value: "Idaho",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Montana",
                  value: "Montana",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Nevada",
                  value: "Nevada",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Northern Mariana Islands",
                  value: "Northern Mariana Islands",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Oregon",
                  value: "Oregon",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "United States Minor Outlying Islands",
                  value: "United States Minor Outlying Islands",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Washington",
                  value: "Washington",
                  checked: false,
                  keyValue: "STATE",
                },
                {
                  name: "Wyoming",
                  value: "Wyoming",
                  checked: false,
                  keyValue: "STATE",
                },
              ],
            },
          ],
        },

        {
          name: "Canada",
          checked: false,
          expanded: false,
          keyValue: "COUNTRY_NAME",
          children: [
            { name: "Alberta", checked: false, keyValue: "STATE" },
            { name: "British Columbia", checked: false, keyValue: "STATE" },
            { name: "Manitoba", checked: false, keyValue: "STATE" },
            { name: "New Brunswick", checked: false, keyValue: "STATE" },
            {
              name: "Newfoundland and Labrador",
              checked: false,
              keyValue: "STATE",
            },
            {
              name: "Northwest Territories",
              checked: false,
              keyValue: "STATE",
            },
            { name: "Nova Scotia", checked: false, keyValue: "STATE" },
            { name: "Nunavut", checked: false, keyValue: "STATE" },
            { name: "Ontario", checked: false, keyValue: "STATE" },
            {
              name: "Prince Edward Island",
              checked: false,
              keyValue: "STATE",
            },
            { name: "Quebec", checked: false, keyValue: "STATE" },
            { name: "Saskatchewan", checked: false, keyValue: "STATE" },
            { name: "Yukon Territory", checked: false, keyValue: "STATE" },
          ],
        },
        // {
        //   name: "Bermuda",
        //   checked: false,
        //   expanded: false,
        //   keyValue: "COUNTRY_NAME",
        // },
      ],
    },
    {
      name: "Latin America and Caribbean",
      checked: false,
      expanded: true,
      keyValue: "COUNTRY_NAME",
      children: [
        {
          name: "Caribbean",
          checked: false,
          expanded: false,
          children: [
            { name: "Anguilla", checked: false },
            { name: "Antigua and Barbuda", checked: false },
            { name: "Aruba", checked: false },
            { name: "Bahamas, The", checked: false },
            { name: "Barbados", checked: false },
            { name: "British Virgin Islands", checked: false },
            { name: "Cayman Islands", checked: false },
            { name: "Cuba", checked: false },
            { name: "Dominica", checked: false },
            { name: "Dominican Republic", checked: false },
            { name: "Grenada", checked: false },
            { name: "Guadeloupe", checked: false },
            { name: "Haiti", checked: false },
            { name: "Jamaica", checked: false },
            { name: "Martinique", checked: false },
            { name: "Montserrat", checked: false },
            { name: "Puerto Rico", checked: false },
            { name: "Saint Barthelemy", checked: false },
            { name: "Saint Kitts and Nevis", checked: false },
            { name: "Saint Lucia", checked: false },
            { name: "Saint Martin", checked: false },
            { name: "Saint Vincent & The Grenadines", checked: false },
            { name: "Sint Maarten", checked: false },
            { name: "Trinidad and Tobago", checked: false },
            { name: "Turks and Caicos Islands", checked: false },
            { name: "U.S. Virgin Islands", checked: false },
          ],
        },
        {
          name: "Central America & Mexico",
          checked: false,
          expanded: false,
         
          children: [
            { name: "Belize", checked: false },
            { name: "Costa Rica", checked: false },
            { name: "El Salvador", checked: false },
            { name: "Guatemala", checked: false },
            { name: "Honduras", checked: false },
            { name: "Mexico", checked: false },
            { name: "Nicaragua", checked: false },
            { name: "Panama", checked: false },
          ],
        },
        {
          name: "South America",
          checked: false,
          expanded: false,
          children: [
            { name: "Argentina", checked: false },
            { name: "Bolivia", checked: false },
            { name: "Brazil", checked: false },
            { name: "Chile", checked: false },
            { name: "Colombia", checked: false },
            { name: "Ecuador", checked: false },
            { name: "Falkland Islands", checked: false },
            { name: "French Guiana", checked: false },
            { name: "Guyana", checked: false },
            { name: "Paraguay", checked: false },
            { name: "Peru", checked: false },
            { name: "Suriname", checked: false },
            { name: "Uruguay", checked: false },
            { name: "Venezuela", checked: false },
          ],
        },
      ],
    },
    {
      name: "Europe",
      checked: false,
      expanded: true,
      keyValue: "COUNTRY_NAME",
      children: [
        {
          name: "Developed Markets",
          checked: false,
          expanded: false,
          children: [
            { name: "Andorra", checked: false },
            { name: "Austria", checked: false },
            { name: "Belgium", checked: false },
            { name: "Channel Islands", checked: false },
            { name: "Denmark", checked: false },
            { name: "Finland", checked: false },
            { name: "France", checked: false },
            { name: "Germany", checked: false },
            { name: "Gibraltar", checked: false },
            { name: "Greece", checked: false },
            { name: "Iceland", checked: false },
            { name: "Ireland", checked: false },
            { name: "Isle of Man", checked: false },
            { name: "Italy", checked: false },
            { name: "Liechtenstein", checked: false },
            { name: "Luxembourg", checked: false },
            { name: "Monaco", checked: false },
            { name: "Netherlands", checked: false },
            { name: "Norway", checked: false },
            { name: "Portugal", checked: false },
            { name: "San Marino", checked: false },
            { name: "Spain", checked: false },
            { name: "Sweden", checked: false },
            { name: "Switzerland", checked: false },
            { name: "United Kingdom", checked: false },
          ],
        },
        {
          name: "Emerging Markets",
          checked: false,
          expanded: false,
          children: [
            { name: "Albania", checked: false },
            { name: "Belarus", checked: false },
            { name: "Bosnia and Herzegovina", checked: false },
            { name: "Bulgaria", checked: false },
            { name: "Croatia", checked: false },
            { name: "Czech Republic", checked: false },
            { name: "Estonia", checked: false },
            { name: "Hungary", checked: false },
            { name: "Kosovo", checked: false },
            { name: "Latvia", checked: false },
            { name: "Lithuania", checked: false },
            { name: "Macedonia", checked: false },
            { name: "Malta", checked: false },
            { name: "Moldova", checked: false },
            { name: "Montenegro", checked: false },
            { name: "Poland", checked: false },
            { name: "Romania", checked: false },
            { name: "Russia", checked: false },
            { name: "Serbia", checked: false },
            { name: "Slovakia", checked: false },
            { name: "Slovenia", checked: false },
            { name: "Ukraine", checked: false },
          ],
        },
      ],
    },
    {
      name: "Asia/Pacific",
      checked: false,
      expanded: true,
      keyValue: "COUNTRY_NAME",
      children: [
        {
          name: "Developed Markets",
          checked: false,
          expanded: false,
          children: [
            { name: "Australia", checked: false },
            { name: "Hong Kong", checked: false },
            { name: "Japan", checked: false },
            { name: "Korea, South", checked: false },
            { name: "Singapore", checked: false },
            { name: "Taiwan", checked: false },
          ],
        },
        {
          name: "Emerging Markets",
          checked: false,
          expanded: false,
          children: [
            {
              name: "Central Asia",
              checked: false,
              expanded: true,
              children: [
                { name: "Afghanistan", checked: false },
                { name: "Armenia", checked: false },
                { name: "Azerbaijan", checked: false },
                { name: "Georgia", checked: false },
                { name: "Iran", checked: false },
                { name: "Kazakhstan", checked: false },
                { name: "Kyrgyzstan", checked: false },
                { name: "Mongolia", checked: false },
                { name: "Tajikistan", checked: false },
                { name: "Turkmenistan", checked: false },
                { name: "Uzbekistan", checked: false },
              ],
            },
            {
              name: "East Asia",
              checked: false,
              expanded: true,
              children: [
                { name: "China", checked: false },
                { name: "Korea, North", checked: false },
                { name: "Macau", checked: false },
                { name: "Mongolia", checked: false },
              ],
            },
            {
              name: "Indian Sub-Continent",
              checked: false,
              expanded: true,
              children: [
                { name: "Bangladesh", checked: false },
                { name: "Bhutan", checked: false },
                { name: "India", checked: false },
                { name: "Maldives", checked: false },
                { name: "Nepal", checked: false },
                { name: "Pakistan", checked: false },
                { name: "Sri Lanka", checked: false },
              ],
            },
            {
              name: "Pacific Islands",
              checked: false,
              expanded: true,
              children: [
                { name: "Fiji", checked: false },
                { name: "French Polynesia", checked: false },
                { name: "Kiribati", checked: false },
                { name: "Micronesia", checked: false },
                { name: "New Caledonia", checked: false },
                { name: "Papua New Guinea", checked: false },
                { name: "Solomon Islands", checked: false },
                { name: "Tonga", checked: false },
                { name: "Tuvalu", checked: false },
                { name: "Vanuatu", checked: false },
                { name: "Western Samoa", checked: false },
              ],
            },
            {
              name: "South East Asia",
              checked: false,
              expanded: true,
              children: [
                { name: "Brunei", checked: false },
                { name: "Cambodia", checked: false },
                { name: "East Timor", checked: false },
                { name: "Indonesia", checked: false },
                { name: "Laos", checked: false },
                { name: "Malaysia", checked: false },
                { name: "Myanmar", checked: false },
                { name: "Philippines", checked: false },
                { name: "Thailand", checked: false },
                { name: "Vietnam", checked: false },
              ],
            },
          ],
        },
      ],
    },
    {
      name: "Africa/Middle East",
      checked: false,
      expanded: true,
      keyValue: "COUNTRY_NAME",
      children: [
        {
          name: "Middle East",
          checked: false,
          expanded: false,
          children: [
            { name: "Bahrain", checked: false },
            { name: "Cyprus", checked: false },
            { name: "Iraq", checked: false },
            { name: "Israel", checked: false },
            { name: "Jordan", checked: false },
            { name: "Kuwait", checked: false },
            { name: "Lebanon", checked: false },
            { name: "Oman", checked: false },
            { name: "Palestinian Territories", checked: false },
            { name: "Qatar", checked: false },
            { name: "Saudi Arabia", checked: false },
            { name: "Syria", checked: false },
            { name: "United Arab Emirates", checked: false },
            { name: "Yemen", checked: false },
          ],
        },
        {
          name: "North Africa",
          checked: false,
          expanded: false,
          children: [
            { name: "Algeria", checked: false },
            { name: "Egypt", checked: false },
            { name: "Libya", checked: false },
            { name: "Morocco", checked: false },
            { name: "Sudan", checked: false },
            { name: "Tunisia", checked: false },
            { name: "Western Sahara", checked: false },
          ],
        },
        {
          name: "Sub-Saharan Africa",
          checked: false,
          expanded: false,
          children: [
            { name: "Angola", checked: false },
            { name: "Benin", checked: false },
            { name: "Botswana", checked: false },
            { name: "Burkina Faso", checked: false },
            { name: "Burundi", checked: false },
            { name: "Cameroon", checked: false },
            { name: "Cape Verde", checked: false },
            { name: "Central African Republic", checked: false },
            { name: "Chad", checked: false },
            { name: "Comoros", checked: false },
            { name: "Congo (Brazzaville)", checked: false },
            { name: "Congo (Kinshasa)", checked: false },
            { name: "Côte d'Ivoire", checked: false },
            { name: "Djibouti", checked: false },
            { name: "Equatorial Guinea", checked: false },
            { name: "Eritrea", checked: false },
            { name: "Eswatini", checked: false },
            { name: "Ethiopia", checked: false },
            { name: "Gabon", checked: false },
            { name: "Gambia", checked: false },
            { name: "Ghana", checked: false },
            { name: "Guinea", checked: false },
            { name: "Guinea-Bissau", checked: false },
            { name: "Kenya", checked: false },
            { name: "Lesotho", checked: false },
            { name: "Liberia", checked: false },
            { name: "Madagascar", checked: false },
            { name: "Malawi", checked: false },
            { name: "Mali", checked: false },
            { name: "Mauritania", checked: false },
            { name: "Mauritius", checked: false },
            { name: "Mozambique", checked: false },
            { name: "Namibia", checked: false },
            { name: "Niger", checked: false },
            { name: "Nigeria", checked: false },
            { name: "Rwanda", checked: false },
            { name: "São Tomé and Príncipe", checked: false },
            { name: "Senegal", checked: false },
            { name: "Seychelles", checked: false },
            { name: "Sierra Leone", checked: false },
            { name: "Somalia", checked: false },
            { name: "South Africa", checked: false },
            { name: "South Sudan", checked: false },
            { name: "Tanzania", checked: false },
            { name: "Togo", checked: false },
            { name: "Uganda", checked: false },
            { name: "Zambia", checked: false },
            { name: "Zimbabwe", checked: false },
          ],
        },
      ],
    },
  ];

  @Input() locationData: any[] = [];
  @Input() clearLocationSelection!: boolean;
  @Output() onClearLocationSelection = new EventEmitter<any>();
  @Output() locationSelected = new EventEmitter<{ [key: string]: string[] }>();

  onLocationSelectionChange(payload: any) {
    // Update the selectAllChecked state based on current selections
    this.updateSelectAllState();
    this.locationSelected.emit(payload);
  }

  private updateSelectAllState() {
    const checkAllSelected = (nodes: any[]): boolean => {
      return nodes.every((node) => {
        if (node.children) {
          return checkAllSelected(node.children);
        }
        return node.checked;
      });
    };

    this.selectAllChecked = checkAllSelected(this.locationsData);
  }

  onSelectAllChange(event: any) {
    const checked = event.target.checked;
    this.selectAllChecked = checked;
    this.selectAllLocations(checked);
  }

  private selectAllLocations(checked: boolean) {
    const updateNode = (node: any) => {
      node.checked = checked;
      if (node.children) {
        node.children.forEach(updateNode);
      }
    };

    this.locationsData.forEach(updateNode);

    // Trigger the nested-checkboxes component to process the changes
    // by calling the onLocationSelectionChange method with the updated data
    setTimeout(() => {
      // Use setTimeout to ensure the DOM updates before processing
      this.processLocationSelection();
    }, 0);
  }

  private processLocationSelection() {
    // Build the payload similar to how nested-checkboxes does it
    const payload = this.buildLocationPayload();
    this.locationSelected.emit(payload);
  }

  private ensureKeyValueOnLeaves() {
    const assignIfLeaf = (node: any) => {
      const hasChildren = Array.isArray(node.children) && node.children.length > 0;
      if (!hasChildren && node.keyValue === undefined) {
        node.keyValue = "STATE";
      }
      if (hasChildren) {
        node.children.forEach(assignIfLeaf);
      }
    };

    this.locationsData.forEach(assignIfLeaf);
  }

  private buildLocationPayload(): { grouped: any; minimal: string[] } {
    const geographies = new Set<string>();
    const countries = new Set<string>();
    const regions = new Set<string>();
    const states = new Set<string>();
    const provinces = new Set<string>();
    const minimal: string[] = [];

    const hasCheckedDescendant = (n: any): boolean => {
      if (n.checked && (!n.children || n.children.length === 0)) {
        return true;
      }
      return (
        !!n.children &&
        n.children.some((child: any) => hasCheckedDescendant(child))
      );
    };

    const areAllChildrenChecked = (n: any): boolean => {
      if (!n.children || n.children.length === 0) return false;
      return n.children.every((child: any) => {
        if (!child.children || child.children.length === 0) {
          return child.checked;
        }
        return areAllChildrenChecked(child);
      });
    };

    const walk = (n: any) => {
      // Handle Location hierarchy
      if (n.keyValue === "STATE" && n.checked) {
        states.add(n.name);
      }
      if (n.keyValue === "US_REGION" && hasCheckedDescendant(n)) {
        if (n.checked || areAllChildrenChecked(n)) {
          regions.add(n.name);
        }
      }
      if (n.keyValue === "COUNTRY_NAME" && hasCheckedDescendant(n)) {
        if (n.checked || areAllChildrenChecked(n)) {
          countries.add(n.name);
        }
      }
      if (n.keyValue === "PROVINCE" && hasCheckedDescendant(n)) {
        if (n.checked || areAllChildrenChecked(n)) {
          provinces.add(n.name);
        }
      }
      if (n.keyValue === "GEOGRAPHY" && hasCheckedDescendant(n)) {
        if (n.checked || areAllChildrenChecked(n)) {
          geographies.add(n.name);
        }
      }

      // Build minimal array
      if (n.checked && (!n.children || n.children.length === 0)) {
        minimal.push(n.name);
      }

      n.children?.forEach(walk);
    };

    this.locationsData.forEach(walk);

    // Create the grouped result object
    const grouped: any = {};

    if (states.size > 0) {
      grouped.STATE = Array.from(states);
    }
    if (regions.size > 0) {
      grouped.US_REGION = Array.from(regions);
    }
    if (countries.size > 0) {
      grouped.COUNTRY_NAME = Array.from(countries);
    }
    if (geographies.size > 0) {
      grouped.GEOGRAPHY = Array.from(geographies);
    }
    if (provinces.size > 0) {
      grouped.PROVINCE = Array.from(provinces);
    }

    // Check if all locations are selected (Select All is checked)
    if (this.selectAllChecked) {
      // Return "All Locations" in minimal array for cleaner UI display
      // but keep the full grouped payload with all individual states
      return { grouped, minimal: ["All Locations"] };
    }

    return { grouped, minimal };
  }

  onClearLocation($event: any) {
    this.clearLocationSelection = false;
    this.selectAllChecked = false;
    this.onClearLocationSelection.emit(false);
  }
}
