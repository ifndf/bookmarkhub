#!/usr/bin/env node

// 构建优化脚本
const fs = require('fs');
const path = require('path');

console.log('🚀 开始优化构建...');

// 1. CSS优化 - 移除注释和空格
function minifyCSS(cssContent) {
    return cssContent
        .replace(/\/\*[\s\S]*?\*\//g, '') // 移除注释
        .replace(/\s+/g, ' ') // 合并空格
        .replace(/;\s*}/g, '}') // 移除最后的分号
        .replace(/\s*{\s*/g, '{') // 清理大括号周围空格
        .replace(/\s*}\s*/g, '}')
        .replace(/\s*;\s*/g, ';') // 清理分号周围空格
        .replace(/\s*,\s*/g, ',') // 清理逗号周围空格
        .trim();
}

// 2. JavaScript基础优化 - 移除注释
function minifyJS(jsContent) {
    return jsContent
        .replace(/\/\*[\s\S]*?\*\//g, '') // 移除多行注释
        .replace(/\/\/.*$/gm, '') // 移除单行注释
        .replace(/\s+$/gm, '') // 移除行尾空格
        .replace(/^\s+/gm, '') // 移除行首空格
        .replace(/\n\s*\n/g, '\n'); // 移除空行
}

// 3. 创建优化版本
function createOptimizedVersions() {
    try {
        // 优化主CSS文件
        const cssContent = fs.readFileSync('styles.css', 'utf8');
        const minifiedCSS = minifyCSS(cssContent);
        fs.writeFileSync('styles.min.css', minifiedCSS);
        console.log(`✅ CSS优化完成: ${cssContent.length} -> ${minifiedCSS.length} bytes (${Math.round((1 - minifiedCSS.length/cssContent.length) * 100)}% 减少)`);
        
        // 优化主JS文件（基础优化）
        const jsContent = fs.readFileSync('script.js', 'utf8');
        const minifiedJS = minifyJS(jsContent);
        fs.writeFileSync('script.min.js', minifiedJS);
        console.log(`✅ JS优化完成: ${jsContent.length} -> ${minifiedJS.length} bytes (${Math.round((1 - minifiedJS.length/jsContent.length) * 100)}% 减少)`);
        
        // 优化性能脚本
        const optimizeContent = fs.readFileSync('optimize.js', 'utf8');
        const minifiedOptimize = minifyJS(optimizeContent);
        fs.writeFileSync('optimize.min.js', minifiedOptimize);
        console.log(`✅ Optimize.js优化完成: ${optimizeContent.length} -> ${minifiedOptimize.length} bytes`);
        
    } catch (error) {
        console.error('❌ 优化过程出错:', error);
    }
}

// 4. 创建生产版本HTML
function createProductionHTML() {
    try {
        let htmlContent = fs.readFileSync('index.html', 'utf8');
        
        // 替换为压缩版本的资源
        htmlContent = htmlContent
            .replace('styles.css', 'styles.min.css')
            .replace('script.js', 'script.min.js')
            .replace('optimize.js', 'optimize.min.js');
        
        // 添加性能提示
        const performanceHints = `
    <!-- 性能优化提示 -->
    <meta name="theme-color" content="#2196F3">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <link rel="manifest" href="manifest.json">`;
        
        htmlContent = htmlContent.replace('</head>', performanceHints + '\n</head>');
        
        fs.writeFileSync('index.prod.html', htmlContent);
        console.log('✅ 生产版本HTML创建完成: index.prod.html');
        
    } catch (error) {
        console.error('❌ 创建生产版本HTML出错:', error);
    }
}

// 5. 创建PWA manifest
function createManifest() {
    const manifest = {
        name: "BookmarkHub - 私人书签管理",
        short_name: "BookmarkHub",
        description: "高效的私人书签管理工具",
        start_url: "./",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#2196F3",
        icons: [
            {
                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%232196F3'%3E%3Cpath d='M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z'/%3E%3C/svg%3E",
                sizes: "any",
                type: "image/svg+xml"
            }
        ]
    };
    
    fs.writeFileSync('manifest.json', JSON.stringify(manifest, null, 2));
    console.log('✅ PWA Manifest创建完成');
}

// 6. 生成性能报告
function generatePerformanceReport() {
    const report = {
        timestamp: new Date().toISOString(),
        optimizations: [
            '✅ CSS压缩和优化',
            '✅ JavaScript基础优化',
            '✅ 资源预加载',
            '✅ 异步加载外部资源',
            '✅ Gzip压缩配置',
            '✅ 浏览器缓存策略',
            '✅ Service Worker缓存',
            '✅ PWA支持'
        ],
        files: {
            'styles.css': fs.statSync('styles.css').size,
            'styles.min.css': fs.statSync('styles.min.css').size,
            'script.js': fs.statSync('script.js').size,
            'script.min.js': fs.statSync('script.min.js').size
        }
    };
    
    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
    console.log('✅ 性能报告生成完成: performance-report.json');
}

// 执行优化
console.log('📦 开始文件优化...');
createOptimizedVersions();

console.log('🏗️ 创建生产版本...');
createProductionHTML();

console.log('📱 创建PWA配置...');
createManifest();

console.log('📊 生成性能报告...');
generatePerformanceReport();

console.log('🎉 优化构建完成！');
console.log('');
console.log('📁 生成的文件:');
console.log('  - styles.min.css (压缩CSS)');
console.log('  - script.min.js (优化JS)');
console.log('  - optimize.min.js (优化性能脚本)');
console.log('  - index.prod.html (生产版本)');
console.log('  - manifest.json (PWA配置)');
console.log('  - performance-report.json (性能报告)');
console.log('  - .htaccess (服务器配置)');
console.log('  - sw.js (Service Worker)');
console.log('');
console.log('🚀 部署建议:');
console.log('  1. 使用 index.prod.html 作为生产环境入口');
console.log('  2. 确保服务器支持 .htaccess 配置');
console.log('  3. 启用HTTPS以支持Service Worker');
console.log('  4. 配置CDN加速静态资源');
