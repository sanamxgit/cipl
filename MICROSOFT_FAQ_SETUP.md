# Microsoft FAQ System Setup Guide

This guide explains how to set up and use the new Microsoft FAQ system for the Microsoft Office page.

## Database Setup

1. **Create the microsoft_faqs table** by running the SQL script:
   ```sql
   -- Run this in your MySQL database
   SOURCE backend/sql/microsoft_faqs.sql;
   ```

   Or manually create the table:
   ```sql
   CREATE TABLE microsoft_faqs (
       id INT AUTO_INCREMENT PRIMARY KEY,
       question TEXT NOT NULL,
       answer TEXT NOT NULL,
       sort_order INT DEFAULT 0,
       is_active BOOLEAN DEFAULT true,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   ```

## API Endpoint

The new API endpoint `/microsoft-faqs.php` handles all FAQ operations:

- **GET** `/microsoft-faqs.php` - Get all active FAQs (for frontend)
- **GET** `/microsoft-faqs.php?admin=true` - Get all FAQs including inactive (for admin)
- **POST** `/microsoft-faqs.php` - Add new FAQ
- **PUT** `/microsoft-faqs.php?id={id}` - Update existing FAQ
- **DELETE** `/microsoft-faqs.php?id={id}` - Delete FAQ

## Frontend Components

### MicrosoftFAQSection.jsx
- New component specifically for Microsoft pages
- Fetches FAQs from the microsoft-faqs API
- Includes loading states and empty state handling
- Responsive design with Microsoft branding

### MicrosoftFAQSection.css
- Styled specifically for Microsoft pages
- Uses Microsoft color scheme (#0078d4)
- Responsive design for mobile and desktop
- Smooth animations and hover effects

## Admin Panel Integration

The Microsoft Office Manager now includes a new "FAQs" tab with:

- **Add New FAQ Form**: Create new FAQs with question, answer, sort order, and active status
- **FAQ Management**: Edit, delete, activate/deactivate existing FAQs
- **Sort Order Control**: Arrange FAQs in desired order
- **Status Toggle**: Quickly activate/deactivate FAQs

## Usage

### Adding FAQs via Admin Panel
1. Navigate to Admin → Microsoft Office Manager
2. Click on the "FAQs" tab
3. Fill in the "Add New FAQ" form
4. Click "Add FAQ"

### Managing Existing FAQs
1. In the FAQs tab, find the FAQ you want to manage
2. Use the action buttons:
   - **Edit**: Modify question, answer, sort order, and status
   - **Activate/Deactivate**: Toggle FAQ visibility
   - **Delete**: Remove FAQ permanently

### Frontend Display
The Microsoft Office page automatically displays the new FAQ section below the existing content. FAQs are:
- Sorted by sort_order, then by ID
- Only active FAQs are displayed
- Responsive and accessible
- Styled with Microsoft branding

## Features

- **Responsive Design**: Works on all device sizes
- **Accessibility**: Proper ARIA labels and keyboard navigation
- **Performance**: Efficient API calls with proper error handling
- **User Experience**: Smooth animations and intuitive interface
- **Admin Control**: Full CRUD operations through admin panel
- **Status Management**: Easy activation/deactivation of FAQs

## Troubleshooting

### FAQs Not Displaying
1. Check if the database table exists
2. Verify the API endpoint is accessible
3. Check browser console for errors
4. Ensure FAQs have `is_active = true`

### Admin Panel Issues
1. Verify admin authentication
2. Check API permissions
3. Ensure proper CORS headers
4. Check browser console for errors

### Database Issues
1. Verify table structure matches the SQL script
2. Check database connection
3. Ensure proper permissions for the database user

## File Structure

```
backend/
├── api/
│   └── microsoft-faqs.php          # API endpoint
├── sql/
│   └── microsoft_faqs.sql          # Database schema
└── config/
    └── database.php                 # Database connection

src/
├── components/
│   ├── MicrosoftFAQSection.jsx     # FAQ component
│   ├── MicrosoftFAQSection.css     # FAQ styles
│   └── MicrosoftOffice.jsx         # Updated Microsoft page
└── admin/
    └── pages/
        └── MicrosoftOfficeManager.jsx  # Updated admin panel
```
