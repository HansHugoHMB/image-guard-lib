/**
 * Bibliothèque ProximityBlur (Auto-Exécutable)
 *
 * Vérifie si l'utilisateur se trouve à moins d'une certaine distance
 * d'un point géographique donné et applique un flou aux éléments
 * spécifiés si l'utilisateur est trop loin ou si la localisation échoue.
 * S'exécute automatiquement après le chargement du DOM.
 *
 * @version 1.1.0
 * @author Votre Nom / Gemini
 * @link https://<votre-projet>.pages.dev/proximity-blur-auto.js // Mettez le lien après déploiement
 */
(function() { // Utilisation d'une IIFE pour isoler le scope

    // --- Configuration ---
    const config = {
        targetLat: -4.3230636,       // Latitude cible (Kinshasa)
        targetLon: 15.3315228,       // Longitude cible (Kinshasa)
        maxDistanceMeters: 500,     // Rayon maximum en mètres
        blurCssClass: 'blurred-image', // Classe CSS à ajouter pour flouter
        imageSelector: '.blur-if-far', // Sélecteur CSS pour les images à flouter
        // blurAmountPixels: 5,     // Moins pertinent si on utilise une classe CSS
        enableLogs: true            // Mettre à false en production
    };

    // --- Fonctions Utilitaires ---
    function getDistanceInMeters(lat1, lon1, lat2, lon2) {
        const R = 6371e3; const φ1 = lat1 * Math.PI / 180; const φ2 = lat2 * Math.PI / 180; const Δφ = (lat2 - lat1) * Math.PI / 180; const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function applyBlur() {
        if (config.enableLogs) console.log(`[ProximityBlur Auto] Application du flou aux éléments '${config.imageSelector}'.`);
        const elements = document.querySelectorAll(config.imageSelector);
        if (elements.length === 0 && config.enableLogs) {
             console.warn(`[ProximityBlur Auto] Aucun élément trouvé avec le sélecteur '${config.imageSelector}'. Vérifiez vos classes HTML.`);
        }
        elements.forEach(el => {
             if (config.blurCssClass) {
                 el.classList.add(config.blurCssClass);
             }
             // else { el.style.filter = `blur(${config.blurAmountPixels}px)`; el.style.transition = 'filter 0.5s ease-in-out'; }
         });
    }

    // La fonction removeBlur() n'est plus nécessaire pour l'exécution automatique simple,
    // mais peut être gardée si on imagine des scénarios plus complexes.

    function handleLocationSuccess(position) {
        const userLat = position.coords.latitude; const userLon = position.coords.longitude; const accuracy = position.coords.accuracy;
        if (config.enableLogs) { console.log(`[ProximityBlur Auto] Localisation: Lat ${userLat}, Lon ${userLon} (Précision: ${accuracy}m)`); }
        const distance = getDistanceInMeters(config.targetLat, config.targetLon, userLat, userLon);
        if (config.enableLogs) { console.log(`[ProximityBlur Auto] Distance: ${distance.toFixed(2)} mètres.`); }
        if (distance > config.maxDistanceMeters) {
             if (config.enableLogs) console.log(`[ProximityBlur Auto] Utilisateur trop loin.`);
             applyBlur();
        } else {
             if (config.enableLogs) console.log(`[ProximityBlur Auto] Utilisateur dans la zone.`);
             // Pas besoin de removeBlur ici si l'état par défaut est non-flou
        }
    }

    function handleLocationError(error) {
        if (config.enableLogs) { console.warn(`[ProximityBlur Auto] Erreur Géo: ${error.message} (Code: ${error.code})`); }
        applyBlur(); // Flouter par défaut en cas d'erreur/refus
    }

    /**
     * Fonction qui lance la vérification de géolocalisation.
     */
    function performCheck() {
        if (!navigator.geolocation) {
            if (config.enableLogs) console.error("[ProximityBlur Auto] Géolocalisation non supportée.");
            applyBlur();
            return;
        }
        if (config.enableLogs) console.log("[ProximityBlur Auto] Demande de localisation...");
        const geoOptions = { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 };
        navigator.geolocation.getCurrentPosition(handleLocationSuccess, handleLocationError, geoOptions);
    }

    // --- Logique d'Auto-Exécution ---
    // Cette partie garantit que `performCheck` ne s'exécute qu'après le chargement du DOM.

    if (document.readyState === 'loading') {
        // Le DOM n'est pas encore prêt, on attend l'événement.
        if (config.enableLogs) console.log("[ProximityBlur Auto] En attente de DOMContentLoaded...");
        document.addEventListener('DOMContentLoaded', performCheck);
    } else {
        // Le DOM est déjà prêt ('interactive' ou 'complete'), on peut lancer la vérification.
        if (config.enableLogs) console.log("[ProximityBlur Auto] DOM prêt, lancement immédiat.");
        performCheck();
    }

})(); // Fin de l'IIFE auto-exécutable