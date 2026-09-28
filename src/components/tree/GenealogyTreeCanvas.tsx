import React, { useState, useRef, useMemo } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  UserCheck,
  Crown,
  Heart,
  Plus,
  Filter,
  Layers,
  ChevronDown,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { FamilyMember, GenerationOrder } from '../../types/genealogy';

interface GenealogyTreeCanvasProps {
  members: FamilyMember[];
  generationOrders: GenerationOrder[];
  boundMemberId?: string;
  onSelectMember: (member: FamilyMember) => void;
  onAddChild: (parent: FamilyMember) => void;
  onAddSpouse: (member: FamilyMember) => void;
}

export const GenealogyTreeCanvas: React.FC<GenealogyTreeCanvasProps> = ({
  members,
  generationOrders,
  boundMemberId,
  onSelectMember,
  onAddChild,
  onAddSpouse,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 40, y: 40 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [layoutMode, setLayoutMode] = useState<'vertical' | 'horizontal'>('vertical');
  const [selectedGenFilter, setSelectedGenFilter] = useState<number | 'all'>('all');
  const [highlightedMemberId, setHighlightedMemberId] = useState<string | null>(boundMemberId || null);
  
  // Set of collapsed node IDs (their descendants will be hidden)
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Set<string>>(new Set());

  // Toggle collapse state for a node
  const toggleCollapse = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Compute set of hidden member IDs based on collapsed parents
  const hiddenMemberIds = useMemo(() => {
    const hidden = new Set<string>();
    if (collapsedNodeIds.size === 0) return hidden;

    const memberMap = new Map<string, FamilyMember>(members.map((m) => [m.id, m]));

    // Recursive helper to hide all descendants of a collapsed node
    const hideDescendants = (parentId: string) => {
      const parent = memberMap.get(parentId);
      if (parent && parent.children) {
        parent.children.forEach((child) => {
          hidden.add(child.id);
          hideDescendants(child.id);
        });
      }
    };

    collapsedNodeIds.forEach((collapsedId) => {
      hideDescendants(collapsedId);
    });

    return hidden;
  }, [members, collapsedNodeIds]);

  // Compute direct lineage set (ancestors + descendants) for highlighted node
  const lineageMemberIds = useMemo(() => {
    if (!highlightedMemberId) return new Set<string>();
    const lineage = new Set<string>([highlightedMemberId]);
    const memberMap = new Map<string, FamilyMember>(members.map((m) => [m.id, m]));

    // 1. Trace ancestors upwards
    const traceAncestors = (currId: string) => {
      const curr = memberMap.get(currId);
      if (curr && curr.parents) {
        curr.parents.forEach((p) => {
          lineage.add(p.id);
          traceAncestors(p.id);
        });
      }
    };

    // 2. Trace descendants downwards
    const traceDescendants = (currId: string) => {
      const curr = memberMap.get(currId);
      if (curr && curr.children) {
        curr.children.forEach((c) => {
          lineage.add(c.id);
          traceDescendants(c.id);
        });
      }
    };

    traceAncestors(highlightedMemberId);
    traceDescendants(highlightedMemberId);

    return lineage;
  }, [members, highlightedMemberId]);

  // Visible members after filtering out hidden descendants
  const visibleMembers = useMemo(() => {
    return members.filter((m) => !hiddenMemberIds.has(m.id));
  }, [members, hiddenMemberIds]);

  // Group members by Generation Number
  const { maxGen, genGroupMap } = useMemo(() => {
    let max = 1;
    const map = new Map<number, FamilyMember[]>();
    visibleMembers.forEach((m) => {
      if (m.generationNum > max) max = m.generationNum;
      if (!map.has(m.generationNum)) map.set(m.generationNum, []);
      map.get(m.generationNum)!.push(m);
    });
    return { maxGen: max, genGroupMap: map };
  }, [visibleMembers]);

  // Layout node coordinates calculation
  const nodeDimensions = { width: 140, height: 80, gapX: 40, gapY: 90 };

  const { nodePositions, lineConnections } = useMemo(() => {
    const positions = new Map<string, { x: number; y: number; gen: number }>();
    const lines: Array<{
      id: string;
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      type: 'parent_child' | 'spouse';
      isLineage: boolean;
    }> = [];

    // Calculate grid layout for each generation row/column
    for (let gen = 1; gen <= maxGen; gen++) {
      const genMembers = genGroupMap.get(gen) || [];
      genMembers.forEach((m, idx) => {
        let x = 0;
        let y = 0;
        if (layoutMode === 'vertical') {
          y = (gen - 1) * (nodeDimensions.height + nodeDimensions.gapY);
          x = idx * (nodeDimensions.width + nodeDimensions.gapX);
        } else {
          x = (gen - 1) * (nodeDimensions.width + nodeDimensions.gapX + 60);
          y = idx * (nodeDimensions.height + nodeDimensions.gapY - 10);
        }
        positions.set(m.id, { x, y, gen });
      });
    }

    // Generate parent-child & spouse connecting lines
    visibleMembers.forEach((m) => {
      const mPos = positions.get(m.id);
      if (!mPos) return;

      // Spouses
      if (m.spouses) {
        m.spouses.forEach((spInfo) => {
          const spPos = positions.get(spInfo.member.id);
          if (spPos && m.id < spInfo.member.id) {
            const isLineage = lineageMemberIds.has(m.id) && lineageMemberIds.has(spInfo.member.id);
            lines.push({
              id: `sp_${m.id}_${spInfo.member.id}`,
              x1: layoutMode === 'vertical' ? mPos.x + nodeDimensions.width : mPos.x + nodeDimensions.width / 2,
              y1: layoutMode === 'vertical' ? mPos.y + nodeDimensions.height / 2 : mPos.y + nodeDimensions.height,
              x2: layoutMode === 'vertical' ? spPos.x : spPos.x + nodeDimensions.width / 2,
              y2: layoutMode === 'vertical' ? spPos.y + nodeDimensions.height / 2 : spPos.y,
              type: 'spouse',
              isLineage,
            });
          }
        });
      }

      // Children
      if (m.children) {
        m.children.forEach((child) => {
          const childPos = positions.get(child.id);
          if (childPos) {
            const isLineage = lineageMemberIds.has(m.id) && lineageMemberIds.has(child.id);
            lines.push({
              id: `pc_${m.id}_${child.id}`,
              x1: mPos.x + nodeDimensions.width / 2,
              y1: mPos.y + nodeDimensions.height,
              x2: childPos.x + nodeDimensions.width / 2,
              y2: childPos.y,
              type: 'parent_child',
              isLineage,
            });
          }
        });
      }
    });

    return { nodePositions: positions, lineConnections: lines };
  }, [visibleMembers, maxGen, genGroupMap, layoutMode, lineageMemberIds]);

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  const resetPanZoom = () => {
    setScale(0.9);
    setPan({ x: 40, y: 40 });
  };

  const focusMember = (id?: string) => {
    if (!id) return;
    const pos = nodePositions.get(id);
    if (pos) {
      setHighlightedMemberId(id);
      setPan({
        x: 180 - pos.x * scale,
        y: 180 - pos.y * scale,
      });
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-140px)] bg-[#FDFBF7] paper-texture overflow-hidden select-none border border-[#E8DFD1] rounded-2xl shadow-inner">
      {/* Top Floating Control Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 bg-white/90 backdrop-blur-md border border-[#D9CDB8] rounded-xl p-2 shadow-xs">
        {/* Layout & Focus Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setLayoutMode(layoutMode === 'vertical' ? 'horizontal' : 'vertical')}
            className="flex items-center gap-1 bg-[#8B5A2B]/10 text-[#8B5A2B] hover:bg-[#8B5A2B]/20 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{layoutMode === 'vertical' ? '纵向世系' : '横向长卷'}</span>
          </button>

          {boundMemberId && (
            <button
              onClick={() => focusMember(boundMemberId)}
              className="flex items-center gap-1 bg-[#B83B26]/10 text-[#B83B26] hover:bg-[#B83B26]/20 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>直系寻根</span>
            </button>
          )}

          <button
            onClick={() => focusMember(members[0]?.id)}
            className="flex items-center gap-1 bg-[#D4A359]/20 text-[#8B5A2B] hover:bg-[#D4A359]/30 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <Crown className="w-3.5 h-3.5" />
            <span>定焦始祖</span>
          </button>
        </div>

        {/* Generation Filter Dropdown */}
        <div className="flex items-center gap-1 text-xs text-[#666666]">
          <Filter className="w-3.5 h-3.5 text-[#8B5A2B]" />
          <select
            value={selectedGenFilter}
            onChange={(e) => setSelectedGenFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="bg-white border border-[#D9CDB8] rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#8B5A2B]"
          >
            <option value="all">查看全世系 ({maxGen}代)</option>
            {Array.from({ length: maxGen }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                仅显示 第 {i + 1} 世
              </option>
            ))}
          </select>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setScale((s) => Math.min(s + 0.15, 2.0))}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
            title="放大"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="text-[10px] text-gray-500 w-8 text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale((s) => Math.max(s - 0.15, 0.3))}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
            title="缩小"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetPanZoom}
            className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
            title="重置居中"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Workspace */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
          }}
          className="relative min-w-[2000px] min-h-[2000px] pt-16 pl-12"
        >
          {/* SVG Connecting Lines Layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
            {lineConnections.map((line) => (
              <g key={line.id}>
                {line.type === 'spouse' ? (
                  <line
                    x1={line.x1}
                    y1={line.y1}
                    x2={line.x2}
                    y2={line.y2}
                    stroke={line.isLineage ? '#B83B26' : '#D9CDB8'}
                    strokeWidth={line.isLineage ? '3' : '1.5'}
                    strokeDasharray={line.isLineage ? 'none' : '4 3'}
                  />
                ) : (
                  <path
                    d={`M ${line.x1} ${line.y1} C ${line.x1} ${(line.y1 + line.y2) / 2}, ${line.x2} ${(line.y1 + line.y2) / 2}, ${line.x2} ${line.y2}`}
                    fill="none"
                    stroke={line.isLineage ? '#B83B26' : '#8B5A2B'}
                    strokeWidth={line.isLineage ? '3.5' : '1.8'}
                    strokeOpacity={line.isLineage ? '1' : '0.5'}
                  />
                )}
              </g>
            ))}
          </svg>

          {/* Members Node Layer */}
          {visibleMembers.map((member) => {
            const pos = nodePositions.get(member.id);
            if (!pos) return null;

            if (selectedGenFilter !== 'all' && member.generationNum !== selectedGenFilter) {
              return null;
            }

            const isBoundSelf = member.id === boundMemberId;
            const isHighlighted = member.id === highlightedMemberId;
            const isInLineagePath = lineageMemberIds.has(member.id);
            const genChar = generationOrders.find((g) => g.generationNum === member.generationNum)?.character;
            const hasChildren = member.children && member.children.length > 0;
            const isCollapsed = collapsedNodeIds.has(member.id);

            return (
              <div
                key={member.id}
                style={{
                  position: 'absolute',
                  left: `${pos.x}px`,
                  top: `${pos.y}px`,
                  width: `${nodeDimensions.width}px`,
                  height: `${nodeDimensions.height}px`,
                }}
                className={`group rounded-xl border p-2 bg-white shadow-xs transition-all duration-200 cursor-pointer flex flex-col justify-between z-10 ${
                  isBoundSelf
                    ? 'ring-2 ring-[#B83B26] border-[#B83B26] bg-red-50/40 shadow-md'
                    : isHighlighted
                    ? 'ring-2 ring-[#8B5A2B] border-[#8B5A2B] shadow-md'
                    : isInLineagePath
                    ? 'border-[#B83B26] bg-amber-50/30'
                    : 'border-[#D9CDB8] hover:border-[#8B5A2B] hover:shadow-md'
                }`}
                onClick={() => {
                  setHighlightedMemberId(member.id);
                  onSelectMember(member);
                }}
              >
                {/* Generation Seal & Name */}
                <div className="flex items-center gap-2">
                  <div className="relative shrink-0">
                    <img
                      src={member.avatarUrl}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover border border-[#8B5A2B]/30"
                    />
                    {member.gender === 'female' && (
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-pink-500 text-white flex items-center justify-center text-[8px] font-bold">
                        ♀
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-xs text-[#1A1A1A] truncate">{member.name}</span>
                      {member.isDeceased && (
                        <span className="text-[8px] bg-gray-200 text-gray-600 px-1 rounded shrink-0">故</span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#8B5A2B] block truncate">
                      第 {member.generationNum} 世 {genChar ? `· [${genChar}]` : ''}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Bar & Branch Collapse Button */}
                <div className="flex items-center justify-between border-t border-gray-100 pt-1 text-[10px] text-gray-500">
                  <span className="truncate max-w-[70px]">{member.livingPlace || member.occupation || '档案全'}</span>
                  
                  <div className="flex items-center gap-1">
                    {/* Branch Collapse/Expand Toggle */}
                    {hasChildren && (
                      <button
                        onClick={(e) => toggleCollapse(member.id, e)}
                        className={`p-1 rounded-md transition-colors flex items-center gap-0.5 ${
                          isCollapsed
                            ? 'bg-[#B83B26] text-white font-bold'
                            : 'bg-gray-100 text-gray-600 hover:bg-[#8B5A2B] hover:text-white'
                        }`}
                        title={isCollapsed ? '展开子嗣分支' : '折叠子嗣分支'}
                      >
                        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddSpouse(member);
                      }}
                      className="p-1 hover:bg-red-50 text-red-600 rounded"
                      title="加配偶"
                    >
                      <Heart className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddChild(member);
                      }}
                      className="p-1 hover:bg-amber-50 text-amber-700 rounded"
                      title="加子女"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
