
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

      // error handling and form validation

      it('should validate and create new brand', async () => {
        const newBrand = { _id: 'brand3', brand_name: 'Patek Philippe' };
        api.brands.create.mockResolvedValue(newBrand);
    
        render(<WatchModal {...defaultProps} />);
        
        await waitFor(() => {
          expect(api.brands.getAll).toHaveBeenCalled();
        });
        
        // add brand button click
        fireEvent.click(screen.getByTitle('Add new brand'));
        
        // new brand name input
        const brandInput = screen.getByPlaceholderText(/enter new brand name/i);
        fireEvent.change(brandInput, { target: { value: 'Patek Philippe' } });
        
        // add button click
        const addButton = screen.getByRole('button', { name: /add$/i });
        fireEvent.click(addButton);
        
        // check api called correctly
        await waitFor(() => {
          expect(api.brands.create).toHaveBeenCalledWith({ brand_name: 'Patek Philippe' });
        });
        
        // form should return to brand select with new brand selected
        await waitFor(() => {
          expect(screen.queryByPlaceholderText(/enter new brand name/i)).not.toBeInTheDocument();
        });
      });
    
      it('should validate empty brand name', async () => {
        render(<WatchModal {...defaultProps} />);
        
        await waitFor(() => {
          expect(api.brands.getAll).toHaveBeenCalled();
        });
        
        // add brand button click
        fireEvent.click(screen.getByTitle('Add new brand'));
        
        // add without entering a name click
        const addButton = screen.getByRole('button', { name: /add$/i });
        fireEvent.click(addButton);
        
        // should show error msg
        expect(screen.getByText('Brand name cannot be empty')).toBeInTheDocument();
        
        // should not call api
        expect(api.brands.create).not.toHaveBeenCalled();
      });
    
      it('should handle image URL validation', async () => {
        // mock validateImageUrl fail
        validateImageUrl.mockReturnValue(false);
        
        render(<WatchModal {...defaultProps} />);
        
        await waitFor(() => {
          expect(api.brands.getAll).toHaveBeenCalled();
        });
        
        // invalid image URL input
        const imageUrlInput = screen.getByLabelText(/image url/i);
        fireEvent.change(imageUrlInput, { target: { value: 'invalid-url' } });
        
        // should show error msg
        await waitFor(() => {
          expect(screen.getByText('Please enter a valid image URL')).toBeInTheDocument();
        });
      });
    
      it('should handle inaccessible image URLs', async () => {
        // Img URL valid but not accessible
        validateImageUrl.mockReturnValue(true);
        isImageUrlAccessible.mockResolvedValue(false);
        getImagePlaceholder.mockReturnValue('placeholder-url');
        
        render(<WatchModal {...defaultProps} />);
        
        await waitFor(() => {
          expect(api.brands.getAll).toHaveBeenCalled();
        });
        
        // valid but inaccessible img URL input
        const imageUrlInput = screen.getByLabelText(/image url/i);
        fireEvent.change(imageUrlInput, { target: { value: 'https://example.com/nonexistent.jpg' } });
        
        // should show error msg
        await waitFor(() => {
          expect(screen.getByText('Cannot load image. Please check the URL.')).toBeInTheDocument();
        });
      });

      // tests for form submission 

      it('should call onSave with correct data when form is submitted', async () => {
        const mockWatch = null; // Add mode
        const expectedFormData = {
          brand_id: 'brand1',
          model: 'Submariner',
          year: 2022,
          rental_day_price: 50,
          condition: 'New',
          quantity: 2,
          image_url: 'https://example.com/watch.jpg',
        };
        
        validateImageUrl.mockReturnValue(true);
        isImageUrlAccessible.mockResolvedValue(true);
        
        render(<WatchModal {...defaultProps} watch={mockWatch} />);
        
        await waitFor(() => {
          expect(api.brands.getAll).toHaveBeenCalled();
        });
        
        // Fill out the form
        const modelInput = screen.getByLabelText(/model/i);
        fireEvent.change(modelInput, { target: { value: 'Submariner' } });
        
        const yearInput = screen.getByLabelText(/year/i);
        fireEvent.change(yearInput, { target: { value: '2022' } });
        
        const priceInput = screen.getByLabelText(/price\/day/i);
        fireEvent.change(priceInput, { target: { value: '50' } });
        
        const conditionSelect = screen.getByLabelText(/condition/i);
        fireEvent.change(conditionSelect, { target: { value: 'New' } });
        
        const quantityInput = screen.getByLabelText(/quantity/i);
        fireEvent.change(quantityInput, { target: { value: '2' } });
        
        const imageUrlInput = screen.getByLabelText(/image url/i);
        fireEvent.change(imageUrlInput, { target: { value: 'https://example.com/watch.jpg' } });
        
        // Submit the form
        const submitButton = screen.getByRole('button', { name: /add watch/i });
        fireEvent.click(submitButton);
        
        // Check that onSave was called with correct data
        await waitFor(() => {
          expect(defaultProps.onSave).toHaveBeenCalledWith(
            expect.objectContaining(expectedFormData),
            'add'
          );
        });
      });
    
      it('should call onSave with correct mode when editing', async () => {
        const mockWatch = {
          _id: 'watch1',
          brand: { _id: 'brand1', brand_name: 'Rolex' },
          model: 'Submariner',
          year: 2020,
          rental_day_price: 45,
          condition: 'Good',
          quantity: 3,
          image_url: '',
        };
        
        render(<WatchModal {...defaultProps} watch={mockWatch} />);
        
        await waitFor(() => {
          expect(api.brands.getAll).toHaveBeenCalled();
        });
        
        // Update the price
        const priceInput = screen.getByLabelText(/price\/day/i);
        fireEvent.change(priceInput, { target: { value: '50' } });
        
        // Submit the form
        const submitButton = screen.getByRole('button', { name: /update watch/i });
        fireEvent.click(submitButton);
        
        // Check that onSave was called with correct data and mode
        await waitFor(() => {
          expect(defaultProps.onSave).toHaveBeenCalledWith(
            expect.objectContaining({
              brand_id: 'brand1',
              rental_day_price: 50,
            }),
            'edit'
          );
        });
      });
    
      it('should display error messages from API calls', async () => {
        // Mock API error
        const errorMessage = 'Failed to load brands';
        api.brands.getAll.mockRejectedValue(new Error(errorMessage));
        
        render(<WatchModal {...defaultProps} />);
        
        // Error message should be displayed
        await waitFor(() => {
          expect(screen.getByText('Failed to load brands. Please try again.')).toBeInTheDocument();
        });
      });
    
      it('should validate required fields on submit', async () => {
        render(<WatchModal {...defaultProps} />);
        
        await waitFor(() => {
          expect(api.brands.getAll).toHaveBeenCalled();
        });
        
        // Clear the model field (required)
        const modelInput = screen.getByLabelText(/model/i);
        fireEvent.change(modelInput, { target: { value: '' } });
        
        // Submit the form
        const submitButton = screen.getByRole('button', { name: /add watch/i });
        fireEvent.click(submitButton);
        
        // Form should not have been submitted
        expect(defaultProps.onSave).not.toHaveBeenCalled();
      });
    
      it('should handle numeric inputs correctly', async () => {
        render(<WatchModal {...defaultProps} />);
        
        await waitFor(() => {
          expect(api.brands.getAll).toHaveBeenCalled();
        });
        
        // Enter negative values for numeric fields
        const yearInput = screen.getByLabelText(/year/i);
        fireEvent.change(yearInput, { target: { value: '-2000' } });
        
        const priceInput = screen.getByLabelText(/price\/day/i);
        fireEvent.change(priceInput, { target: { value: '-10' } });
        
        const quantityInput = screen.getByLabelText(/quantity/i);
        fireEvent.change(quantityInput, { target: { value: '-5' } });
        
        // HTML validation should prevent this, but we're checking the form processing
        // For year, it should respect the min attribute
        // For price and quantity, negative values are converted to numbers
        
        // Fill required model field
        const modelInput = screen.getByLabelText(/model/i);
        fireEvent.change(modelInput, { target: { value: 'Test Model' } });
        
        // Submit the form
        const submitButton = screen.getByRole('button', { name: /add watch/i });
        fireEvent.click(submitButton);
        
        // Check that onSave was called with correct numeric conversions
        await waitFor(() => {
          expect(defaultProps.onSave).toHaveBeenCalledWith(
            expect.objectContaining({
              year: -2000, // This would normally be prevented by min attribute
              rental_day_price: -10,
              quantity: -5,
            }),
            'add'
          );
        });
      });
    
      it('should close modal when cancel button is clicked', async () => {
        render(<WatchModal {...defaultProps} />);
        
        await waitFor(() => {
          expect(api.brands.getAll).toHaveBeenCalled();
        });
        
        // Click the cancel button
        const cancelButton = screen.getByRole('button', { name: /cancel/i });
        fireEvent.click(cancelButton);
        
        // onClose should have been called
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    
      it('should close modal when X button is clicked', async () => {
        render(<WatchModal {...defaultProps} />);
        
        await waitFor(() => {
          expect(api.brands.getAll).toHaveBeenCalled();
        });
        
        // Click the close button (X)
        const closeButton = screen.getByRole('button', { name: /×/i });
        fireEvent.click(closeButton);
        
        // onClose should have been called
        expect(defaultProps.onClose).toHaveBeenCalled();
      });
    
      it('should show image preview when valid image URL is entered', async () => {
        validateImageUrl.mockReturnValue(true);
        isImageUrlAccessible.mockResolvedValue(true);
        
        render(<WatchModal {...defaultProps} />);
        
        await waitFor(() => {
          expect(api.brands.getAll).toHaveBeenCalled();
        });
        
        // Enter a valid image URL
        const imageUrlInput = screen.getByLabelText(/image url/i);
        fireEvent.change(imageUrlInput, { target: { value: 'https://example.com/watch.jpg' } });
        
        // Image preview should be displayed
        await waitFor(() => {
          const previewImage = screen.getByAltText('Watch preview');
          expect(previewImage).toBeInTheDocument();
          expect(previewImage).toHaveAttribute('src', 'https://example.com/watch.jpg');
        });
      });

});