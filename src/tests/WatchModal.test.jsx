
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
        
        // default mock implementation
        api.brands.getAll.mockResolvedValue(mockBrands);
        validateImageUrl.mockImplementation((url) => !!url);
        isImageUrlAccessible.mockResolvedValue(true);
      });

    // test basic rendering
    it('should not render anything when isOpen is false', () => {
        const { container } = render(
            <WatchModal {...defaultProps} isOpen={false} />
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('should render as "Add New Watch" when no watch provided', async () => {
        render(<WatchModal {...defaultProps} />);

        await waitFor(() => {
            expect(api.brands.getAll).toHaveBeenCalled();
        });

        expect(screen.getByText('Add New Watch')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add watch/i })).toBeInTheDocument();
    });

    it('should render as "Edit Watch" when a watch is provided', async () => {
        const mockWatch = {
          _id: 'watch1',
          brand: { _id: 'brand1', brand_name: 'Rolex' },
          model: 'Submariner',
          year: 2022,
          rental_day_price: 50,
          condition: 'Excellent',
          quantity: 3,
          image_url: 'https://example.com/watch.jpg',
        };
    
        render(<WatchModal {...defaultProps} watch={mockWatch} />);
        
        await waitFor(() => {
          expect(api.brands.getAll).toHaveBeenCalled();
        });
        
        expect(screen.getByText('Edit Watch')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /update watch/i })).toBeInTheDocument();
    });
    

});