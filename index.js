const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

// The restricted website you want to access
const TARGET_URL = 'https://www.instagram.com';

// Configure the proxy logic to bypass headers and blocks
const instagramProxy = createProxyMiddleware({
    target: TARGET_URL,
    changeOrigin: true, // Necessary to rewrite the origin to match Instagram
    secure: true,
    cookieDomainRewrite: "", // Rewrites cookie domains to match your proxy address
    onProxyReq: (proxyReq, req, res) => {
        // Spoof headers to prevent Instagram from detecting a proxy
        proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        proxyReq.setHeader('host', 'www.instagram.com');
        proxyReq.setHeader('origin', TARGET_URL);
        proxyReq.setHeader('referer', TARGET_URL);
    },
    onProxyRes: (proxyRes, req, res) => {
        // Strip out restrictive security headers that might break the proxy layout
        delete proxyRes.headers['x-frame-options'];
        delete proxyRes.headers['content-security-policy'];
    }
});

// Route all incoming traffic through the proxy middleman
app.use('/', instagramProxy);

// Start the server on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Proxy script active on port ${PORT}`);
});
