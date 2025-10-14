# 🔧 Dark Mode Troubleshooting Guide

## 🎯 Root Cause Analysis

### Most Common Dark Mode Issues:

1. **Incomplete CSS Variable Coverage**
   - Missing semantic color variables
   - Hardcoded colors in components
   - Inconsistent variable naming

2. **Theme Application Problems**
   - Theme class not applied to root elements
   - CSS specificity conflicts
   - Missing `!important` declarations for overrides

3. **Third-Party Component Issues**
   - External libraries not respecting theme
   - Inline styles overriding theme variables
   - Components not inheriting theme context

4. **Accessibility & Contrast Issues**
   - Poor color contrast ratios
   - Missing focus indicators in dark mode
   - Inadequate selection styling

## ✅ Implementation Strategy

### Step 1: Fix CSS Variable System
```css
/* ✅ FIXED: Comprehensive CSS variables */
:root {
  --color-background: #ffffff;
  --color-text-primary: #0f172a;
  /* ... all semantic colors defined */
}

[data-theme="dark"],
body.dark-mode {
  --color-background: #0f172a;
  --color-text-primary: #f8fafc;
  /* ... dark mode overrides */
}
```

### Step 2: Ensure Universal Application
```css
/* ✅ FIXED: Apply to all elements */
html {
  background-color: var(--color-background);
  color: var(--color-text-primary);
}

body {
  background: var(--color-background);
  color: var(--color-text-primary);
}

/* ✅ FIXED: Override Tailwind classes */
.bg-white { background-color: var(--color-surface) !important; }
.text-gray-900 { color: var(--color-text-primary) !important; }
```

### Step 3: Component-Level Fixes
```tsx
// ✅ FIXED: Use cn() utility for conditional classes
import { cn } from '../lib/utils';

const Component = () => (
  <div className={cn(
    'bg-white dark:bg-gray-800',
    'text-gray-900 dark:text-gray-100',
    'border border-gray-200 dark:border-gray-700'
  )}>
    Content
  </div>
);
```

### Step 4: Form Elements & Interactive Components
```css
/* ✅ FIXED: Comprehensive form theming */
input, textarea, select, button {
  background-color: var(--color-surface) !important;
  color: var(--color-text-primary) !important;
  border-color: var(--color-border-primary) !important;
}
```

## 🧪 Testing Checklist

### ✅ Visual Elements to Verify:

- [ ] **Page Background** - Full coverage, no white/light areas
- [ ] **Text Content** - All text readable with proper contrast
- [ ] **Navigation** - Menu items, links, active states
- [ ] **Form Elements** - Inputs, selects, buttons, checkboxes
- [ ] **Cards & Containers** - Background colors, borders
- [ ] **Icons** - Proper color inheritance
- [ ] **Modals & Overlays** - Background, borders, shadows
- [ ] **Tables** - Headers, rows, borders
- [ ] **Code Blocks** - Syntax highlighting adjustments
- [ ] **Scrollbars** - Custom styling applied

### ✅ Interactive States:
- [ ] **Hover Effects** - All elements have appropriate hover states
- [ ] **Focus Indicators** - Visible focus rings in both modes
- [ ] **Active States** - Pressed/active button states
- [ ] **Selection** - Text selection colors
- [ ] **Transitions** - Smooth color transitions

### ✅ Accessibility Checks:
- [ ] **Contrast Ratios** - Minimum 4.5:1 for normal text, 3:1 for large text
- [ ] **Keyboard Navigation** - Tab order and focus visibility
- [ ] **Screen Reader** - ARIA labels and descriptions
- [ ] **Motion Preferences** - Respects `prefers-reduced-motion`

## 🚀 Prevention Strategies

### 1. Use CSS Custom Properties Consistently
```css
/* ✅ DO: Use semantic variables */
.card {
  background-color: var(--color-surface);
  color: var(--color-text-primary);
}

/* ❌ DON'T: Hardcode colors */
.card {
  background-color: #ffffff;
  color: #000000;
}
```

### 2. Implement Theme-Aware Components
```tsx
// ✅ DO: Use theme context and utilities
const { isDark } = useTheme();
className={cn(
  'base-styles',
  isDark ? 'dark-specific' : 'light-specific'
)}

// ❌ DON'T: Ignore theme context
className="fixed-light-colors"
```

### 3. Test in Both Modes During Development
```bash
# Add to your development workflow
npm run dev
# Toggle between light/dark mode frequently
# Test all components in both themes
```

### 4. Use Design Tokens
```js
// ✅ DO: Centralize color definitions
const colors = {
  light: { primary: '#3b82f6', surface: '#ffffff' },
  dark: { primary: '#60a5fa', surface: '#1e293b' }
};

// ❌ DON'T: Scatter color definitions
```

## 🔍 Debugging Tools

### Browser Dev Tools:
1. **Inspect Element** - Check computed styles
2. **Console** - Look for CSS warnings
3. **Application Tab** - Verify localStorage theme preference
4. **Accessibility Tab** - Check contrast ratios

### Quick Debug Script:
```js
// Paste in browser console to find unthemed elements
const elements = document.querySelectorAll('*');
const whiteElements = Array.from(elements).filter(el => {
  const bg = window.getComputedStyle(el).backgroundColor;
  return bg === 'rgb(255, 255, 255)' || bg === 'white';
});
console.log('Elements with white background:', whiteElements);
```

## 📊 Success Metrics

### ✅ Fully Working Dark Mode Should Have:
- **100% Visual Coverage** - No light elements in dark mode
- **Proper Contrast** - All text meets WCAG guidelines
- **Smooth Transitions** - 200ms transitions between themes
- **Persistent State** - Theme preference saved and restored
- **System Integration** - Respects OS dark mode preference
- **Accessibility Compliant** - Keyboard navigation and screen reader support

### Performance Targets:
- **Theme Switch Time**: < 200ms
- **Initial Load**: Theme applied immediately (no flash)
- **Memory Usage**: No memory leaks from theme switching

## 🎯 Quick Fix Commands

```bash
# Install required dependencies
npm install clsx tailwind-merge

# Test dark mode coverage
npm run test:dark-mode

# Build and verify
npm run build
npm run preview
```

---

## 📞 Still Having Issues?

If dark mode is still not working after following this guide:

1. **Check Browser Console** for CSS errors
2. **Verify CSS Variable Inheritance** using dev tools
3. **Test Component Isolation** - Check individual components
4. **Review Third-Party Overrides** - Some libraries may need special handling
5. **Validate Theme Context** - Ensure theme provider is wrapping your app

The implementation provided in this fix should resolve all common dark mode coverage issues! 🌙✨

---

# 🤖 AI Chatbot Troubleshooting

## Common Chatbot Issues

### Issue 1: Chatbot Not Responding
**Symptoms**: Messages sent but no response from AI

**Causes & Solutions**:
1. **Missing API Key**
   - Check `.env` file has `VITE_OPENAI_API_KEY` set
   - Verify API key is valid and active on OpenAI platform
   - Restart dev server after adding API key

2. **API Rate Limits**
   - Check browser console for 429 errors
   - Wait a few moments and try again
   - Consider upgrading OpenAI API tier

3. **Network Issues**
   - Check internet connection
   - Look for CORS errors in console
   - Verify firewall isn't blocking OpenAI API

### Issue 2: "Authentication Failed" Error
**Solution**:
```bash
# Verify API key format in .env
VITE_OPENAI_API_KEY=sk-proj-...your-key-here

# Restart development server
npm run dev
```

### Issue 3: Database Connection Issues
**Symptoms**: Conversations not saving, errors in console

**Solution**:
1. Check Supabase configuration in `.env`
2. Verify database tables exist (run migrations)
3. Check RLS policies are properly configured
4. Look for Supabase errors in browser console

### Issue 4: Chat Widget Not Appearing
**Solution**:
1. Clear browser cache
2. Check ChatButton and ChatWidget are imported in App.tsx
3. Verify z-index isn't being overridden by other elements
4. Check browser console for React errors

### Issue 5: Responses API Errors
**Common Error Messages**:

1. **"Model not found"**
   - Solution: Update `VITE_OPENAI_MODEL` to a supported model (gpt-4o, gpt-4, etc.)

2. **"Insufficient quota"**
   - Solution: Add credits to OpenAI account or check billing settings

3. **"Invalid request format"**
   - Solution: Check chatbotService.ts is using correct Responses API format

## Debug Checklist

- [ ] API key is set in `.env` file
- [ ] Supabase URL and anon key are configured
- [ ] Database migrations have been run
- [ ] Dev server restarted after .env changes
- [ ] No errors in browser console
- [ ] Network tab shows successful API calls
- [ ] OpenAI account has sufficient credits

## Testing the Chatbot

```bash
# 1. Verify environment variables
cat .env | grep OPENAI

# 2. Check database tables exist
# Open Supabase dashboard and verify:
# - chatbot_conversations
# - chatbot_messages
# - chatbot_knowledge_base
# - chatbot_usage_analytics

# 3. Test in browser
npm run dev
# Open http://localhost:5173
# Click floating chat button
# Send a test message: "What can you help me with?"
```

## Console Debugging

Add to browser console to debug:
```js
// Check if OpenAI client is initialized
console.log(window.localStorage.getItem('chatbot_session_id'));

// Monitor chat store state
const chatStore = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
// Install React DevTools for full state inspection
```

## Performance Issues

If chatbot is slow:
1. Check network speed (Responses API requires good connection)
2. Reduce conversation history (currently limited to last 10 messages)
3. Optimize knowledge base queries
4. Check for memory leaks in chat store

---

**Need More Help?** Check the CHATBOT_GUIDE.md for detailed usage instructions.