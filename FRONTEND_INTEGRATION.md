/**
 * FRONTEND INTEGRATION GUIDE
 * 
 * This file shows how to update the FamilyTreePage component
 * to use the new backend API endpoints.
 * 
 * Replace the submitTree function in your component with the code below:
 */

// Updated submitTree function to use the correct API endpoint
const submitTree = async () => {
  if (people.length === 0) {
    setDialogMessage('Add at least one family member before submitting.');
    setIsError(true);
    setShowDialog(true);
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) {
    setDialogMessage('Please log in to save your family tree.');
    setIsError(true);
    setShowDialog(true);
    return;
  }

  const focal = rootId ? idMap.get(rootId) : null;
  const payload = {
    rootId,
    memberCount: people.length,
    members: people.map(person => ({
      externalId: person.id,
      name: person.name,
      gender: person.gender,
      birthYear: person.birthYear ?? null,
      birthMonth: person.birthMonth ?? null,
      deathYear: person.deathYear ?? null,
      parentIds: person.parentIds,
      spouseIds: person.spouseIds,
      childrenIds: person.childrenIds,
      relationshipToRoot: focal ? getRelationshipLabel(person, focal, idMap) : null,
    })),
  };

  setIsSubmitting(true);
  try {
    // Updated endpoint - use /api/v1/family-tree instead of /api/family-tree
    const response = await fetch('/api/v1/family-tree', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.status?.returnCode === 201) {
      throw new Error(data.status?.returnMessage || 'Failed to save family tree');
    }

    resetTree();
    setDialogMessage(data.status?.returnMessage || 'Family tree saved successfully!');
    setIsError(false);
    setShowDialog(true);
  } catch (error) {
    setDialogMessage(
      error instanceof Error ? error.message : 'Failed to save family tree. Please try again.'
    );
    setIsError(true);
    setShowDialog(true);
  } finally {
    setIsSubmitting(false);
  }
};

/**
 * ADDITIONAL FUNCTIONS FOR EXTENDED FEATURES
 * 
 * These functions show how to use other API endpoints:
 */

// Load family tree from backend on component mount
const loadFamilyTree = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch('/api/v1/family-tree', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok && data.data) {
      const treeData = data.data;
      setPeople(treeData.members);
      setRootId(treeData.rootId);
      if (treeData.members.length > 0) {
        setSelectedId(treeData.members[0].id);
      }
      // Reset history after loading
      pushHistory({
        people: treeData.members,
        rootId: treeData.rootId,
        selectedId: treeData.members[0]?.id || '',
      });
    }
  } catch (error) {
    console.error('Error loading family tree:', error);
  }
};

// Get family tree statistics
const getTreeStats = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch('/api/v1/family-tree/stats', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok && data.data) {
      console.log('Family Tree Stats:', data.data);
      return data.data;
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
  }
};

// Add single member (real-time sync with backend)
const addMemberToBackend = async (member) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch('/api/v1/family-tree/member', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(member),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Member added to backend:', data.data);
      return data.data;
    } else {
      throw new Error(data.status?.returnMessage || 'Failed to add member');
    }
  } catch (error) {
    console.error('Error adding member to backend:', error);
  }
};

// Update member on backend
const updateMemberOnBackend = async (memberId, updates) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`/api/v1/family-tree/member/${memberId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Member updated on backend:', data.data);
      return data.data;
    } else {
      throw new Error(data.status?.returnMessage || 'Failed to update member');
    }
  } catch (error) {
    console.error('Error updating member:', error);
  }
};

// Delete member from backend
const deleteMemberFromBackend = async (memberId) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch(`/api/v1/family-tree/member/${memberId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log('Member deleted from backend');
      return true;
    } else {
      const data = await response.json();
      throw new Error(data.status?.returnMessage || 'Failed to delete member');
    }
  } catch (error) {
    console.error('Error deleting member:', error);
  }
};

// Delete entire family tree
const deleteTreeFromBackend = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch('/api/v1/family-tree', {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      console.log('Family tree deleted from backend');
      return true;
    } else {
      const data = await response.json();
      throw new Error(data.status?.returnMessage || 'Failed to delete tree');
    }
  } catch (error) {
    console.error('Error deleting tree:', error);
  }
};

// Get filtered members (e.g., all females, or specific relationships)
const getFilteredMembers = async (filters) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const params = new URLSearchParams();
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.relationshipToRoot) params.append('relationshipToRoot', filters.relationshipToRoot);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.offset) params.append('offset', filters.offset);

    const response = await fetch(`/api/v1/family-tree/members?${params}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (response.ok && data.data) {
      console.log('Filtered members:', data.data);
      return data.data;
    }
  } catch (error) {
    console.error('Error fetching filtered members:', error);
  }
};

export {
  submitTree,
  loadFamilyTree,
  getTreeStats,
  addMemberToBackend,
  updateMemberOnBackend,
  deleteMemberFromBackend,
  deleteTreeFromBackend,
  getFilteredMembers,
};
