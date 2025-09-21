# Frontend Coding Rules - DVC v2
## NextJS 14 React Development Standards

**Version:** 1.0
**Ngày tạo:** 21/09/2025
**Áp dụng cho:** NextJS 14, React, TypeScript

---

## 1. Component Rules

### 1.1 Max 100 Lines Per Component
```tsx
// ❌ BAD: Large component (150+ lines)
const DocumentForm = () => {
  // 150+ lines of JSX and logic
  return <div>{/* Massive form */}</div>;
};

// ✅ GOOD: Split into smaller components
const DocumentForm = () => {
  return (
    <form className="document-form">
      <DocumentBasicInfo />
      <AttachmentUploader />
      <FormActions />
    </form>
  );
};
```

### 1.2 Single Responsibility
```tsx
// ✅ GOOD: One purpose per component
const DocumentList = () => {
  const { documents } = useDocuments();
  return (
    <div className="document-list">
      {documents.map(doc => (
        <DocumentCard key={doc.id} document={doc} />
      ))}
    </div>
  );
};
```

---

## 2. CSS & Styling Rules

### 2.1 CSS File Organization
```
src/styles/
├── globals.css              # Global styles and Tailwind
├── components.css           # Component styles
├── themes/
│   ├── light.css           # Light theme
│   └── dark.css            # Dark theme
└── print.css               # Print styles
```

### 2.2 Use CSS Classes, Not Inline Styles
```tsx
// ✅ GOOD: CSS classes
import './DocumentCard.css';

const DocumentCard = ({ document }) => {
  return (
    <div className="document-card">
      <h3 className="document-card__title">{document.title}</h3>
      <p className="document-card__description">{document.description}</p>
      <div className="document-card__actions">
        <button className="btn btn-primary">Edit</button>
      </div>
    </div>
  );
};

// ❌ BAD: Inline styles
const DocumentCard = ({ document }) => {
  return (
    <div style={{ padding: '16px', backgroundColor: 'white' }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold' }}>
        {document.title}
      </h3>
    </div>
  );
};
```

### 2.3 CSS File Structure
```css
/* DocumentCard.css */
.document-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}

.document-card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.document-card__title {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.document-card__description {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 16px;
}

.document-card__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
```

### 2.4 Global CSS with Tailwind
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom component classes */
@layer components {
  .btn {
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .btn-primary {
    background-color: #3b82f6;
    color: white;
  }

  .btn-primary:hover {
    background-color: #2563eb;
  }

  .form-input {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
  }

  .form-input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
}
```

---

## 3. TypeScript Standards

### 3.1 Strict Types
```tsx
// ✅ GOOD: Strict typing
interface DocumentCardProps {
  document: DocumentDto;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

type DocumentStatus = 'draft' | 'pending' | 'approved' | 'rejected';

// ❌ BAD: Loose typing
interface Props {
  data: any;
  onClick: Function;
}
```

### 3.2 Generic Components
```tsx
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
}

const DataTable = <T extends { id: number }>({
  data,
  columns,
  onRowClick
}: DataTableProps<T>) => {
  return (
    <table className="data-table">
      <thead>
        {columns.map(col => (
          <th key={String(col.key)}>{col.label}</th>
        ))}
      </thead>
      <tbody>
        {data.map(item => (
          <tr key={item.id} onClick={() => onRowClick?.(item)}>
            {columns.map(col => (
              <td key={String(col.key)}>
                {String(item[col.key])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

## 4. Custom Hooks

### 4.1 API Hooks
```tsx
const useDocuments = (filters?: DocumentFilters) => {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: () => documentsApi.getDocuments(filters),
    staleTime: 5 * 60 * 1000
  });
};

const useDocumentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: documentsApi.updateDocument,
    onSuccess: () => {
      queryClient.invalidateQueries(['documents']);
      toast.success('Document updated');
    }
  });
};
```

### 4.2 Business Logic Hooks
```tsx
const useDocumentForm = (initialData?: DocumentFormData) => {
  const [data, setData] = useState(initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.title) newErrors.title = 'Title is required';
    if (!data.procedureId) newErrors.procedureId = 'Procedure is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { data, errors, updateField, validate };
};
```

---

## 5. State Management

### 5.1 Zustand Store
```tsx
interface DocumentStore {
  documents: DocumentDto[];
  selectedIds: number[];
  filters: DocumentFilters;

  setDocuments: (docs: DocumentDto[]) => void;
  selectDocument: (id: number) => void;
  updateFilters: (filters: Partial<DocumentFilters>) => void;
}

const useDocumentStore = create<DocumentStore>((set) => ({
  documents: [],
  selectedIds: [],
  filters: {},

  setDocuments: (documents) => set({ documents }),

  selectDocument: (id) => set((state) => ({
    selectedIds: state.selectedIds.includes(id)
      ? state.selectedIds.filter(docId => docId !== id)
      : [...state.selectedIds, id]
  })),

  updateFilters: (newFilters) => set((state) => ({
    filters: { ...state.filters, ...newFilters }
  }))
}));
```

---

## 6. Form Handling

### 6.1 React Hook Form
```tsx
const documentSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  procedureId: z.number().min(1, 'Please select a procedure'),
  description: z.string().optional()
});

type DocumentFormData = z.infer<typeof documentSchema>;

const DocumentForm = ({ onSubmit }: DocumentFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<DocumentFormData>({
    resolver: zodResolver(documentSchema)
  });

  return (
    <form className="document-form" onSubmit={handleSubmit(onSubmit)}>
      <div className="form-group">
        <label className="form-label">Title</label>
        <input
          {...register('title')}
          className="form-input"
        />
        {errors.title && (
          <span className="form-error">{errors.title.message}</span>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Procedure</label>
        <select {...register('procedureId')} className="form-input">
          <option value="">Select procedure</option>
          {/* Options */}
        </select>
      </div>

      <button type="submit" className="btn btn-primary">
        Submit
      </button>
    </form>
  );
};
```

---

## 7. Performance Rules

### 7.1 Memoization
```tsx
const DocumentList = ({ documents, onEdit, onDelete }) => {
  // Memoize expensive calculations
  const sortedDocuments = useMemo(() => {
    return documents.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [documents]);

  // Memoize callbacks
  const handleEdit = useCallback((id: number) => {
    onEdit?.(id);
  }, [onEdit]);

  return (
    <div className="document-list">
      {sortedDocuments.map(doc => (
        <DocumentCard
          key={doc.id}
          document={doc}
          onEdit={handleEdit}
        />
      ))}
    </div>
  );
};
```

---

## 8. Testing Standards

### 8.1 Component Tests
```tsx
describe('DocumentCard', () => {
  const mockDocument = {
    id: 1,
    title: 'Test Document',
    status: 'pending'
  };

  test('renders document information', () => {
    render(<DocumentCard document={mockDocument} />);

    expect(screen.getByText('Test Document')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
  });

  test('calls onEdit when edit button clicked', async () => {
    const onEdit = jest.fn();
    render(<DocumentCard document={mockDocument} onEdit={onEdit} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(1);
  });
});
```

---

## 9. Security Rules

### 9.1 Input Sanitization
```tsx
import DOMPurify from 'dompurify';

const SafeContent = ({ html }: { html: string }) => {
  const sanitizedHtml = useMemo(() => {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
      ALLOWED_ATTR: []
    });
  }, [html]);

  return (
    <div
      className="safe-content"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
```

### 9.2 File Upload Security
```tsx
const FileUploader = ({ onUpload }: FileUploaderProps) => {
  const validateFile = (file: File): string | null => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedTypes.includes(file.type)) {
      return 'File type not allowed';
    }
    if (file.size > maxSize) {
      return 'File size too large';
    }
    return null;
  };

  const handleFileSelect = (files: FileList) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      toast.error(errors.join('\n'));
    }
    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  };

  return (
    <input
      type="file"
      multiple
      accept=".pdf,.jpg,.jpeg,.png"
      onChange={(e) => {
        if (e.target.files) {
          handleFileSelect(e.target.files);
        }
      }}
      className="file-input"
    />
  );
};
```

---

## 10. Key Rules Summary

### Must Follow:
1. **Max 100 lines** per component/function
2. **CSS files only** - no inline styles
3. **Strict TypeScript** - proper interfaces and types
4. **Component composition** - break down large components
5. **Custom hooks** for business logic
6. **Proper error handling** and validation
7. **Performance optimization** with memoization
8. **Security first** - validate all inputs
9. **Clean imports** and file organization
10. **Comprehensive testing** for all components