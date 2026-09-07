/**
 * Implant Service Usage Examples
 * 
 * This file demonstrates how to use implantService.js
 * in various components (Admin and User side)
 */

import {
  getAllImplants,
  getImplantById,
  getImplantBySlug,
  createImplant,
  updateImplant,
  deleteImplant,
  toggleImplantStatus,
  getImageUrl,
  getImplantImages,
  getImplantThumbnail,
} from './implantService';

// ========================================
// Example 1: Fetch all implants (User Side)
// ========================================

const ImplantsList = () => {
  const [implants, setImplants] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchImplants = async () => {
      try {
        const data = await getAllImplants();
        setImplants(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchImplants();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {implants.map((implant) => (
        <div key={implant.id}>
          <h3>{implant.name}</h3>
          <img src={getImplantThumbnail(implant)} alt={implant.name} />
        </div>
      ))}
    </div>
  );
};

// ========================================
// Example 2: Fetch implant by slug (User Detail Page)
// ========================================

const ImplantDetailPage = () => {
  const { slug } = useParams();
  const [implant, setImplant] = React.useState(null);

  React.useEffect(() => {
    const fetchImplant = async () => {
      try {
        const data = await getImplantBySlug(slug);
        setImplant(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchImplant();
  }, [slug]);

  if (!implant) return <div>Loading...</div>;

  const images = getImplantImages(implant);

  return (
    <div>
      <h1>{implant.name}</h1>
      <div className="image-gallery">
        {images.map((url, index) => (
          <img key={index} src={url} alt={`${implant.name} - Image ${index + 1}`} />
        ))}
      </div>
      <p>{implant.brandDescription}</p>
    </div>
  );
};

// ========================================
// Example 3: Create implant with images (Admin Side)
// ========================================

const CreateImplantForm = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    brand: '',
    companyId: null,
    levelId: null,
  });
  const [imageFiles, setImageFiles] = React.useState({
    image1: null,
    image2: null,
    image3: null,
  });

  const handleImageChange = (key, event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFiles((prev) => ({
        ...prev,
        [key]: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare data with images
      const data = {
        ...formData,
        image1: imageFiles.image1,
        image2: imageFiles.image2,
        image3: imageFiles.image3,
      };

      const result = await createImplant(data);
      alert('Implant created successfully!');
      console.log('Created:', result);
    } catch (error) {
      alert('Error creating implant: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <label>Image 1:</label>
      <input type="file" accept="image/*" onChange={(e) => handleImageChange('image1', e)} />

      <label>Image 2:</label>
      <input type="file" accept="image/*" onChange={(e) => handleImageChange('image2', e)} />

      <label>Image 3:</label>
      <input type="file" accept="image/*" onChange={(e) => handleImageChange('image3', e)} />

      <button type="submit">Create Implant</button>
    </form>
  );
};

// ========================================
// Example 4: Update implant (Admin Side)
// ========================================

const EditImplantForm = ({ implantId }) => {
  const [formData, setFormData] = React.useState(null);
  const [newImages, setNewImages] = React.useState({});

  React.useEffect(() => {
    const fetchImplant = async () => {
      try {
        const data = await getImplantById(implantId);
        setFormData(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchImplant();
  }, [implantId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        // Only include new images that user uploaded
        ...newImages,
      };

      const result = await updateImplant(implantId, data);
      alert('Implant updated successfully!');
      console.log('Updated:', result);
    } catch (error) {
      alert('Error updating implant: ' + error.message);
    }
  };

  if (!formData) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      {/* Show existing images */}
      <div>
        <h4>Current Images:</h4>
        {getImplantImages(formData).map((url, index) => (
          <img key={index} src={url} alt={`Current ${index + 1}`} width="100" />
        ))}
      </div>

      {/* Upload new images */}
      <label>Upload new Image 1 (optional):</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files[0];
          if (file) setNewImages({ ...newImages, image1: file });
        }}
      />

      <button type="submit">Update Implant</button>
    </form>
  );
};

// ========================================
// Example 5: Delete implant (Admin Side)
// ========================================

const DeleteImplantButton = ({ implantId, onSuccess }) => {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this implant?')) {
      return;
    }

    try {
      await deleteImplant(implantId);
      alert('Implant deleted successfully!');
      if (onSuccess) onSuccess();
    } catch (error) {
      alert('Error deleting implant: ' + error.message);
    }
  };

  return <button onClick={handleDelete}>Delete</button>;
};

// ========================================
// Example 6: Toggle status (Admin Side)
// ========================================

const ToggleStatusButton = ({ implant, onSuccess }) => {
  const [loading, setLoading] = React.useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const result = await toggleImplantStatus(implant.id, implant.status);
      alert(`Status changed to: ${result.status}`);
      if (onSuccess) onSuccess(result);
    } catch (error) {
      alert('Error toggling status: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleToggle} disabled={loading}>
      {loading ? 'Loading...' : implant.status === 'Active' ? 'Deactivate' : 'Activate'}
    </button>
  );
};

// ========================================
// Example 7: Display images with fallback (User Side)
// ========================================

const ImplantImageGallery = ({ implant }) => {
  const images = getImplantImages(implant);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  if (images.length === 0) {
    return <div className="no-images">No images available</div>;
  }

  return (
    <div className="gallery">
      {/* Main image */}
      <div className="main-image">
        <img
          src={images[selectedIndex]}
          alt={`${implant.name} - Image ${selectedIndex + 1}`}
          onError={(e) => {
            e.target.src = '/placeholder.jpg'; // Fallback image
          }}
        />
      </div>

      {/* Thumbnails */}
      <div className="thumbnails">
        {images.map((url, index) => (
          <button key={index} onClick={() => setSelectedIndex(index)}>
            <img src={url} alt={`Thumbnail ${index + 1}`} width="50" />
          </button>
        ))}
      </div>
    </div>
  );
};

// ========================================
// Example 8: Create implant with base64 images
// ========================================

const CreateWithBase64Images = () => {
  const [imagePreview, setImagePreview] = React.useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result); // This is a data URL (base64)
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        name: 'Test Implant',
        brand: 'Straumann',
        image1: imagePreview, // Pass data URL directly
      };

      const result = await createImplant(data);
      console.log('Created:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileSelect} />
      {imagePreview && <img src={imagePreview} width="200" alt="Preview" />}
      <button onClick={handleSubmit}>Create with Base64</button>
    </div>
  );
};

// ========================================
// Example 9: Fetch with filters
// ========================================

const FilteredImplantsList = () => {
  const [implants, setImplants] = React.useState([]);

  React.useEffect(() => {
    const fetchFiltered = async () => {
      try {
        // Note: Backend doesn't support filters yet, 
        // so we fetch all and filter client-side
        const data = await getAllImplants();
        
        // Client-side filtering
        const filtered = data.filter((implant) => 
          implant.status === 'Active' && 
          implant.brand === 'Straumann'
        );
        
        setImplants(filtered);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchFiltered();
  }, []);

  return (
    <div>
      {implants.map((implant) => (
        <div key={implant.id}>{implant.name}</div>
      ))}
    </div>
  );
};

// ========================================
// Example 10: Real-time refresh on storage changes
// ========================================

const RealTimeImplantsList = () => {
  const [implants, setImplants] = React.useState([]);
  const [refreshKey, setRefreshKey] = React.useState(0);

  React.useEffect(() => {
    const fetchImplants = async () => {
      try {
        const data = await getAllImplants();
        setImplants(data);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    fetchImplants();

    // Listen for localStorage changes (from admin)
    const handleStorageChange = (event) => {
      if (event.key === 'admin_implants_v1') {
        console.log('📡 Data updated, refreshing...');
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', fetchImplants);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', fetchImplants);
    };
  }, [refreshKey]);

  return (
    <div>
      <h2>Implants (Real-time: {implants.length})</h2>
      {implants.map((implant) => (
        <div key={implant.id}>{implant.name}</div>
      ))}
    </div>
  );
};

// ========================================
// Notes and Best Practices
// ========================================

/*
✅ DO:
- Use getImageUrl() to resolve image paths
- Use getImplantThumbnail() for card/list views
- Use getImplantImages() for gallery views
- Handle errors with try-catch
- Provide loading states
- Use File objects directly when uploading from <input>
- Use data URLs when converting from canvas/cropped images

❌ DON'T:
- Don't hardcode API URLs - use environment variables
- Don't forget error handling
- Don't mix base64 with File objects unnecessarily
- Don't skip image optimization for large files

🔐 Authentication:
- implantService automatically includes auth token from localStorage
- Token key: 'admin_token' or 'auth_token'
- Backend expects: Authorization: Bearer <token>

🖼️ Image Formats Supported:
- File objects (from <input type="file">)
- Data URLs (base64) - will be converted to File
- Backend paths (/uploads/implants/...) - will be skipped on update

📝 FormData Structure:
POST/PUT /api/implants
- name: string
- brand: string
- companyId: number
- levelId: number
- image1: File
- image2: File
- image3: File

🔄 Real-time Updates:
1. Admin creates/updates implant → saved to localStorage
2. localStorage event fired
3. User side listens to 'storage' event
4. User side refreshes data automatically

🎯 URL Structure:
- List: /implants
- Brand: /implants/brand/:brand
- Detail: /implants/:slug

🌐 API Endpoints Used:
- GET    /api/implants          - Get all
- GET    /api/implants/:id      - Get by ID
- POST   /api/implants          - Create (FormData)
- PUT    /api/implants/:id      - Update (FormData)
- DELETE /api/implants/:id      - Delete

*/

export {
  // Examples (not meant to be imported, just for reference)
  ImplantsList,
  ImplantDetailPage,
  CreateImplantForm,
  EditImplantForm,
  DeleteImplantButton,
  ToggleStatusButton,
  ImplantImageGallery,
  CreateWithBase64Images,
  FilteredImplantsList,
  RealTimeImplantsList,
};
