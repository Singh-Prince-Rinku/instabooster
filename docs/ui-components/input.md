# Input Component

The Input component is a versatile form control that supports various states, sizes, and features like icons and validation.

## Usage

```tsx
import { Input } from '@/components/ui/Input';

// Basic usage
<Input placeholder="Enter your name" />

// With label and helper text
<Input 
  label="Email" 
  placeholder="example@domain.com" 
  helperText="We'll never share your email with anyone else." 
/>

// With error state
<Input 
  label="Password" 
  type="password" 
  error="Password must be at least 8 characters" 
/>

// With icons
<Input 
  leftIcon={<FaUser />} 
  placeholder="Username" 
/>
```

## Props

The Input component extends the standard HTML input attributes and adds the following:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "error" \| "success"` | `"default"` | Style variant of the input |
| `inputSize` | `"sm" \| "default" \| "lg"` | `"default"` | Size of the input |
| `label` | `string` | `undefined` | Optional label for the input |
| `helperText` | `string` | `undefined` | Optional helper text displayed below the input |
| `error` | `string` | `undefined` | Error message to display. Also changes the input style to the error variant |
| `leftIcon` | `ReactNode` | `undefined` | Icon to display on the left side inside the input |
| `rightIcon` | `ReactNode` | `undefined` | Icon to display on the right side inside the input |
| `fullWidth` | `boolean` | `true` | Whether the input should take up the full width of its container |

## Variants

### Default

The standard input style with a clean, minimal appearance.

```tsx
<Input placeholder="Default input" />
```

### Error

Used to indicate validation errors or other issues.

```tsx
<Input 
  variant="error" 
  placeholder="Error input" 
  error="This field is required" 
/>
```

### Success

Used to indicate successful validation or completion.

```tsx
<Input 
  variant="success" 
  placeholder="Success input" 
/>
```

## Sizes

### Small

```tsx
<Input 
  inputSize="sm" 
  placeholder="Small input" 
/>
```

### Default

```tsx
<Input 
  inputSize="default" 
  placeholder="Default input" 
/>
```

### Large

```tsx
<Input 
  inputSize="lg" 
  placeholder="Large input" 
/>
```

## With Icons

Icons can be added to either side of the input for better visual cues.

```tsx
// Left icon
<Input 
  leftIcon={<FaUser />} 
  placeholder="Username" 
/>

// Right icon
<Input 
  rightIcon={<FaSearch />} 
  placeholder="Search..." 
/>

// Both icons
<Input 
  leftIcon={<FaEnvelope />} 
  rightIcon={<FaCheckCircle />} 
  placeholder="Email" 
/>
```

## With Validation

The Input component can display validation states with appropriate styling.

```tsx
// Error state
<Input 
  label="Username" 
  error="Username is already taken" 
/>

// With helper text
<Input 
  label="Password" 
  type="password" 
  helperText="Use at least 8 characters with a mix of letters, numbers & symbols" 
/>
```

## Design Guidelines

- Use consistent input sizes throughout your forms
- Include clear, concise labels for most inputs
- Provide helper text for complex inputs or those with specific requirements
- Use error states to clearly communicate validation issues
- Consider using icons to enhance visual cues and usability
- Maintain sufficient spacing between form elements for readability

## Accessibility

- Always use labels with inputs for screen reader compatibility
- Error messages are automatically associated with the input
- Focus states provide clear visual indication for keyboard users
- The component supports all standard HTML input attributes for accessibility 