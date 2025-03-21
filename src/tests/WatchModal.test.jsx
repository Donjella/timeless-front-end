


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