import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ApiService } from "../../services/api.service";
import { CheckboxNode } from "../screening/screening.component";
import {
  NestedCheckboxesComponent,
  SelectionPayload,
} from "../../components/nested-checkboxes/nested-checkboxes.component";

@Component({
  selector: "app-sectors-industries",
  standalone: true,
  imports: [CommonModule, NestedCheckboxesComponent],
  templateUrl: "./sectors-industries.component.html",
  styleUrl: "./sectors-industries.component.scss",
})
export class SectorsIndustriesComponent implements OnInit {
  @Input() clearSectorSelection!: boolean;
  @Output() onClearSectorSelection = new EventEmitter<any>();

  @Input() checkboxData: CheckboxNode[] = [];
  @Output() selectionChange = new EventEmitter<SelectionPayload>();

  selectAllChecked: boolean = false;

  onChange(payload: SelectionPayload) {
    // Update the selectAllChecked state based on current selections
    this.updateSelectAllState();
    this.selectionChange.emit(payload);
  }

  private updateSelectAllState() {
    const checkAllSelected = (nodes: CheckboxNode[]): boolean => {
      return nodes.every((node) => {
        if (node.children) {
          return checkAllSelected(node.children);
        }
        return node.checked;
      });
    };

    this.selectAllChecked = checkAllSelected(this.checkboxData);
  }

  onSelectAllChange(event: any) {
    const checked = event.target.checked;
    this.selectAllChecked = checked;
    this.selectAllSectors(checked);
  }

  private selectAllSectors(checked: boolean) {
    const updateNode = (node: CheckboxNode) => {
      node.checked = checked;
      if (node.children) {
        node.children.forEach(updateNode);
      }
    };

    this.checkboxData.forEach(updateNode);

    // Trigger the nested-checkboxes component to process the changes
    setTimeout(() => {
      this.processSectorSelection();
    }, 0);
  }

  private processSectorSelection() {
    // Build the payload similar to how nested-checkboxes does it
    const payload = this.buildSectorPayload();
    this.selectionChange.emit(payload);
  }

  private buildSectorPayload(): SelectionPayload {
    const sectors = new Set<string>();
    const groups = new Set<string>();
    const primaries = new Set<string>();
    const minimal: string[] = [];

    const hasCheckedDescendant = (n: CheckboxNode): boolean => {
      if (n.checked && (!n.children || n.children.length === 0)) {
        return true;
      }
      return (
        !!n.children && n.children.some((child) => hasCheckedDescendant(child))
      );
    };

    const areAllChildrenChecked = (n: CheckboxNode): boolean => {
      if (!n.children || n.children.length === 0) return false;
      return n.children.every((child) => {
        if (!child.children || child.children.length === 0) {
          return child.checked;
        }
        return areAllChildrenChecked(child);
      });
    };

    const walk = (n: CheckboxNode) => {
      // Handle GICS hierarchy
      if (n.type === "GICS_SECTOR" && hasCheckedDescendant(n)) {
        sectors.add(n.name);
      }
      if (n.type === "GICS_GROUP" && hasCheckedDescendant(n)) {
        groups.add(n.name);
      }
      if (n.type === "GICS_PRIMARY_INDUSTRY" && hasCheckedDescendant(n)) {
        primaries.add(n.name);
      }

      // Handle leaf nodes for GICS
      if ((!n.children || n.children.length === 0) && n.checked && n.type) {
        primaries.add(n.name);
      }

      // Build minimal array
      if (n.checked && (!n.children || n.children.length === 0)) {
        minimal.push(n.name);
      }

      n.children?.forEach(walk);
    };

    this.checkboxData.forEach(walk);

    // Create the grouped result object
    const grouped: any = {
      GICS_SECTOR: Array.from(sectors),
      GICS_GROUP: Array.from(groups),
      GICS_PRIMARY_INDUSTRY: Array.from(primaries),
    };

    // Check if all sectors are selected (Select All is checked)
    if (this.selectAllChecked) {
      // Return "All Sectors" in minimal array for cleaner UI display
      // but keep the full grouped payload with all individual sectors
      return { grouped, minimal: ["All Sectors"] };
    }

    return { grouped, minimal };
  }

  onClearSector($event: any) {
    this.clearSectorSelection = false;
    this.selectAllChecked = false;
    this.onClearSectorSelection.emit(false);
  }

  ngOnInit() {}
}
