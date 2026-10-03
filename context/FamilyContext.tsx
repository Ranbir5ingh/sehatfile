'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Person {
  id: number;
  name: string;
  relation: string;
  conditions: string[];
  created_at: string;
}

interface FamilyContextType {
  people: Person[];
  selectedPersonId: number | null;
  selectedPerson: Person | null;
  isLoadingPeople: boolean;
  setSelectedPersonId: (id: number) => void;
  fetchPeople: () => Promise<void>;
  createPerson: (name: string, relation: string) => Promise<Person>;
  deletePerson: (id: number) => Promise<void>;
  clearAllMembers: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: React.ReactNode }) {
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPersonId, setSelectedPersonIdState] = useState<number | null>(null);
  const [isLoadingPeople, setIsLoadingPeople] = useState(true);

  // Load people on initial mount
  useEffect(() => {
    fetchPeople();
  }, []);

  async function fetchPeople() {
    setIsLoadingPeople(true);
    try {
      const res = await fetch('/api/people');
      const data = await res.json();
      if (res.ok && Array.isArray(data.people)) {
        setPeople(data.people);

        // Restore selected person from localStorage if valid
        const savedId = typeof window !== 'undefined' ? localStorage.getItem('sehatfile_selected_person') : null;
        const savedIdNum = savedId ? parseInt(savedId, 10) : null;

        if (savedIdNum && data.people.some((p: Person) => p.id === savedIdNum)) {
          setSelectedPersonIdState(savedIdNum);
        } else if (data.people.length > 0) {
          setSelectedPersonIdState(data.people[0].id);
          if (typeof window !== 'undefined') {
            localStorage.setItem('sehatfile_selected_person', String(data.people[0].id));
          }
        } else {
          setSelectedPersonIdState(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem('sehatfile_selected_person');
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch family members:', err);
    } finally {
      setIsLoadingPeople(false);
    }
  }

  function setSelectedPersonId(id: number) {
    setSelectedPersonIdState(id);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sehatfile_selected_person', String(id));
    }
  }

  async function createPerson(name: string, relation: string): Promise<Person> {
    const res = await fetch('/api/people', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), relation: relation.trim() }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to add family member');
    }
    const newPerson: Person = data.person;
    setPeople((prev) => [...prev, newPerson]);
    setSelectedPersonId(newPerson.id);
    return newPerson;
  }

  async function deletePerson(id: number): Promise<void> {
    const res = await fetch(`/api/people/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to delete member');
    }
    setPeople((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      if (selectedPersonId === id) {
        const nextSelected = updated.length > 0 ? updated[0].id : null;
        setSelectedPersonIdState(nextSelected);
        if (typeof window !== 'undefined') {
          if (nextSelected) {
            localStorage.setItem('sehatfile_selected_person', String(nextSelected));
          } else {
            localStorage.removeItem('sehatfile_selected_person');
          }
        }
      }
      return updated;
    });
  }

  async function clearAllMembers(): Promise<void> {
    const res = await fetch('/api/people', { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to clear members');
    }
    setPeople([]);
    setSelectedPersonIdState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('sehatfile_selected_person');
    }
  }

  const selectedPerson = people.find((p) => p.id === selectedPersonId) || null;

  return (
    <FamilyContext.Provider
      value={{
        people,
        selectedPersonId,
        selectedPerson,
        isLoadingPeople,
        setSelectedPersonId,
        fetchPeople,
        createPerson,
        deletePerson,
        clearAllMembers,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
