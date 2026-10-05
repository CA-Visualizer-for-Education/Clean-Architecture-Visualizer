export type RelationshipType = 'dependency' | 'implements' | 'extends';

export interface Relationship {
  fileName: string;
  relationshipType: RelationshipType;
}
