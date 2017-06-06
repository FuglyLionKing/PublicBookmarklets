(function () {
    let dbtb = Window.dbtb = Window.dbtb || {};

    let PlaceController, Place;

    dbtb.Importer.import('debugtoolbar/PlaceStorage.js');
    dbtb.Importer.import('debugtoolbar/InputTools.js');
    dbtb.Importer.import('debugtoolbar/PlaceController.js', () => {
        PlaceController = dbtb.PlaceController;
    });

    class MainPanelClass extends HTMLElement {

        constructor() {
            super();
        }

        //noinspection JSUnusedGlobalSymbols
        createdCallback() {
            let controlsAndShortcuts = makeControlsAndShortcuts();
            this.classList.add('ShortCutDoNotCommit');
            this.appendChild(controlsAndShortcuts);
            this.appendChild(dbtb.InputTools.makePanel());

            function makeButton(text, title) {
                let reload = document.createElement('div');
                reload.title = title;
                reload.innerText = text;
                return reload;
            }

            function makeLightReloadButton() {
                let reload = makeButton('reload', 'Makes a place change to an empty place then goes back to the current place and arguments');
                reload.classList.add("control");
                reload.addEventListener('click', () => {
                    let currentPlace = PlaceController.getCurrentPlace();
                    setTimeout(() => PlaceController.goTo(currentPlace), 500);
                    PlaceController.goTo(new Place('laboSophie'));
                });

                return reload;
            }

            function makeControlsAndShortcuts() {
                let panel = document.createElement('div');
                panel.classList.add('oneLine');
                panel.appendChild(makeLightReloadButton());
                panel.appendChild(makeKeepHereButton());
                dbtb.PlaceStorage.getStoredPlaces().forEach(place => panel.appendChild(makeGoToButton(place)));
                return panel;
            }

            function makeGoToButton(place) {
                let b = makeButton(place.displayName, 'ctrl+shift+click : delete\nshift+click : edit name\nright click : menu'); //alt+click : current place with stored place params\nshift+click : goto stored place with current params\n
                b.classList.add('shortcut');
                b.addEventListener('click', e => {
                    if (e.ctrlKey && e.shiftKey) {
                        dbtb.PlaceStorage.remove(place);
                        b.remove();
                    } else {
                        PlaceController.goTo(place);
                    }

                });
                b.addEventListener('contextmenu', e => {
                    e.preventDefault();
                    b.innerText = window.prompt("New name : ");
                    dbtb.PlaceStorage.renamePlace(place, b.innerText);
                });

                return b;
            }

            function makeKeepHereButton() {
                let keepHere = makeButton('Keep here', 'Add a new shortcut button to current place and arguments');
                keepHere.classList.add("control");
                keepHere.addEventListener('click', e => {
                    if (e.ctrlKey && e.shiftKey) {
                        dbtb.PlaceStorage.cleardbtb.PlaceStorage();
                        return;
                    }
                    let currentPlace = PlaceController.getCurrentPlace();
                    controlsAndShortcuts.appendChild(makeGoToButton(currentPlace));
                    dbtb.PlaceStorage.storePlace(currentPlace);
                });

                return keepHere;
            }


        }
    }

    dbtb.MainPanel = document.registerElement("main-panel", MainPanelClass);

    if (dbtb.Importer) {
        dbtb.Importer.importReady('debugtoolbar/MainPanel.js');
    }

})();