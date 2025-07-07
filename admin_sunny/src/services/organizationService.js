import api from './api';

const organizationService = {
  // Get all organizations
  getAllOrganizations: async () => {
    console.log('Fetching all organizations');
    
    try {
      const response = await api.get('/organization/list');
      console.log('Organization list API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Organization list API error:', error);
      throw error;
    }
  },

  // Get organization by code
  getOrganization: async (organizationCode) => {
    console.log('Fetching organization:', organizationCode);
    
    try {
      const response = await api.get('/organization', { 
        params: { 
          organization_code: organizationCode 
        } 
      });
      console.log('Organization API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Organization API error:', error);
      throw error;
    }
  },

  // Update organization
  updateOrganization: async (organizationData) => {
    console.log('Updating organization:', organizationData);
    
    try {
      const response = await api.put('/organization', organizationData);
      console.log('Update organization API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Update organization API error:', error);
      throw error;
    }
  }
};

export default organizationService;