



// need to mock router hooks
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
      ...actual,
      useNavigate: () => vi.fn(),
    };
  });
  
  // mock api
  vi.mock('../utils/api', () => {
    return {
      api: {
        watches: {
          getAll: vi.fn(),
          update: vi.fn(),
          create: vi.fn(),
          delete: vi.fn(),
          filter: vi.fn(
            (watches, filters) => watches // mock that just passes through watches
          ),
        },
        brands: {
          getAll: vi.fn(),
        },
      },
    };
  });
  
  // mock imgUtils
  vi.mock('../utils/imageUtils', () => {
    return {
      getImagePlaceholder: vi.fn(() => 'placeholder-image-url'),
    };
  });
  
  // mock window.confirm
  global.confirm = vi.fn();
  
  // mock WatchModal component
  vi.mock('../components/WatchModal', () => {
    return {
      default: vi.fn(({ isOpen, onClose, watch, onSave }) => {
        if (!isOpen) return null;
        return (
          <div data-testid="watch-modal">
            <h2>Mock Watch Modal</h2>
            <p>Mode: {watch ? 'Edit' : 'Add'}</p>
            <button onClick={() => onClose()}>Close</button>
            <button 
              onClick={() => onSave({ 
                brand_id: 'brand1',
                model: 'Test Model',
                year: 2023,
                rental_day_price: 50,
                condition: 'New',
                quantity: 5,
                image_url: 'https://example.com/watch.jpg'
              }, watch ? 'edit' : 'add')}
            >
              Save
            </button>
          </div>
        );
      }),
    };
  });