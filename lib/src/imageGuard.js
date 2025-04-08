/**
 * ImageGuard.js
 * Version: 1.0.0
 * Author: HansHugoHMB
 */

(function(window) {
    'use strict';

    const defaultConfig = {
        enablePrintProtection: true,
        enableKeyboardProtection: true,
        enableTouchProtection: true,
        enableContextMenu: true,
        enableDragProtection: true,
        watermark: false,
        watermarkText: '© 2025 Protected'
    };

    const protectedStyles = `pointer-events:none!important;user-select:none!important;-webkit-user-select:none!important;-moz-user-select:none!important;-ms-user-select:none!important;-webkit-touch-callout:none!important;max-width:100%!important;height:auto!important`;

    class Guard {
        constructor() {
            this.config = defaultConfig;
            this.protect();
        }

        protect() {
            this.protectExistingImages();
            this.setupObserver();
            this.setupGlobalProtections();
        }

        protectImage(img) {
            if (!img.hasAttribute('data-protected')) {
                img.style.cssText += protectedStyles;
                img.setAttribute('oncontextmenu', 'return false');
                img.setAttribute('ondragstart', 'return false');
                img.setAttribute('onselectstart', 'return false');
                img.setAttribute('data-protected', 'true');
            }
        }

        protectExistingImages() {
            document.querySelectorAll('img:not([data-protected])').forEach(img => this.protectImage(img));
        }

        setupObserver() {
            new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeName === 'IMG') this.protectImage(node);
                        if (node.querySelectorAll) node.querySelectorAll('img:not([data-protected])').forEach(img => this.protectImage(img));
                    });
                });
            }).observe(document.documentElement, {childList: true, subtree: true});
        }

        setupGlobalProtections() {
            document.addEventListener('contextmenu', e => e.preventDefault(), true);
            document.addEventListener('keydown', e => {
                if ((e.ctrlKey && 'cuspi'.includes(e.key)) || e.key === 'F12' || e.key === 'PrintScreen') e.preventDefault();
            }, true);
            document.addEventListener('dragstart', e => e.preventDefault(), true);
            document.addEventListener('beforeprint', e => e.preventDefault(), true);
        }
    }

    // Auto-initialisation
    new Guard();

})(window);
