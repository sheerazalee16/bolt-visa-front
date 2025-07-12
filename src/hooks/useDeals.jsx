import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo
} from 'react';
import { useAuth } from '@/hooks/useAuth.jsx';
import {
  fetchAllApplications,
  deleteApplication,
  addApplication,
  applicationStatus,
  editApplication
} from '../apis/admin/allApplications';
import { toast } from '@/components/ui/use-toast';

const DealsContext = createContext(null);

export const DealsProvider = ({ children }) => {
  const { user } = useAuth();
  const isAdminView = user?.role === 'Admin';

  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDeals = useCallback(async () => {
    // setLoading(true);
    let data = {};
    let allDeals = [];
    try {
      data = await fetchAllApplications();
      if (!data.success) {
        toast({
          title: "Deals Data not fetched!",
          description: data.error,
        });
      }
      allDeals =
        data?.data?.data?.applications ||
        data?.data?.applications ||
        data?.applications ||
        [];
      localStorage.setItem('bolt_visa_deals', JSON.stringify(allDeals));

      if (isAdminView) {
        setDeals(allDeals);
      } else if (user) {
        setDeals(allDeals.filter(deal => deal.createdBy._id === user.userId));
      } else {
        setDeals([]);
      }
    } catch (err) {
      const fallbackDeals = JSON.parse(localStorage.getItem('bolt_visa_deals') || '[]');
      if (isAdminView) {
        setDeals(fallbackDeals);
      } else if (user) {
        setDeals(fallbackDeals.filter(deal => deal.userId === user.id));
      } else {
        setDeals([]);
      }
    }
    setLoading(false);
  }, [user, isAdminView]);


  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  const addDeal = async (dealData) => {
    if (!user) return { success: false, error: "User not authenticated" };

    const allDeals = JSON.parse(localStorage.getItem('bolt_visa_deals') || '[]');

    try {
      const result = await addApplication(dealData);
      if (result.success) {
        allDeals.push(result?.data?.data);
        localStorage.setItem('bolt_visa_deals', JSON.stringify(allDeals));
        setLoading(true)
        await loadDeals();
        setLoading(false)
        return { success: true };
      } else {
        return { success: result.status, error: result.error };
      }
    } catch (err) {
      setDeals(false)
      console.log('addDeal error: ', err);
    }
  };

  const updateUserEarningsOnApproval = (dealUserId, dealType) => {
    const users = JSON.parse(localStorage.getItem('bolt_visa_users') || '[]');
    const userIndex = users.findIndex(u => u.id === dealUserId);

    if (userIndex !== -1) {
      const reward = dealType === 'main' ? 2000 : 1000;
      users[userIndex].totalEarnings = (users[userIndex].totalEarnings || 0) + reward;

      if (dealType === 'Main Deal') {
        users[userIndex].mainDeals = (users[userIndex].mainDeals || 0) + 1;
      } else {
        users[userIndex].referenceDeals = (users[userIndex].referenceDeals || 0) + 1;
      }

      localStorage.setItem('bolt_visa_users', JSON.stringify(users));

      if (user && user.id === dealUserId) {
        const currentUserSession = JSON.parse(localStorage.getItem('bolt_visa_user'));
        if (currentUserSession) {
          currentUserSession.totalEarnings = users[userIndex].totalEarnings;
          currentUserSession.mainDeals = users[userIndex].mainDeals;
          currentUserSession.referenceDeals = users[userIndex].referenceDeals;
          localStorage.setItem('bolt_visa_user', JSON.stringify(currentUserSession));
        }
      }
    }
  };

  const updateDeal = async (id, updates, editable = false) => {
    const allDeals = JSON.parse(localStorage.getItem('bolt_visa_deals') || '[]');
    const index = allDeals.findIndex(deal => deal._id === id);

    if (index !== -1) {
      try {
        allDeals[index] = { ...allDeals[index], ...updates };
        localStorage.setItem('bolt_visa_deals', JSON.stringify(allDeals));

        if (editable) {
          setLoading(true)
          const result = await editApplication(id, updates);
          if (result.success) {
            setLoading(false)
          }
          await loadDeals();
          return { success: result.success };
        } else {
          setLoading(true)

          const result = await applicationStatus({ applicationId: id, status: updates.status, caseId: "" });
          if (result.success) {
            setDeals(false)
          }
          await loadDeals();
          return { success: true };
        }
      } catch (err) {
        console.log('updateDeal error: ', err);
        setDeals(false)

        return { success: false, error: 'Error updating deal' };
      }
    }

    return { success: false, error: 'Deal not found' };
  };

  const deleteDeal = async (id) => {
    const allDeals = JSON.parse(localStorage.getItem('bolt_visa_deals') || '[]');
    const filteredDeals = allDeals.filter(deal => deal.id !== id);
    localStorage.setItem('bolt_visa_deals', JSON.stringify(filteredDeals));
    const response = await deleteApplication(id);
    await loadDeals();
    return response?.success;
  };

  const approveDeal = (id) => {
    const allDeals = JSON.parse(localStorage.getItem('bolt_visa_deals') || '[]');
    const dealIndex = allDeals.findIndex(d => d._id === id);
    if (dealIndex !== -1) {
      const dealToApprove = allDeals[dealIndex];
      if (dealToApprove.status !== 'approved') {
        updateUserEarningsOnApproval(dealToApprove.userId, dealToApprove.dealType);
      }
      return updateDeal(id, { status: 'approved', approvedAt: new Date().toISOString() });
    }
    return { success: false, error: "Deal not found for approval." };
  };

  const rejectDeal = (id, reason) => {
    console.log('id ... ', id)

    return updateDeal(id, {
      status: 'rejected',
      rejectedAt: new Date().toISOString(),
      rejectionReason: reason
    });
  };

  const contextValue = useMemo(() => ({
    deals,
    loading,
    addDeal,
    updateDeal,
    deleteDeal,
    approveDeal,
    rejectDeal,
    refreshDeals: loadDeals
  }), [deals, loading, addDeal, updateDeal, deleteDeal, approveDeal, rejectDeal, loadDeals]);

  return (
    <DealsContext.Provider value={contextValue}>
      {children}
    </DealsContext.Provider>
  );
};

export const useDeals = () => {
  const context = useContext(DealsContext);
  if (!context) {
    throw new Error("useDeals must be used within a DealsProvider");
  }
  return context;
};
