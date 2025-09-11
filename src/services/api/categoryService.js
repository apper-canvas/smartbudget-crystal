class CategoryService {
  constructor() {
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'category_c';
  }

  async getAll() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "is_default_c"}}
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Transform to match UI field names
      return (response.data || []).map(item => ({
        Id: item.Id,
        Name: item.Name,
        Tags: item.Tags,
        name: item.name_c || item.Name,
        type: item.type_c,
        color: item.color_c,
        isDefault: item.is_default_c
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  }

  async getById(id) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "is_default_c"}}
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success || !response.data) {
        throw new Error(`Category with Id ${id} not found`);
      }

      const item = response.data;
      return {
        Id: item.Id,
        Name: item.Name,
        Tags: item.Tags,
        name: item.name_c || item.Name,
        type: item.type_c,
        color: item.color_c,
        isDefault: item.is_default_c
      };
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      throw error;
    }
  }

  async create(category) {
    try {
      const params = {
        records: [{
          Name: category.name,
          name_c: category.name,
          type_c: category.type,
          color_c: category.color,
          is_default_c: category.isDefault || false
        }]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create category:`, failed);
          throw new Error(failed[0].message || "Failed to create category");
        }
        
        if (successful.length > 0) {
          const item = successful[0].data;
          return {
            Id: item.Id,
            Name: item.Name,
            Tags: item.Tags,
            name: item.name_c || item.Name,
            type: item.type_c,
            color: item.color_c,
            isDefault: item.is_default_c
          };
        }
      }
      
      throw new Error("No data returned from create operation");
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  async update(id, updatedCategory) {
    try {
      const params = {
        records: [{
          Id: parseInt(id),
          Name: updatedCategory.name,
          name_c: updatedCategory.name,
          type_c: updatedCategory.type,
          color_c: updatedCategory.color,
          is_default_c: updatedCategory.isDefault
        }]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update category:`, failed);
          throw new Error(failed[0].message || "Failed to update category");
        }
        
        if (successful.length > 0) {
          const item = successful[0].data;
          return {
            Id: item.Id,
            Name: item.Name,
            Tags: item.Tags,
            name: item.name_c || item.Name,
            type: item.type_c,
            color: item.color_c,
            isDefault: item.is_default_c
          };
        }
      }
      
      throw new Error("No data returned from update operation");
    } catch (error) {
      console.error("Error updating category:", error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const params = { 
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete category:`, failed);
          throw new Error(failed[0].message || "Failed to delete category");
        }
        
        return { Id: parseInt(id) };
      }
      
      return { Id: parseInt(id) };
    } catch (error) {
      console.error("Error deleting category:", error);
      throw error;
    }
  }

  // Additional utility methods
  async getByType(type) {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "is_default_c"}}
        ],
        where: [
          {"FieldName": "type_c", "Operator": "EqualTo", "Values": [type], "Include": true}
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(item => ({
        Id: item.Id,
        Name: item.Name,
        Tags: item.Tags,
        name: item.name_c || item.Name,
        type: item.type_c,
        color: item.color_c,
        isDefault: item.is_default_c
      }));
    } catch (error) {
      console.error("Error fetching categories by type:", error);
      return [];
    }
  }

  async getDefaults() {
    try {
      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "name_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "color_c"}},
          {"field": {"Name": "is_default_c"}}
        ],
        where: [
          {"FieldName": "is_default_c", "Operator": "EqualTo", "Values": [true], "Include": true}
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return (response.data || []).map(item => ({
        Id: item.Id,
        Name: item.Name,
        Tags: item.Tags,
        name: item.name_c || item.Name,
        type: item.type_c,
        color: item.color_c,
        isDefault: item.is_default_c
      }));
    } catch (error) {
      console.error("Error fetching default categories:", error);
      return [];
    }
  }
}

export default new CategoryService();