(function () {
    let dbtb = Window.dbtb = Window.dbtb || {};

    dbtb.PlaceStorage = class PlaceStorage {
        static get key() {
            return window.location.hostname + 'keptPlaces';
        }

        static getStoredPlaces() {
            let storedJson = localStorage.getItem(PlaceStorage.key);
            return storedJson ? JSON.parse(storedJson) : [];
        }

        static storePlace(place) {
            let storedPlaces = PlaceStorage.getStoredPlaces();
            storedPlaces.push(place);
            localStorage.setItem(PlaceStorage.key, JSON.stringify(storedPlaces));
        }

        static clearPlaceStorage() {
            localStorage.setItem(PlaceStorage.key, null);
        }

        static renamePlace(place, newName) {
            let storedPlaces = PlaceStorage.getStoredPlaces();
            storedPlaces.filter(p => place.name === p.name && p.displayName === place.displayName)[0].displayName = newName;
            place.displayName = newName;
            localStorage.setItem(PlaceStorage.key, JSON.stringify(storedPlaces));
        }

        static remove(place) {
            let storedPlaces = PlaceStorage.getStoredPlaces();
            let keptPlaces = storedPlaces.filter(p => place.name !== p.name && p.displayName !== place.displayName);
            localStorage.setItem(PlaceStorage.key, JSON.stringify(keptPlaces));
        }
    };

    if (dbtb.Importer) {
        dbtb.Importer.importReady('debugtoolbar/PlaceStorage.js')
    }


})();