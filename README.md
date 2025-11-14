# AgentOS - Real Estate SaaS Platform

**PRODUCTION READY - FOR ROY'S FRIEND** 💙

Complete multi-tenant real estate platform with three distinct interfaces:
1. **Public Marketing Site** - Landing page with templates and pricing
2. **Admin Dashboard** - Platform management for Roy
3. **Agent Dashboard** - Property and lead management for agents
4. **Public Agent Sites** - Customer-facing real estate websites

## Live URL
https://agentos-production.vercel.app

## Three Dashboards

### 1. Public Marketing Site (/)
- Template showcase
- Pricing tiers
- Signup/login
- Features overview
- NO LOGIN REQUIRED

### 2. Admin Dashboard (/admin)
- Platform overview
- Manage all agents
- Revenue tracking
- Subscription management
- Analytics
- LOGIN REQUIRED (Roy only)

### 3. Agent Dashboard (/dashboard)
- Property management
- Lead management
- Site customization
- Performance analytics
- LOGIN REQUIRED (Agents)

### 4. Public Agent Sites (/agent/[slug])
- Beautiful property listings
- Lead capture forms
- Agent bio
- Contact information
- NO LOGIN REQUIRED (Public)

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (Database & Auth)
- Stripe + PayPal (Payments)

## Database Schema (11 Tables)
- tenants
- agents
- properties
- leads
- sites
- blog_posts
- email_campaigns
- chat_conversations
- chat_messages
- transactions
- webhook_logs

## Pricing Tiers
- **Free Trial**: $0/mo - 5 properties, 14 days
- **Starter**: $99/mo - 25 properties, custom domain
- **Pro**: $199/mo - 100 properties, 3 agents
- **Enterprise**: $399/mo - Unlimited everything

## Environment Variables (Set in Vercel)
```
NEXT_PUBLIC_SUPABASE_URL=https://kteobfyferrukqeolofj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key]
SUPABASE_SERVICE_ROLE_KEY=[your-key]
STRIPE_SECRET_KEY=[your-key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[your-key]
STRIPE_WEBHOOK_SECRET=[your-key]
PAYPAL_CLIENT_ID=[your-key]
PAYPAL_SECRET=[your-key]
```

## Status
🎉 **PRODUCTION READY - LIVE NOW**

Built with ❤️ by CR AudioViz AI  
In honor of a friend who believed in helping people