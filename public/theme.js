(function () {
    var color = localStorage.getItem('themeColor') || '#6dba5f';
    var darkMode = localStorage.getItem('darkMode') !== null ? localStorage.getItem('darkMode') === 'true' : true;
    var fontSize = localStorage.getItem('fontSize') || 'medium';


    applyTheme(color, darkMode, fontSize);

    window.ThemeEngine = {
        setColor: function (hex) { localStorage.setItem('themeColor', hex); applyTheme(hex, isDark(), getFontSize()); },
        setDarkMode: function (bool) { localStorage.setItem('darkMode', bool); applyTheme(getColor(), bool, getFontSize()); },
        setFontSize: function (size) { localStorage.setItem('fontSize', size); applyTheme(getColor(), isDark(), size); },
        reset: function () { localStorage.removeItem('themeColor'); localStorage.removeItem('darkMode'); localStorage.removeItem('fontSize'); applyTheme('#6dba5f', false, 'medium'); }
    };

    function getColor() { return localStorage.getItem('themeColor') || '#6dba5f'; }
    function isDark() { return localStorage.getItem('darkMode') === 'true'; }
    function getFontSize() { return localStorage.getItem('fontSize') || 'medium'; }

    function applyTheme(hex, dark, fontSize) {
        var root = document.documentElement;

        var light20 = lighten(hex, 20);
        var light40 = lighten(hex, 40);
        var dark30 = darken(hex, 30);
        var dark50 = darken(hex, 50);
        var alpha20 = hex + '33';
        var alpha30 = hex + '4D';
        var alpha50 = hex + '80';

        root.style.setProperty('--accent', hex);
        root.style.setProperty('--accent-light', light20);
        root.style.setProperty('--accent-lighter', light40);
        root.style.setProperty('--accent-dark', dark30);
        root.style.setProperty('--accent-alpha', alpha20);
        root.style.setProperty('--accent-alpha-md', alpha30);
        root.style.setProperty('--accent-alpha-hv', alpha50);

        if (dark) {
            root.style.setProperty('--bg', '#0d1b0e');
            root.style.setProperty('--bg-secondary', '#13221a');
            root.style.setProperty('--bg-card', '#1a2e1c');
            root.style.setProperty('--bg-hover', '#1f3520');
            root.style.setProperty('--bg-input', '#162018');
            root.style.setProperty('--bg-nav', '#0d1b0eee');
            root.style.setProperty('--bg-footer', '#08110a');
            root.style.setProperty('--bg-modal', '#1a2e1c');
            root.style.setProperty('--text', '#e8f5e8');
            root.style.setProperty('--text-secondary', '#a0c8a0');
            root.style.setProperty('--text-muted', '#6a8a6a');
            root.style.setProperty('--text-inverse', '#0d1b0e');
            root.style.setProperty('--border', alpha20);
            root.style.setProperty('--border-strong', alpha30);
            root.style.setProperty('--shadow', '0 4px 24px rgba(0,0,0,0.55)');
            root.style.setProperty('--shadow-hover', '0 8px 36px rgba(0,0,0,0.65)');
            // Gradient background for body
            document.documentElement.style.setProperty('--gradient-bg', 'linear-gradient(135deg, #0d1b0e 0%, #0f231e 50%, #0b1810 100%)');
        } else {
            root.style.setProperty('--bg', '#f2faf2');
            root.style.setProperty('--bg-secondary', '#e8f5e8');
            root.style.setProperty('--bg-card', '#ffffff');
            root.style.setProperty('--bg-hover', '#e0f0e0');
            root.style.setProperty('--bg-input', '#ffffff');
            root.style.setProperty('--bg-nav', '#ffffffee');
            root.style.setProperty('--bg-footer', '#132b13');
            root.style.setProperty('--bg-modal', '#ffffff');
            root.style.setProperty('--text', '#112211');
            root.style.setProperty('--text-secondary', '#2a5a2a');
            root.style.setProperty('--text-muted', '#5a8a5a');
            root.style.setProperty('--text-inverse', '#ffffff');
            root.style.setProperty('--border', alpha20);
            root.style.setProperty('--border-strong', alpha30);
            root.style.setProperty('--shadow', '0 4px 24px rgba(0,0,0,0.07)');
            root.style.setProperty('--shadow-hover', '0 8px 32px rgba(0,0,0,0.14)');
            // Gradient background for body light
            document.documentElement.style.setProperty('--gradient-bg', 'linear-gradient(135deg, #f2faf2 0%, #edf7ed 50%, #f5fbf5 100%)');
        }


        var btnText = getContrastColor(hex);
        root.style.setProperty('--btn-bg', hex);
        root.style.setProperty('--btn-text', btnText);
        root.style.setProperty('--btn-hover', dark30);
        root.style.setProperty('--nav-active', hex);
        root.style.setProperty('--nav-indicator', hex);
        root.style.setProperty('--card-border', alpha20);
        root.style.setProperty('--card-shadow', '0 2px 16px ' + alpha20);
        root.style.setProperty('--tag-bg', alpha20);
        root.style.setProperty('--tag-text', hex);
        root.style.setProperty('--badge-bg', hex);
        root.style.setProperty('--badge-text', btnText);
        root.style.setProperty('--input-focus', hex);
        root.style.setProperty('--input-border', alpha30);
        root.style.setProperty('--link-color', hex);
        root.style.setProperty('--dot-color', hex);
        root.style.setProperty('--fab-settings-bg', dark50);
        root.style.setProperty('--fab-ai-bg', hex);
        root.style.setProperty('--fab-ai-text', btnText);
        root.style.setProperty('--progress-fill', hex);
        root.style.setProperty('--rating-star', '#f5a623');
        root.style.setProperty('--footer-text', '#a0c0a0');
        root.style.setProperty('--footer-heading', '#ffffff');
        root.style.setProperty('--pulse-color', alpha50);

        /* backward-compat aliases so old CSS vars still work */
        root.style.setProperty('--primary-color', hex);
        root.style.setProperty('--primary-text', btnText);
        root.style.setProperty('--bg-primary', dark ? '#0f1a10' : '#f5faf5');
        root.style.setProperty('--bg-base', dark ? '#0f1a10' : '#f5faf5');
        root.style.setProperty('--bg-secondary-compat', dark ? '#1a2e1c' : '#ffffff');
        root.style.setProperty('--text-primary', dark ? '#e8f5e8' : '#112211');
        root.style.setProperty('--text-main', dark ? '#e8f5e8' : '#112211');
        root.style.setProperty('--text-secondary-compat', dark ? '#a0c8a0' : '#2a5a2a');

        var sizes = { small: '13px', medium: '15px', large: '17px' };
        root.style.setProperty('--font-size', sizes[fontSize] || '15px');

        document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
        if (document.body) {
            var gradBg = dark
                ? 'linear-gradient(135deg, #0d1b0e 0%, #0f231e 50%, #0b1810 100%)'
                : 'linear-gradient(135deg, #f2faf2 0%, #edf7ed 50%, #f5fbf5 100%)';
            document.body.style.background = gradBg;
            document.body.style.backgroundAttachment = 'fixed';
            document.body.style.color = dark ? '#e8f5e8' : '#112211';
            document.body.style.fontSize = sizes[fontSize] || '15px';
            document.body.style.minHeight = '100vh';
            document.body.style.textShadow = '';
        }

    }

    function lighten(hex, pct) {
        var n = parseInt(hex.replace('#', ''), 16);
        var a = Math.round(2.55 * pct);
        var R = Math.min((n >> 16) + a, 255);
        var G = Math.min((n >> 8 & 255) + a, 255);
        var B = Math.min((n & 255) + a, 255);
        return '#' + [R, G, B].map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
    }
    function darken(hex, pct) { return lighten(hex, -pct); }

    function getContrastColor(hex) {
        var n = parseInt(hex.replace('#', ''), 16);
        var R = (n >> 16) & 255;
        var G = (n >> 8) & 255;
        var B = n & 255;
        var luminance = (0.299 * R + 0.587 * G + 0.114 * B) / 255;
        return luminance > 0.55 ? '#1a2e1a' : '#ffffff';
    }
})();
