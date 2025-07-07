import api from './api';

const uploadService = {
  // Get presigned URL for file upload
  getPresignedUrl: async (eventCode, expiration = 3600) => {
    console.log('Getting presigned URL for event:', eventCode);
    
    try {
      const payload = {
        event_code: eventCode,
        expiration: expiration
      };
      
      const response = await api.post('/presigned-url', payload);
      console.log('Presigned URL response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Presigned URL API error:', error);
      throw error;
    }
  },

  // Upload file to S3 using presigned URL
  uploadFileToS3: async (presignedUrl, file) => {
    console.log('Uploading file to S3:', file.name);
    
    try {
      const response = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        body: file
      });
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
      console.log('File uploaded successfully to S3');
      return response;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw error;
    }
  },

  // Complete upload process: get presigned URL and upload file
  uploadFile: async (eventCode, file, expiration = 3600) => {
    try {
      // Step 1: Get presigned URL
      const presignedData = await uploadService.getPresignedUrl(eventCode, expiration);
      
      // Step 2: Upload file to S3
      await uploadService.uploadFileToS3(presignedData.url, file);
      
      return {
        success: true,
        fileKey: presignedData.file_key,
        url: presignedData.url,
        expiresIn: presignedData.expires_in
      };
    } catch (error) {
      console.error('Upload process failed:', error);
      throw error;
    }
  },

  // Validate file before upload
  validateFile: (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];
    
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (!validTypes.includes(file.type)) {
      throw new Error('지원되지 않는 파일 형식입니다. Excel 파일(.xlsx, .xls) 또는 CSV 파일을 업로드해주세요.');
    }
    
    if (file.size > maxSize) {
      throw new Error('파일 크기가 너무 큽니다. 10MB 이하의 파일을 업로드해주세요.');
    }
    
    return true;
  }
};

export default uploadService;