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

## Project Setup

Ensure your project is correctly configured for static export:

-   **`next.config.mjs`**:
    \`\`\`javascript
    // next.config.mjs
    const nextConfig = {
      output: 'export',
      trailingSlash: true,
      skipTrailingSlashRedirect: true,
      images: {
        unoptimized: true,
      },
      distDir: '.next',
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      },
      webpack: (config, { isServer }) => {
        if (!isServer) {
          config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            net: false,
            tls: false,
          };
        }
        return config;
      },
      experimental: {
        optimizeCss: true,
      },
      eslint: {
        ignoreDuringBuilds: true,
      },
      typescript: {
        ignoreBuildErrors: true,
      },
    };
    export default nextConfig;
    \`\`\`
    -   `output: 'export'` tells Next.js to generate static HTML, CSS, and JavaScript files.
    -   `trailingSlash: true` and `skipTrailingSlashRedirect: true` help with consistent URL handling in static exports.
    -   `images: { unoptimized: true }` disables Next.js Image Optimization, which requires a server and is not compatible with static export.
    -   `distDir: '.next'` specifies the build output directory.

-   **`package.json`**:
    Ensure you have the `critters` dependency and a `build` script that includes `next export`.
    \`\`\`json
    {
      "name": "my-v0-project",
      "version": "0.1.0",
      "private": true,
      "scripts": {
        "build": "next build && next export", # This script is crucial for Netlify
        "dev": "next dev",
        "lint": "next lint",
        "start": "next start"
      },
      "dependencies": {
        // ... other dependencies
      },
      "devDependencies": {
        "critters": "^0.0.20", # Ensure this is present
        // ... other devDependencies
      }
    }
    \`\`\`

## Netlify Configuration (`netlify.toml`)

Create a `netlify.toml` file in the root of your project to configure Netlify's build and deployment settings.

\`\`\`toml
# netlify.toml
[build]
  publish = "out" # Next.js exports to 'out' directory when output: 'export' is used
  command = "npm run build" # Command to build and export the Next.js app

# Redirects for client-side routing
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

# Headers for security and caching
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    # Adjust Content-Security-Policy as needed for your specific external resources
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self' *.supabase.co; frame-src 'self' *.supabase.co;"
    Cache-Control = "public, max-age=0, must-revalidate"

# Specific headers for static assets (e.g., Next.js build artifacts)
[[headers]]
  for = "/_next/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Environment variables (optional, can be set in Netlify UI)
[context.production.environment]
  # NEXT_PUBLIC_SUPABASE_URL = "your_supabase_url"
  # NEXT_PUBLIC_SUPABASE_ANON_KEY = "your_supabase_anon_key"
\`\`\`

-   **`[build]` section**:
    -   `publish = "out"`: Specifies the directory Netlify should deploy. Next.js with `output: 'export'` will output to an `out` folder by default.
    -   `command = "npm run build"`: This command will execute your `build` script defined in `package.json`, which in turn runs `next build && next export`.

-   **`[[redirects]]` section**:
    -   `from = "/*"` and `to = "/index.html"` with `status = 200`: This is crucial for client-side routing in a static Next.js app. It ensures that all paths are served by your `index.html` (or the corresponding HTML file for the route), allowing your React app to handle routing.

-   **`[[headers]]` section**:
    -   Configures HTTP headers for security and caching.
    -   **`Content-Security-Policy`**: This is important for security. Make sure to adjust `connect-src` to include your Supabase URL (`*.supabase.co`) and any other external domains your application connects to. `img-src` includes `data:` and `blob:` for local image previews.
    -   **`Cache-Control`**: Sets caching policies for your assets. Static assets (`/_next/static/*`) are cached for a long time (`31536000` seconds = 1 year) and marked as `immutable`.

## Supabase Configuration

Ensure your Supabase project settings are correctly configured for your Netlify deployment:

-   **Supabase Project URL**:
    -   Go to your Supabase project dashboard.
    -   Navigate to **Project Settings** > **API**.
    -   Copy your Project URL and Anon Key.

-   **Authentication Redirect URLs**:
    -   In your Supabase project dashboard, go to **Authentication** > **URL Configuration**.
    -   Add your Netlify domain(s) to the "Site URL" and "Redirect URLs" list.
    -   For example, if your Netlify domain is `https://your-app-name.netlify.app`, you should add:
        -   `https://your-app-name.netlify.app`
        -   `https://your-app-name.netlify.app/auth/callback` (This is used by Supabase for email confirmation and OAuth redirects)
    -   Ensure "Enable Email Confirm" is **ON** in **Authentication** > **Settings**.

## Environment Variables

Netlify needs access to your Supabase environment variables during the build and runtime.

-   **Netlify Dashboard**:
    -   Go to your Netlify site dashboard.
    -   Navigate to **Site settings** > **Build & deploy** > **Environment variables**.
    -   Add the following variables:
        -   `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
        -   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key

## Deployment

1.  **Commit Changes**: Ensure all the above changes (`netlify.toml`, `next.config.mjs`, `package.json` updates) are committed to your Git repository.
2.  **Push to Git**: Push your changes to the branch connected to your Netlify site (e.g., `main`).
3.  **Netlify Auto-Deploy**: Netlify will automatically detect the new commit and trigger a new build and deployment.

## Post-Deployment Verification

After deployment, verify the following:

-   **Application Loads**: Ensure your application loads correctly in the browser.
-   **Authentication Flow**:
    -   Test user registration (ensure confirmation emails are sent and links work).
    -   Test user login and logout.
    -   Verify session persistence.
-   **File Operations**: Test file upload, viewing, and deletion.
-   **Console for Errors**: Check the browser's developer console for any JavaScript errors.
-   **Netlify Logs**: If issues arise, check the Netlify deploy logs for build or runtime errors.

By following these steps, your Next.js application should deploy successfully to Netlify with Supabase authentication fully functional.
