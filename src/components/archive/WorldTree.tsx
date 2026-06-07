import { useState, useMemo, useCallback } from "react";
import { useArchiveStore } from "../../stores/archiveStore";
import { WorldRecord, Location, RecordType } from "../../types";
import {
  ChevronRight,
  ChevronDown,
  Globe,
  Map as MapIcon,
  Building2,
  Home,
  Landmark,
  DoorOpen,
  Search,
  Plus,
} from "lucide-react";

const LevelIcons = [Globe, MapIcon, Building2, Home, Landmark, DoorOpen];

function isLocation(record: WorldRecord): record is Location {
  return record.type === "location";
}

interface TreeNode {
  record: Location;
  depth: number;
  children: TreeNode[];
}

function buildLocationTree(records: WorldRecord[]): TreeNode[] {
  const locations = records.filter(isLocation);
  const map = new Map<string, TreeNode>();

  for (const loc of locations) {
    map.set(loc.id, { record: loc, depth: 0, children: [] });
  }

  const roots: TreeNode[] = [];
  for (const node of map.values()) {
    if (node.record.parentId && map.has(node.record.parentId)) {
      const parent = map.get(node.record.parentId)!;
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  function setDepth(nodes: TreeNode[], depth: number): void {
    for (const node of nodes) {
      node.depth = depth;
      setDepth(node.children, depth + 1);
    }
  }
  for (const root of roots) {
    setDepth([root], 0);
  }

  function sortNodes(nodes: TreeNode[]): void {
    nodes.sort((a, b) => a.record.name.localeCompare(b.record.name));
    for (const node of nodes) {
      sortNodes(node.children);
    }
  }
  sortNodes(roots);

  return roots;
}

function filterTree(nodes: TreeNode[], query: string): TreeNode[] {
  const lower = query.toLowerCase();
  const result: TreeNode[] = [];
  for (const node of nodes) {
    const matches = node.record.name.toLowerCase().includes(lower);
    const filteredChildren = filterTree(node.children, query);
    if (matches || filteredChildren.length > 0) {
      result.push({ ...node, children: filteredChildren });
    }
  }
  return result;
}

interface TreeNodeListProps {
  nodes: TreeNode[];
  selectedRecordId: string | null;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string, type: RecordType) => void;
  forceExpanded: boolean;
}

function TreeNodeList({
  nodes,
  selectedRecordId,
  expandedNodes,
  onToggle,
  onSelect,
  forceExpanded,
}: TreeNodeListProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-0.5">
      {nodes.map((node) => (
        <TreeNodeItem
          key={node.record.id}
          node={node}
          selectedRecordId={selectedRecordId}
          expandedNodes={expandedNodes}
          onToggle={onToggle}
          onSelect={onSelect}
          forceExpanded={forceExpanded}
        />
      ))}
    </div>
  );
}

interface TreeNodeItemProps {
  node: TreeNode;
  selectedRecordId: string | null;
  expandedNodes: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string, type: RecordType) => void;
  forceExpanded: boolean;
}

function TreeNodeItem({
  node,
  selectedRecordId,
  expandedNodes,
  onToggle,
  onSelect,
  forceExpanded,
}: TreeNodeItemProps): React.ReactElement {
  const isExpanded = forceExpanded || expandedNodes.has(node.record.id);
  const hasChildren = node.children.length > 0;
  const isActive = selectedRecordId === node.record.id;
  const depth = Math.min(node.depth, LevelIcons.length - 1);
  const Icon = LevelIcons[depth];

  return (
    <div>
      <div
        className={`tree-item ${isActive ? "active" : ""}`}
        style={{ paddingLeft: `${12 + node.depth * 16}px` }}
        onClick={() => onSelect(node.record.id, "location")}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggle(node.record.id);
            }}
            className="text-text-muted hover:text-text p-0.5 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}
        <Icon className="w-4 h-4 text-text-muted flex-shrink-0" />
        <span className="truncate">{node.record.name}</span>
      </div>
      {isExpanded && hasChildren && (
        <TreeNodeList
          nodes={node.children}
          selectedRecordId={selectedRecordId}
          expandedNodes={expandedNodes}
          onToggle={onToggle}
          onSelect={onSelect}
          forceExpanded={forceExpanded}
        />
      )}
    </div>
  );
}

export function WorldTree(): React.ReactElement {
  const records = useArchiveStore((s) => s.records);
  const selectedRecordId = useArchiveStore((s) => s.selectedRecordId);
  const setSelectedRecord = useArchiveStore((s) => s.setSelectedRecord);
  const expandedNodes = useArchiveStore((s) => s.expandedNodes);
  const toggleNode = useArchiveStore((s) => s.toggleNode);

  const [searchQuery, setSearchQuery] = useState("");

  const tree = useMemo(() => buildLocationTree(records), [records]);

  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return tree;
    return filterTree(tree, searchQuery);
  }, [tree, searchQuery]);

  const isSearching = searchQuery.trim().length > 0;

  const handleNodeClick = useCallback(
    (id: string, type: RecordType) => {
      setSelectedRecord(id, type);
    },
    [setSelectedRecord]
  );

  const handleAddRecord = useCallback(() => {
    // Placeholder — sonraki aşama
  }, []);

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Header */}
      <div className="panel-header border-b border-border flex-shrink-0">
        <Globe className="w-4 h-4 text-accent" />
        <span>DÜNYA AĞACI</span>
      </div>

      {/* Search */}
      <div className="p-3 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            placeholder="Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full pl-9"
          />
        </div>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {filteredTree.length === 0 ? (
          <div className="text-text-muted text-sm text-center py-4">
            Kayıt bulunamadı
          </div>
        ) : (
          <TreeNodeList
            nodes={filteredTree}
            selectedRecordId={selectedRecordId}
            expandedNodes={expandedNodes}
            onToggle={toggleNode}
            onSelect={handleNodeClick}
            forceExpanded={isSearching}
          />
        )}
      </div>

      {/* Add button */}
      <div className="p-3 border-t border-border flex-shrink-0">
        <button
          onClick={handleAddRecord}
          className="btn-accent w-full flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Yeni Kayıt Ekle
        </button>
      </div>
    </div>
  );
}
