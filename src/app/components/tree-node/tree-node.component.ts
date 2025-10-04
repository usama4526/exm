import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from "@angular/core";
import { CheckboxNode } from "../../pages/screening/screening.component";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: "app-tree-node",
  imports: [CommonModule, FormsModule],
  templateUrl: "./tree-node.component.html",
  styleUrl: "./tree-node.component.scss",
})
export class TreeNodeComponent implements OnChanges {
  @Input() node!: any;
  @Input() level = 0;
  @Input() clearSectorSelection!: boolean;
  @Input() clearLocationSelection!: boolean;

  /** emit upward whenever this node is toggled */
  @Output() toggled = new EventEmitter<{
    node: CheckboxNode;
    checked: boolean;
  }>();

  @Output() onClearSectorSelection = new EventEmitter<any>();
  @Output() onClearLocationSelection = new EventEmitter<any>();
  ngOnChanges(changes: SimpleChanges): void {
    if (this.clearSectorSelection === true) {
      this.uncheckAll(this.node);
      this.clearSectorSelection = false;
      this.onClearSectorSelection.emit(false);
    } else if (this.clearLocationSelection == true) {
      this.uncheckAll(this.node);
      this.clearLocationSelection = false;
      this.onClearLocationSelection.emit(false);
    }
  }

  private uncheckAll(node: any): void {
    node.checked = false;

    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        this.uncheckAll(child);
      }
    }
  }

  onCheck(event: any) {
    this.toggled.emit({ node: this.node, checked: event.target.checked });
  }

  toggleChecked(event: MouseEvent) {
    event.stopPropagation();
    this.node.checked = !this.node.checked;
    this.toggled.emit({ node: this.node, checked: this.node.checked });
  }
}
