import { baseUrl, railwayBaseUrl } from "../../utils";


async function fetchAllApplications() {
  try {
    const token = localStorage.getItem('bolt_visa_token');
    const res = await fetch(`${railwayBaseUrl}/application?page=1&limit=50`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || 'Failed to fetch users' };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}


async function deleteApplication(id) {
  try {
    const token = localStorage.getItem('bolt_visa_token');
    const res = await fetch(`${railwayBaseUrl}/applications/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || 'Failed to fetch users' };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}


async function addApplication(applicationData) {
  try {
    const token = localStorage.getItem('bolt_visa_token');
    const formData = new FormData();

    // Basic fields
    if (applicationData.type) formData.append('type', applicationData.type);
    if (applicationData.dealType) formData.append('dealType', applicationData.dealType);
    if (applicationData.dealType) formData.append('visaType', applicationData.visaType);
    if (applicationData.applyFrom) formData.append('applyFrom', applicationData.applyFrom);
    if (applicationData.destination) formData.append('destination', applicationData.destination);

    // Client Info
    if (Array.isArray(applicationData.clientInfo)) {
      applicationData.clientInfo.forEach((info, index) => {
        Object.entries(info).forEach(([key, value]) => {
          formData.append(`clientInfo[${index}][${key}]`, value);
        });
      });
    }

    // Payment Info
    if (applicationData.payment?.totalAmount !== undefined) {
      formData.append('payment[totalAmount]', String(applicationData.payment.totalAmount));
    }

    if (applicationData.payment?.paidAmount !== undefined) {
      formData.append('payment[paidAmount]', String(applicationData.payment.paidAmount));
    }
    if (applicationData.payment?.overallPaymentMethod !== undefined) {
      formData.append('payment[overallPaymentMethod]', String(applicationData.payment.overallPaymentMethod));
    }

    if (Array.isArray(applicationData.payment?.installments)) {
      applicationData.payment.installments.forEach((installment, index) => {
        Object.entries(installment).forEach(([key, value]) => {
          formData.append(`payment[installments][${index}][${key}]`, String(value));
        });
      });
    }

    const res = await fetch(`${railwayBaseUrl}/application/create-applicaiton`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // DO NOT set 'Content-Type' when using FormData
      },
      body: formData
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || 'Failed to create application' };
    }

    console.log('Application created:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Create error:', error);
    return { success: false, error: 'Network error' };
  }
}


async function applicationStatus(addDeal) {
  try {
    const token = localStorage.getItem('bolt_visa_token');
    const res = await fetch(`${railwayBaseUrl}/application/update-application-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(addDeal),
    });

    const data = await res.json();
    if (!res.ok) {
      return { success: false, error: data.message || 'Failed to fetch users' };
    }
    console.log('deal added ', data)
    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}

async function editApplication(id, updates) {
  try {
    const token = localStorage.getItem('bolt_visa_token');
    const formData = new FormData();

    // Basic fields
    if (updates.applyFrom) formData.append('applyFrom', updates.applyFrom);
    if (updates.caseId) formData.append('caseId', updates.caseId);
    if (updates.dealType) formData.append('dealType', updates.dealType);
    if (updates.dealType) formData.append('visaType', updates.visaType);
    if (updates.destination) formData.append('destination', updates.destination);
    if (updates.status) formData.append('status', updates.status);

    // Client Info (Array)
    if (Array.isArray(updates.clientInfo)) {
      updates.clientInfo.forEach((info, index) => {
        Object.entries(info).forEach(([key, value]) => {
          formData.append(`clientInfo[${index}][${key}]`, value);
        });
      });
    }

    // Payment installments
    if (updates.payment?.installments) {
      updates.payment.installments.forEach((installment, index) => {
        Object.entries(installment).forEach(([key, value]) => {
          formData.append(`payment[installments][${index}][${key}]`, String(value));
        });
      });
    }

    const res = await fetch(`${railwayBaseUrl}/application/update-application?id=${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // Don't set Content-Type for FormData
      },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      return { success: false, error: data.message || 'Failed to edit application' };
    }

    console.log('Application edited:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Edit error:', error);
    return { success: false, error: 'Network error' };
  }
}


export { fetchAllApplications, deleteApplication, addApplication, applicationStatus, editApplication };
