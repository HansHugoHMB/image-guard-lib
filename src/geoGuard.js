/**
 * GeoGuard.js
 * Version: 1.0.0
 * Author: HansHugoHMB
 * Created: 2025-04-08
 */

(function(window) {
    'use strict';

    const TARGET_LOCATION = {
        lat: -4.32306362006,
        lng: 15.33152282006
    };

    const ALLOWED_RADIUS = 500; // mètres
    const BLUR_AMOUNT = '10px'; // Niveau de flou
    const OVERLAY_OPACITY = '0.5'; // Opacité de l'overlay

    class GeoGuard {
        constructor() {
            this.authorized = false;
            this.init();
            this.setupStyles();
        }

        setupStyles() {
            const style = document.createElement('style');
            style.textContent = `
                .geo-guard-blur {
                    filter: blur(${BLUR_AMOUNT});
                    user-select: none;
                    pointer-events: none;
                }
                .geo-guard-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, ${OVERLAY_OPACITY});
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: Arial, sans-serif;
                    pointer-events: none;
                }
                .geo-guard-message {
                    background: #ff4444;
                    color: white;
                    padding: 20px;
                    border-radius: 5px;
                    text-align: center;
                    max-width: 80%;
                }
            `;
            document.head.appendChild(style);
        }

        init() {
            if (!navigator.geolocation) {
                this.handleError('La géolocalisation n\'est pas supportée par votre navigateur.');
                return;
            }

            // Appliquer le flou immédiatement avant la vérification
            this.applyBlur();
            this.checkLocation();
        }

        calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371e3; // Rayon de la terre en mètres
            const φ1 = lat1 * Math.PI / 180;
            const φ2 = lat2 * Math.PI / 180;
            const Δφ = (lat2 - lat1) * Math.PI / 180;
            const Δλ = (lon2 - lon1) * Math.PI / 180;

            const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ/2) * Math.sin(Δλ/2);
            
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return R * c; // distance en mètres
        }

        applyBlur() {
            document.body.classList.add('geo-guard-blur');
        }

        removeBlur() {
            document.body.classList.remove('geo-guard-blur');
        }

        checkLocation() {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const distance = this.calculateDistance(
                        position.coords.latitude,
                        position.coords.longitude,
                        TARGET_LOCATION.lat,
                        TARGET_LOCATION.lng
                    );

                    if (distance <= ALLOWED_RADIUS) {
                        this.authorized = true;
                        this.handleSuccess();
                    } else {
                        this.handleError(`Accès limité : Vous êtes à ${Math.round(distance)}m de la zone autorisée.`);
                    }
                },
                (error) => {
                    let message;
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            message = "Vous devez autoriser la géolocalisation pour accéder pleinement au contenu.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = "Information de localisation indisponible.";
                            break;
                        case error.TIMEOUT:
                            message = "Délai d'attente de la géolocalisation dépassé.";
                            break;
                        default:
                            message = "Une erreur inconnue est survenue.";
                    }
                    this.handleError(message);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        }

        handleSuccess() {
            this.removeBlur();
            const overlay = document.querySelector('.geo-guard-overlay');
            if (overlay) overlay.remove();
            
            const event = new CustomEvent('geoguard:authorized');
            window.dispatchEvent(event);
        }

        handleError(message) {
            // Maintenir le flou
            this.applyBlur();

            // Créer ou mettre à jour l'overlay
            let overlay = document.querySelector('.geo-guard-overlay');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.className = 'geo-guard-overlay';
                document.body.appendChild(overlay);
            }

            overlay.innerHTML = `
                <div class="geo-guard-message">
                    ${message}<br>
                    <small>Le contenu est visible avec une limitation de 50%</small>
                </div>
            `;
            
            const event = new CustomEvent('geoguard:unauthorized', { 
                detail: { message } 
            });
            window.dispatchEvent(event);
        }

        isAuthorized() {
            return this.authorized;
        }
    }

    // Auto-initialisation
    const guard = new GeoGuard();
    
    // API publique
    window.GeoGuard = {
        isAuthorized: () => guard.isAuthorized(),
        checkLocation: () => guard.checkLocation()
    };

})(window);