# Admin Panel Design System - Compact Professional Style

## Typography Scale
- **Page Title**: `text-xl font-bold` (20px)
- **Section Title**: `text-sm font-bold` (14px)  
- **Card Title**: `text-xs font-semibold` (12px)
- **Body Text**: `text-xs` (12px)
- **Small Text**: `text-[10px]` (10px)
- **Button Text**: `text-xs font-medium` (12px)

## Spacing Scale
- **Page Container**: `space-y-4` (16px gap)
- **Card Padding**: `p-4` (16px)
- **Section Gap**: `gap-3` (12px)
- **Item Gap**: `gap-2` or `gap-2.5` (8-10px)
- **Button Padding**: `px-3 py-2` (12px x 8px)
- **Input Padding**: `px-3 py-2` (12px x 8px)

## Color Palette
- **Primary Red**: `from-red-500 to-red-600` (gradient)
- **Borders**: `border-gray-200`
- **Background**: `bg-gray-50`
- **Cards**: `bg-white`
- **Hover**: `hover:bg-gray-50`
- **Text Primary**: `text-gray-900`
- **Text Secondary**: `text-gray-600`
- **Text Muted**: `text-gray-500`

## Component Sizes
- **Icon Size**: `w-4 h-4` or `w-5 h-5` (16-20px)
- **Avatar**: `w-8 h-8` (32px)
- **Badge**: `w-3 h-3` (12px)
- **Input Height**: `h-9` (36px)
- **Button Height**: auto with `py-2`
- **Card Border Radius**: `rounded-lg`
- **Shadow**: `shadow-sm` (subtle)

## Status Colors
- Success: `bg-green-100 text-green-800`
- Warning: `bg-yellow-100 text-yellow-800`
- Error: `bg-red-100 text-red-800`
- Info: `bg-blue-100 text-blue-800`
- Neutral: `bg-gray-100 text-gray-800`

## Table Styling
- **Header**: `bg-gray-50 text-[10px] font-semibold text-gray-600 uppercase px-4 py-2`
- **Cell**: `px-4 py-2.5 text-xs`
- **Row Hover**: `hover:bg-gray-50 transition-colors`

## Form Elements
- **Label**: `text-xs font-medium text-gray-700 mb-1`
- **Input**: `w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`
- **Select**: Same as input
- **Textarea**: Same as input with `resize-none`

## Buttons
- **Primary**: `bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-md px-3 py-2 text-xs font-medium rounded-lg`
- **Secondary**: `bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-3 py-2 text-xs font-medium rounded-lg`
- **Danger**: `bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 text-xs font-medium rounded-lg`
- **Success**: `bg-green-500 text-white hover:bg-green-600 px-3 py-2 text-xs font-medium rounded-lg`

## Modal/Dialog
- **Backdrop**: `bg-gray-900/50`
- **Container**: `bg-white rounded-lg shadow-xl max-w-2xl p-4`
- **Header**: `text-sm font-bold text-gray-900 mb-3`
- **Footer**: `border-t border-gray-100 pt-3 mt-4`

## Common Patterns

### Page Header
```jsx
<div>
  <h1 className="text-xl font-bold text-gray-900">Page Title</h1>
  <p className="mt-1 text-sm text-gray-600">Description text</p>
</div>
```

### Stats Card
```jsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-xs font-medium text-gray-600">Label</p>
      <p className="mt-1.5 text-2xl font-bold text-gray-900">Value</p>
      <p className="mt-1 text-xs text-green-600">Change</p>
    </div>
    <div className="bg-blue-500 p-2.5 rounded-lg text-white">
      <Icon className="w-5 h-5" />
    </div>
  </div>
</div>
```

### Action Card
```jsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
  <h3 className="text-xs font-semibold text-gray-900">Title</h3>
  <p className="text-xs text-gray-600 mt-1">Description</p>
</div>
```

### Search/Filter Bar
```jsx
<div className="flex items-center gap-2">
  <input
    type="search"
    placeholder="Search..."
    className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500"
  />
  <button className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 text-xs font-medium rounded-lg">
    Search
  </button>
</div>
```
