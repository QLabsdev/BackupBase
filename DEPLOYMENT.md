# Netlify Deployment Guide for BackupBase

## Pre-deployment Checklist

### 1. Environment Variables
Set these in your Netlify dashboard under Site Settings > Environment Variables:

\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

### 2. Supabase Configuration
In your Supabase dashboard:

1. **Authentication Settings**:
   - Go to Authentication > Settings
   - Add your Netlify domain to "Site URL"
   - Add your Netlify domain to "Redirect URLs"
   - Example: `https://your-app-name.netlify.app`

2. **Email Templates**:
   - Update email templates to use your Netlify domain
   - Confirmation URL: `https://your-app-name.netlify.app/auth/callback`
   - Reset Password URL: `https://your-app-name.netlify.app/auth/reset-password`

### 3. Build Settings
In Netlify dashboard under Site Settings > Build & Deploy:

- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: `18` (set in environment variables)

## Deployment Steps

1. **Connect Repository**:
   - Link your GitHub/GitLab repository to Netlify
   - Select the main branch for deployment

2. **Configure Build**:
   - Netlify will automatically detect the `netlify.toml` configuration
   - Ensure environment variables are set

3. **Deploy**:
   - Push to your main branch to trigger automatic deployment
   - Monitor the deploy logs for any issues

## Common Issues & Solutions

### 1. Authentication Redirect Issues
- Ensure Supabase redirect URLs include your Netlify domain
- Check that `emailRedirectTo` uses the correct domain

### 2. Static Export Issues
- The app is configured for static export (`output: 'export'`)
- API routes are not supported in static export mode

### 3. Environment Variables
- All environment variables must be prefixed with `NEXT_PUBLIC_`
- Set them in Netlify dashboard, not in `.env` files

### 4. Routing Issues
- Client-side routing is handled by the `[[redirects]]` in `netlify.toml`
- All routes redirect to `index.html` for SPA behavior

## Performance Optimizations

1. **Caching**: Static assets are cached for 1 year
2. **Security Headers**: Added security headers in `netlify.toml`
3. **Image Optimization**: Disabled for static export compatibility
4. **Code Splitting**: Automatic with Next.js

## Monitoring

- Check Netlify deploy logs for build issues
- Monitor browser console for client-side errors
- Use Netlify Analytics for performance insights

## Support

If you encounter issues:
1. Check the deploy logs in Netlify dashboard
2. Verify environment variables are set correctly
3. Ensure Supabase configuration matches your domain
4. Check browser console for client-side errors
\`\`\`

Create a production-ready robots.txt:
