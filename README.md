# 🚀 Business Intelligence Hub

A powerful, comprehensive AI-driven intelligence platform with 35 specialized applications for modern businesses.

## ✨ Features

### 🤖 **AI Chatbot Assistant** ⭐ NEW!
- **Intelligent conversational AI** powered by OpenAI's Responses API (GPT-6 Astra)
- **Web-search contact enrichment** and **GPT Image** support
- **Latest AI models** - Uses best available GPT models via simple config
- **Context-aware assistance** - knows which page/app you're viewing
- **35 app knowledge base** - comprehensive understanding of all platform features
- **Smart suggestions** - relevant apps and quick-start questions
- **Persistent conversations** - chat history saved across sessions
- **Modern UI** - beautiful glass-morphism design with dark/light mode

### 📊 **Complete Analytics Suite**
- **35 AI-powered applications** across 5 major categories
- **Real-time dashboards** with live data monitoring
- **Predictive analytics** with machine learning insights
- **Advanced visualizations** and interactive charts

### 🎯 **Application Categories**

#### Pipeline Analytics (10 apps)
- Pipeline Intelligence, Deal Risk Monitor, Smart Conversion Insights
- Pipeline Health Dashboard, Sales Cycle Analytics, Win Rate Intelligence
- AI Sales Forecast, Live Deal Analysis, Competitor Insights, Revenue Intelligence

#### Communication Analytics (6 apps)
- Activity Analytics, Response Intelligence, Channel Sync Hub
- Smart Email Optimizer, Sentiment Monitor, Comm Performance

#### Task Analytics (6 apps)
- Smart Follow-ups, Priority Intelligence, Task Impact Analytics
- Workflow Intelligence, Risk Monitor, Smart Allocation

#### Integration Analytics (6 apps)
- Integration Analytics, Apps Performance Monitor, Data Quality Dashboard
- Smart Automation Hub, Apps Intelligence, System Analytics

#### Analytics Dashboard (7 apps)
- Performance Reports, Pipeline Visualization, Revenue Breakdown
- Conversion Analytics, Live KPI Monitor, Activity Dashboard, Trend Intelligence

## 🛠️ **Technology Stack**

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Zustand** for state management
- **Vite** for development and building

### Backend & Storage
- **Supabase** for database and real-time features
- **PostgreSQL** with Row Level Security
- **Real-time subscriptions** for live data updates

### AI & Intelligence
- **OpenAI Responses API** - GPT-6 Astra / GPT-6.1 Terra, web search, GPT Image
- **Netlify Functions + Supabase** - server-side OpenAI proxy and data layer
- **Dynamic knowledge base** - auto-generated from application data
- **Context-aware prompting** - intelligent conversation flow
- **Conversation persistence** - Supabase-backed chat history
- **Future-proof architecture** - Easy upgrades when new models release

### Features
- **Dark/Light mode** with system preference detection
- **Responsive design** for all screen sizes
- **Accessibility features** with WCAG compliance
- **Real-time data** persistence and synchronization

## 🚀 **Getting Started**

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up Supabase:**
   - Create a new project in [Supabase](https://supabase.com)
   - Run the migration in the SQL editor:
   ```sql
   -- Copy and paste the content from supabase/migrations/create_app_content_table.sql
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Add your Supabase and OpenAI credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_MODEL=gpt-6-astra  # optional; see .env.example
   ```
   Set `OPENAI_API_KEY` in Netlify (site env vars) - it is used only by `netlify/functions/openai-proxy`. For local dev run `netlify dev`.
   ```env
   ```

4. **Start the development server:**
```bash
npm run dev
```

## 📱 **Usage**

### Dashboard Features
- **Search & Filter:** Find apps quickly with smart search and category filters
- **Favorites:** Star your most-used applications for quick access
- **View Modes:** Switch between grid and list layouts
- **Theme Toggle:** Seamless dark/light mode switching

### Data Persistence
- **Auto-save:** Your preferences and settings are automatically saved
- **Real-time sync:** Changes sync across browser sessions
- **Offline support:** Works without internet, syncs when reconnected

### AI Analytics
- **Interactive dashboards** with drill-down capabilities
- **AI-powered insights** and recommendations
- **Real-time alerts** and notifications
- **Predictive modeling** and forecasting

## 🔧 **Configuration**

### Supabase Setup
The app uses Supabase for data persistence with the following schema:

```sql
-- Main content storage table
app_content (
  id UUID PRIMARY KEY,
  key TEXT UNIQUE,        -- Content identifier
  value JSONB,           -- Flexible JSON storage
  user_id UUID,          -- User association
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
```

### Environment Variables
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## 🎨 **Customization**

### Theming
- Supports light/dark/system theme modes
- Consistent design system with Tailwind CSS
- Customizable color schemes per application

### Components
- Modular component architecture
- Reusable UI components with consistent styling
- Easy to extend with new applications

## 🔒 **Security**

### Data Protection
- Row Level Security (RLS) enabled
- User-based data isolation
- Secure API key management

### Authentication Ready
- Built-in Supabase Auth integration
- User session management
- Protected routes and data access

## 📈 **Performance**

### Optimization
- Code splitting and lazy loading
- Efficient state management
- Optimized database queries
- Real-time subscriptions for live updates

### Monitoring
- Built-in performance analytics
- System health monitoring
- User behavior tracking
- Error reporting and monitoring

## 🚀 **Deployment**

### Build for Production
```bash
npm run build
npm run preview
```

### Deploy to Vercel/Netlify
The app is ready for deployment to any static hosting provider:
- Build output in `dist/` directory
- Environment variables configured
- Supabase connection established

## 📚 **Documentation**

### Component Structure
```
src/
├── components/
│   ├── apps/           # Individual AI applications
│   ├── dashboard/      # Dashboard components
│   ├── layout/         # Layout components
│   └── ui/            # Reusable UI components
├── contexts/          # React context providers
├── hooks/            # Custom React hooks
├── services/         # API and data services
├── store/            # State management
├── types/            # TypeScript definitions
└── utils/            # Utility functions
```

### Adding New Applications
1. Create component in `src/components/apps/`
2. Add to `aiApps` array in `src/data/aiApps.ts`
3. Update routing in `src/App.tsx`
4. Follow existing patterns for consistent styling

## 🤝 **Contributing**

### Development Guidelines
- Follow TypeScript best practices
- Use existing component patterns
- Maintain accessibility standards
- Test in both light and dark modes

### Code Style
- ESLint configuration included
- Consistent component structure
- Proper error handling
- Performance considerations

## 📄 **License**

This project is built for educational and demonstration purposes. Feel free to use and modify as needed.

---

## 🎯 **What's Included**

✅ **Complete AI Analytics Suite** (35 applications)
✅ **AI Chatbot Assistant** powered by OpenAI Responses API
✅ **Supabase Integration** with real-time data persistence
✅ **Modern UI/UX** with dark/light theme support
✅ **Mobile Responsive** design for all screen sizes
✅ **TypeScript** for type safety and better development experience
✅ **Production Ready** with proper error handling and optimization

## 📚 **Additional Documentation**

- **[CHATBOT_GUIDE.md](./CHATBOT_GUIDE.md)** - Complete guide to using the AI chatbot
- **[CHATBOT_TECHNICAL.md](./CHATBOT_TECHNICAL.md)** - Technical implementation details
- **[TROUBLESHOOTING_GUIDE.md](./TROUBLESHOOTING_GUIDE.md)** - Solutions for common issues

**Built with ❤️ for modern businesses seeking powerful analytics insights!**