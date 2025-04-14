import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';
import { useHistory } from './HistoryContext';
import { supabase } from '../lib/supabase';
import { toast } from 'react-hot-toast';

export type RelationType = 'document' | 'test' | 'material' | 'nc' | 'checklist' | 'rfi';

export interface Relationship {
  id: string;
  sourceType: RelationType;
  sourceId: string;
  targetType: RelationType;
  targetId: string;
  createdAt: string;
  createdBy: string;
  projectId: string;
}

interface RelationshipContextType {
  addRelationship: (
    sourceType: RelationType,
    sourceId: string,
    targetType: RelationType,
    targetId: string,
    projectId: string
  ) => Promise<void>;
  removeRelationship: (id: string) => Promise<void>;
  getRelatedItems: (type: RelationType, id: string) => Promise<{
    type: RelationType;
    id: string;
  }[]>;
  getRelationships: (type: RelationType, id: string) => Promise<Relationship[]>;
}

const RelationshipContext = createContext<RelationshipContextType | undefined>(undefined);

export function RelationshipProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { addHistoryItem } = useHistory();

  const addRelationship = async (
    sourceType: RelationType,
    sourceId: string,
    targetType: RelationType,
    targetId: string,
    projectId: string
  ) => {
    if (!user) throw new Error('User not authenticated');
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('relationships')
        .insert({
          source_type: sourceType,
          source_id: sourceId,
          target_type: targetType,
          target_id: targetId,
          created_by: user.id,
          project_id: projectId
        })
        .select()
        .single();

      if (error) throw error;

      // Add to history for both items
      addHistoryItem(
        sourceId,
        sourceType,
        'update',
        [{ field: 'relationships', newValue: `Added relationship with ${targetType} ${targetId}` }]
      );

      addHistoryItem(
        targetId,
        targetType,
        'update',
        [{ field: 'relationships', newValue: `Added relationship with ${sourceType} ${sourceId}` }]
      );

      toast.success('Relacionamento adicionado com sucesso');
    } catch (error) {
      console.error('Error adding relationship:', error);
      toast.error('Erro ao adicionar relacionamento');
      throw error;
    }
  };

  const removeRelationship = async (id: string) => {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { error } = await supabase
        .from('relationships')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Relacionamento removido com sucesso');
    } catch (error) {
      console.error('Error removing relationship:', error);
      toast.error('Erro ao remover relacionamento');
      throw error;
    }
  };

  const getRelatedItems = async (type: RelationType, id: string) => {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data: sourceRelations, error: sourceError } = await supabase
        .from('relationships')
        .select('target_type, target_id')
        .eq('source_type', type)
        .eq('source_id', id);

      const { data: targetRelations, error: targetError } = await supabase
        .from('relationships')
        .select('source_type, source_id')
        .eq('target_type', type)
        .eq('target_id', id);

      if (sourceError || targetError) throw sourceError || targetError;

      const relatedItems = [
        ...(sourceRelations || []).map(r => ({ type: r.target_type, id: r.target_id })),
        ...(targetRelations || []).map(r => ({ type: r.source_type, id: r.source_id }))
      ];

      return relatedItems;
    } catch (error) {
      console.error('Error getting related items:', error);
      return [];
    }
  };

  const getRelationships = async (type: RelationType, id: string) => {
    if (!supabase) throw new Error('Supabase not initialized');

    try {
      const { data, error } = await supabase
        .from('relationships')
        .select('*')
        .or(`source_type.eq.${type},target_type.eq.${type}`)
        .or(`source_id.eq.${id},target_id.eq.${id}`);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error getting relationships:', error);
      return [];
    }
  };

  const value = {
    addRelationship,
    removeRelationship,
    getRelatedItems,
    getRelationships
  };

  return (
    <RelationshipContext.Provider value={value}>
      {children}
    </RelationshipContext.Provider>
  );
}

export function useRelationship() {
  const context = useContext(RelationshipContext);
  if (context === undefined) {
    throw new Error('useRelationship must be used within a RelationshipProvider');
  }
  return context;
}