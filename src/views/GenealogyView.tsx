import React from 'react';
import { GenealogyTreeCanvas } from '../components/tree/GenealogyTreeCanvas';
import { FamilyMember, GenerationOrder } from '../types/genealogy';

interface GenealogyViewProps {
  members: FamilyMember[];
  generationOrders: GenerationOrder[];
  boundMemberId?: string;
  onSelectMember: (member: FamilyMember) => void;
  onAddChild: (parent: FamilyMember) => void;
  onAddSpouse: (member: FamilyMember) => void;
}

export const GenealogyView: React.FC<GenealogyViewProps> = ({
  members,
  generationOrders,
  boundMemberId,
  onSelectMember,
  onAddChild,
  onAddSpouse,
}) => {
  return (
    <div className="w-full h-full pb-16">
      <GenealogyTreeCanvas
        members={members}
        generationOrders={generationOrders}
        boundMemberId={boundMemberId}
        onSelectMember={onSelectMember}
        onAddChild={onAddChild}
        onAddSpouse={onAddSpouse}
      />
    </div>
  );
};
