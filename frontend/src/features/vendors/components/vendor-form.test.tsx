import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VendorForm } from './vendor-form';
import { useRouter } from 'next/navigation';
import { VendorCategory, VendorStatus } from '../types/vendor.types';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;

describe('VendorForm', () => {
  const mockOnSubmit = jest.fn();
  const mockPush = jest.fn();

  beforeEach(() => {
    mockUseRouter.mockReturnValue({ push: mockPush } as unknown as ReturnType<typeof useRouter>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(
      <VendorForm
        companyId="test-company"
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/notes/i)).toBeInTheDocument();
  });

  it('shows validation errors for required fields', async () => {
    render(
      <VendorForm
        companyId="test-company"
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    fireEvent.click(screen.getByText(/create vendor/i));

    await waitFor(() => {
      expect(screen.getByText(/name must be at least 2 characters/i)).toBeInTheDocument();
    });
  });

  it('calls onSubmit with valid data', async () => {
    render(
      <VendorForm
        companyId="test-company"
        onSubmit={mockOnSubmit}
        isSubmitting={false}
      />
    );

    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test Vendor' },
    });
    fireEvent.change(screen.getByLabelText(/category/i), {
      target: { value: VendorCategory.SOFTWARE },
    });

    fireEvent.click(screen.getByText(/create vendor/i));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test Vendor',
        email: '',
        phone: '',
        category: VendorCategory.SOFTWARE,
        status: VendorStatus.ACTIVE,
        notes: '',
      }, expect.any(Function));
    });
  });
});
