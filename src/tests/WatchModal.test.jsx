
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

    // testing form handles data correctly 
    it('should populate form with watch data when editing', async () => {
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
        
        // check that form fields are populated correctly
        expect(screen.getByLabelText(/model/i)).toHaveValue('Submariner');
        expect(screen.getByLabelText(/year/i)).toHaveValue(2022);
        expect(screen.getByLabelText(/price\/day/i)).toHaveValue(50);
        expect(screen.getByLabelText(/condition/i)).toHaveValue('Excellent');
        expect(screen.getByLabelText(/quantity/i)).toHaveValue(3);
        expect(screen.getByLabelText(/image url/i)).toHaveValue('https://example.com/watch.jpg');
      });

      // test functionality to manage brands

      it('should load brands on mount and select first brand by default', async () => {
        render(<WatchModal {...defaultProps} />);
        
        await waitFor(() => {
          expect(api.brands.getAll).toHaveBeenCalled();
        });
        
        const brandSelect = screen.getByLabelText(/brand/i);
        expect(brandSelect).toBeInTheDocument();
        
        // First brand should be selected by default
        expect(brandSelect).toHaveValue('brand1');
        
        // Both brands should be in dropdown
        expect(screen.getByText('Rolex')).toBeInTheDocument();
        expect(screen.getByText('Omega')).toBeInTheDocument();
      });
    
      it('should show loading state while fetching brands', async () => {
        // mock delayed api response
        api.brands.getAll.mockImplementation(() => new Promise(resolve => {
          setTimeout(() => resolve(mockBrands), 100);
        }));
    
        render(<WatchModal {...defaultProps} />);
        
        // Loading indicator should be visible initially
        expect(screen.getByText('Loading brands...')).toBeInTheDocument();
        
        // After loading completes, the select should be visible
        await waitFor(() => {
          expect(screen.queryByText('Loading brands...')).not.toBeInTheDocument();
          expect(screen.getByLabelText(/brand/i)).toBeInTheDocument();
        });
      });
    
      it('should toggle brand creation form', async () => {
        render(<WatchModal {...defaultProps} />);
        
        await waitFor(() => {
          expect(api.brands.getAll).toHaveBeenCalled();
        });
        
        // add brand form should not be visible on start
        expect(screen.queryByPlaceholderText(/enter new brand name/i)).not.toBeInTheDocument();
        
        // test click add brand button
        fireEvent.click(screen.getByTitle('Add new brand'));
        
        // new brand input should be visible
        expect(screen.getByPlaceholderText(/enter new brand name/i)).toBeInTheDocument();
        
        // cancel button should be visible
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        expect(cancelButton).toBeInTheDocument();
        
        // clicking cancel should hide the form
        fireEvent.click(cancelButton);
        
        // new brand input should be hidden again
        expect(screen.queryByPlaceholderText(/enter new brand name/i)).not.toBeInTheDocument();
      });

});