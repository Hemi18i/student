# تصميم نظام إدارة بيانات الطلاب - Student Management System Design Guidelines

## Design Approach
**Selected System**: Material Design with RTL modifications for Arabic language support
**Rationale**: Utility-focused productivity tool requiring efficient data display, clear forms, and professional appearance suitable for educational administration.

---

## Core Design Elements

### A. Typography (Arabic-Optimized)
**Font Family**: 
- Primary: 'Cairo', 'Segoe UI Arabic', sans-serif (Google Fonts)
- Excellent Arabic readability with professional appearance

**Type Scale**:
- Page Titles: text-3xl font-bold (للعناوين الرئيسية)
- Section Headers: text-xl font-semibold (عناوين الأقسام)
- Data Labels: text-sm font-medium (تسميات البيانات)
- Body Text: text-base font-normal (النصوص العادية)
- Form Fields: text-base (حقول الإدخال)
- Small Text/Metadata: text-xs (البيانات الثانوية)

**RTL Configuration**: `dir="rtl"` on root element, proper text-right alignment throughout

### B. Layout System
**Spacing Units**: Tailwind units of 3, 4, 6, 8, 12
- Component padding: p-6
- Section spacing: space-y-6
- Card spacing: gap-4
- Form field spacing: space-y-4
- Button padding: px-6 py-3

**Grid Structure**:
- Main container: max-w-7xl mx-auto
- Data tables: Full width with horizontal scroll on mobile
- Form layouts: Single column on mobile, 2-column (grid-cols-2) on desktop
- Search bar: Full width sticky header

### C. Component Library

**Navigation Bar**:
- Fixed top header with shadow
- Contains: Logo/Title (right), Search bar (center), User info (left)
- Height: h-16
- Background: Professional institutional style

**Student List/Table**:
- Striped rows for readability (alternate row backgrounds)
- Columns: م (Number), الاسم (Name), الرقم القومي (National ID), الفصل (Class), إجراءات (Actions)
- Fixed header with sorting capability
- Pagination: 25 students per page
- Action buttons per row: عرض (View), تعديل (Edit), طلب تحويل (Transfer Request)

**Search Component**:
- Dual search options: بالرقم القومي (By National ID) / بالاسم (By Name)
- Live search with debounce
- Clear button (x) when text is entered
- Search icon from Heroicons

**Student Details Card**:
- Card layout with rounded corners (rounded-lg)
- Grid display: grid-cols-1 md:grid-cols-3 gap-4
- Each field: Label (font-medium) + Value (font-normal)
- Fields include: الاسم، الرقم القومي، تاريخ الميلاد، المحافظة، النوع، الديانة، الجنسية، الفصل، etc.

**Transfer Request Form** (طلب التحويل):
- Header: School logo + "طلب تحويل طالب" centered
- Layout matches provided image structure
- Sections:
  1. Student information (auto-filled): Grid layout with labeled fields
  2. Transfer details: From/To school fields
  3. Reason for transfer: Textarea
  4. Signatures section: 3 columns (Student Guardian, Sending School, Receiving School)
- Print-optimized: @media print styles, A4 page format
- Border styling to match official document appearance

**Edit Student Modal/Form**:
- Modal overlay with centered form
- All editable fields from CSV data
- Validation for required fields (especially National ID format)
- Save/Cancel buttons at bottom

**Buttons**:
- Primary action: Solid background, font-semibold
- Secondary action: Outlined style
- Icons from Heroicons: search, print, edit, save, cancel
- Sizes: Standard (px-6 py-3), Small (px-4 py-2)

**Icons**: Heroicons via CDN (outline style for UI, solid for filled states)

**Data Display Cards**:
- White background with subtle border
- Shadow on hover for interactive cards
- Padding: p-6
- Rounded corners: rounded-lg

**Print Styles**:
- Hide navigation, search, and action buttons when printing
- Optimize form layout for A4 paper
- Ensure proper page breaks
- Black text on white background

### D. Animations
**Minimal Animation Strategy**:
- Search results: Simple fade-in (transition-opacity)
- Modal appearance: Smooth scale and fade
- NO complex animations - this is a productivity tool

---

## Images
**No hero images required** - This is an internal administrative tool focused on functionality.

**Logos/Assets**:
- School logo placeholder in header (top-right)
- School logo in transfer request form header (centered)
- Use SVG format for logos, placeholder comment if not available: `<!-- SCHOOL LOGO -->`

---

## Key UI Patterns

**Dashboard Layout**:
1. Top Navigation Bar (fixed)
2. Search Section (sticky below nav)
3. Student List/Table (main content area)
4. Pagination (bottom)

**Student Detail View**:
1. Breadcrumb navigation
2. Student info card with all details
3. Action buttons: طباعة البيانات، تعديل، طلب تحويل

**Transfer Request Flow**:
1. Select student → Auto-fill form
2. Add transfer details
3. Preview → Print

**Form Validation**:
- Required field indicators (*)
- Inline error messages in red text
- Success feedback in green

This design prioritizes **efficiency, clarity, and professional appearance** suitable for educational administration staff who need to process student data quickly and accurately.