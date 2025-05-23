# Deployment Checklist

## Environment Variables

Ensure the following environment variables are set in your Netlify dashboard:

- [x] `VITE_SUPABASE_URL` - Your Supabase project URL
- [x] `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- [x] `VITE_AUTH0_DOMAIN` - Your Auth0 domain
- [x] `VITE_AUTH0_CLIENT_ID` - Your Auth0 application client ID
- [x] `VITE_AUTH0_AUDIENCE` - Your Auth0 API audience identifier
- [x] `VITE_SUPABASE_DATABASE_URL` - (If needed) Direct Supabase PostgreSQL connection string
- [x] `VITE_TURSO_DATABASE_URL` - (If using Turso) Turso database URL
- [x] `VITE_TURSO_AUTH_TOKEN` - (If using Turso) Turso authentication token
- [x] `SECRETS_SCAN_ENABLED` - Set to "false" to disable secrets scanning

## Supabase Setup

- [x] Enable Row Level Security (RLS) on all tables
- [x] Create RLS policies for each table (user_profiles, site_content, gallery_images, code_snippets, wizard_questions, user_templates)
- [x] Set up storage buckets (banner, gallery, scanner)
- [x] Configure storage bucket policies

## Auth0 Setup

- [x] Configure Auth0 application settings
- [x] Set up Auth0 API
- [x] Configure Auth0 rules or actions for user metadata
- [x] Set up proper CORS settings in Auth0

## Netlify Setup

- [x] Configure build settings
- [x] Set up environment variables
- [x] Enable Netlify Functions
- [x] Configure deploy contexts
- [ ] Set up branch deploys (if needed)
- [ ] Configure custom domain (if needed)

## Security Checks

- [x] Review Content Security Policy
- [x] Check CORS settings
- [x] Verify authentication flow
- [x] Test authorization policies
- [x] Validate input sanitization
- [x] Check for exposed secrets
- [x] Test file upload security

## Final Checks

- [x] Run a local build to verify everything works
- [x] Test authentication flow
- [ ] Test file uploads and storage
- [x] Verify environment variables are being loaded correctly
- [ ] Check that all pages load properly
- [ ] Test responsive design
- [ ] Verify that changes are visible in the deployed site
