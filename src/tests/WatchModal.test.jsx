
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { api } from '../utils/api';
import { WatchModal } from '../components/WatchModal';
import { validateImageUrl, isImageUrlAccessible, getImagePlaceholder } from '../utils/imageUtils';

// need to mock api 
vi.mock('../utils/api', () => {
    return {
        api: {
            brands: {
                getAll:vi.fn(),
                create:vi.fn(),
            }
        }
    }
});

// mock image utils 
vi.mock('../utils/imageUtils', () => {
    return {
        validateImageUrl: vi.fn(),
        isImageUrlAccessible: vi.fn(),
        getImagePlaceholder: vi.fn(() => 'placeholder-img-url'),
    };
});

// mock lucide-react icons
vi.mock('lucide-react', () => ({
    Upload: () => <div data-testid="upload-icon">UploadIcon</div>,
    X: () => <div data-testid="x-icon">XIcon</div>,
}));

// props for testing
describe('WatchModal Component', () => {
    const defaultProps = {
      isOpen: true,
      onClose: vi.fn(),
      onSave: vi.fn(),
      watch: null,
    };
    const mockBrands = [
        { _id: 'brand1', brand_name: 'Rolex' },
        { _id: 'brand2', brand_name: 'Omega' },
      ];
    
      beforeEach(() => {
        vi.clearAllMocks();
        
        // Default mock implementations
        api.brands.getAll.mockResolvedValue(mockBrands);
        validateImageUrl.mockImplementation((url) => !!url);
        isImageUrlAccessible.mockResolvedValue(true);
      });
});