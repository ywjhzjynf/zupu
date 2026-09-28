import { FamilyMember, ParentChildRelation, SpouseRelation } from '../../types/genealogy';

export interface PathStep {
  memberId: string;
  relation: 'father' | 'mother' | 'son' | 'daughter' | 'husband' | 'wife';
}

export function calculateKinshipTitle(
  fromId: string,
  toId: string,
  members: FamilyMember[],
  parentChildRelations: ParentChildRelation[],
  spouseRelations: SpouseRelation[]
): { title: string; pathDescription: string; generationDiff: number; pathNodes: string[] } {
  const memberMap = new Map<string, FamilyMember>(members.map((m) => [m.id, m]));
  const fromMember = memberMap.get(fromId);
  const toMember = memberMap.get(toId);

  if (!fromMember || !toMember) {
    return {
      title: '未知亲属',
      pathDescription: '无法在家族图谱中找到对应成员',
      generationDiff: 0,
      pathNodes: [],
    };
  }

  if (fromId === toId) {
    return {
      title: '本人',
      pathDescription: '自己',
      generationDiff: 0,
      pathNodes: [fromMember.name],
    };
  }

  // Build adjacency graph
  const adj = new Map<string, Array<{ to: string; relation: PathStep['relation'] }>>();
  const addEdge = (u: string, v: string, rel: PathStep['relation']) => {
    if (!adj.has(u)) adj.set(u, []);
    adj.get(u)!.push({ to: v, relation: rel });
  };

  parentChildRelations.forEach((pc) => {
    const parent = memberMap.get(pc.parentId);
    const child = memberMap.get(pc.childId);
    if (parent && child) {
      const parentRel = parent.gender === 'male' ? 'father' : 'mother';
      const childRel = child.gender === 'male' ? 'son' : 'daughter';
      addEdge(pc.childId, pc.parentId, parentRel);
      addEdge(pc.parentId, pc.childId, childRel);
    }
  });

  spouseRelations.forEach((sp) => {
    const mA = memberMap.get(sp.memberAId);
    const mB = memberMap.get(sp.memberBId);
    if (mA && mB) {
      if (mA.gender === 'male' && mB.gender === 'female') {
        addEdge(sp.memberAId, sp.memberBId, 'wife');
        addEdge(sp.memberBId, sp.memberAId, 'husband');
      } else if (mA.gender === 'female' && mB.gender === 'male') {
        addEdge(sp.memberAId, sp.memberBId, 'husband');
        addEdge(sp.memberBId, sp.memberAId, 'wife');
      }
    }
  });

  // BFS to find shortest relation path
  const queue: Array<{ curr: string; path: Array<{ memberId: string; rel: PathStep['relation'] }> }> = [
    { curr: fromId, path: [] },
  ];
  const visited = new Set<string>([fromId]);
  let foundPath: Array<{ memberId: string; rel: PathStep['relation'] }> | null = null;

  while (queue.length > 0) {
    const { curr, path } = queue.shift()!;
    if (curr === toId) {
      foundPath = path;
      break;
    }

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor.to)) {
        visited.add(neighbor.to);
        queue.push({
          curr: neighbor.to,
          path: [...path, { memberId: neighbor.to, rel: neighbor.relation }],
        });
      }
    }
  }

  if (!foundPath) {
    return {
      title: '同族亲眷',
      pathDescription: `${fromMember.name} 与 ${toMember.name} 同属 ${fromMember.familyId} 家族，但未记录直接连线`,
      generationDiff: toMember.generationNum - fromMember.generationNum,
      pathNodes: [fromMember.name, toMember.name],
    };
  }

  const generationDiff = toMember.generationNum - fromMember.generationNum;
  const pathNames = [fromMember.name, ...foundPath.map((p) => memberMap.get(p.memberId)?.name || '未命名')];

  // Convert relation steps into traditional Chinese kinship title
  const relSequence = foundPath.map((p) => p.rel);
  const title = getTitleFromSequence(relSequence, toMember.gender, generationDiff);

  const pathDescParts = foundPath.map((p) => {
    const targetName = memberMap.get(p.memberId)?.name || '';
    const relText =
      p.rel === 'father'
        ? '的父亲'
        : p.rel === 'mother'
        ? '的母亲'
        : p.rel === 'son'
        ? '的儿子'
        : p.rel === 'daughter'
        ? '的女儿'
        : p.rel === 'husband'
        ? '的丈夫'
        : '的妻子';
    return `${relText} ${targetName}`;
  });

  return {
    title,
    pathDescription: `${fromMember.name}${pathDescParts.join('')}`,
    generationDiff,
    pathNodes: pathNames,
  };
}

function getTitleFromSequence(
  steps: Array<PathStep['relation']>,
  targetGender: 'male' | 'female',
  genDiff: number
): string {
  const seqStr = steps.join('->');

  // Direct ancestors / descendants
  if (seqStr === 'father') return '父亲';
  if (seqStr === 'mother') return '母亲';
  if (seqStr === 'son') return '儿子';
  if (seqStr === 'daughter') return '女儿';
  if (seqStr === 'husband') return '丈夫';
  if (seqStr === 'wife') return '妻子';

  if (seqStr === 'father->father') return '爷爷 (祖父)';
  if (seqStr === 'father->mother') return '奶奶 (祖母)';
  if (seqStr === 'mother->father') return '外公 (外祖父)';
  if (seqStr === 'mother->mother') return '外婆 (外祖母)';

  if (seqStr === 'son->son') return '孙子';
  if (seqStr === 'son->daughter') return '孙女';
  if (seqStr === 'daughter->son') return '外孙';
  if (seqStr === 'daughter->daughter') return '外孙女';

  if (seqStr === 'father->father->father') return '曾祖父';
  if (seqStr === 'father->father->mother') return '曾祖母';
  if (seqStr === 'son->son->son') return '曾孙';
  if (seqStr === 'son->son->daughter') return '曾孙女';

  // Siblings
  if (seqStr === 'father->son' || seqStr === 'mother->son') return targetGender === 'male' ? '兄弟' : '姐妹';
  if (seqStr === 'father->daughter' || seqStr === 'mother->daughter') return '姐妹';

  // Uncles & Aunts
  if (seqStr === 'father->father->son') return '伯父 / 叔父';
  if (seqStr === 'father->father->daughter') return '姑母';
  if (seqStr === 'mother->father->son') return '舅舅';
  if (seqStr === 'mother->father->daughter') return '姨妈';

  // Cousins (堂/表)
  if (seqStr.includes('father->father->son->son')) return '堂兄弟';
  if (seqStr.includes('father->father->son->daughter')) return '堂姐妹';
  if (seqStr.includes('mother->father->son') || seqStr.includes('father->father->daughter')) return '表亲 (表兄弟/表姐妹)';

  // General fallbacks based on generation difference & gender
  if (genDiff === -3) return targetGender === 'male' ? '曾祖辈长辈' : '曾祖母辈长辈';
  if (genDiff === -2) return targetGender === 'male' ? '祖父辈 (爷爷/外公)' : '祖母辈 (奶奶/外婆)';
  if (genDiff === -1) return targetGender === 'male' ? '父辈 (伯/叔/舅)' : '母辈 (姑/姨/婶)';
  if (genDiff === 0) return targetGender === 'male' ? '同辈 (堂/表兄弟)' : '同辈 (堂/表姐妹)';
  if (genDiff === 1) return targetGender === 'male' ? '晚辈 (侄子/外甥/儿子)' : '晚辈 (侄女/外甥女/女儿)';
  if (genDiff === 2) return targetGender === 'male' ? '孙辈 (孙子/外孙)' : '孙辈 (孙女/外孙女)';

  return genDiff > 0 ? '后代晚辈' : '前辈先祖';
}
