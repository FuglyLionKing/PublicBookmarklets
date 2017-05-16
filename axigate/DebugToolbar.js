(function () {

    class PlaceStorage {
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
    }

    class Place {
        constructor(name, ...params) {
            this.name = name;
            this.parameters = params;
            this.displayName = name;
        }
    }

    const Parameter = jsApi.PlaceControllerApi.Parameter;
    const mainPanel = injectAndGetMainPanel();
    injectCss();

    function injectAndGetMainPanel() {
        let panel = document.createElement('div');
        panel.classList.add('oneLine');
        panel.classList.add('ShortCutDoNotCommit');
        panel.appendChild(makeLightReloadButton());
        panel.appendChild(makeKeepHereButton());

        PlaceStorage.getStoredPlaces().forEach(place => panel.appendChild(makeGoToButton(place)));

        document.body.appendChild(panel);
        return panel;

    }

    function makeKeepHereButton() {
        let keepHere = makeButton('Keep here', 'Add a new shortcut button to current place and arguments');
        keepHere.classList.add("control");
        keepHere.addEventListener('click', e => {
            if (e.ctrlKey && e.shiftKey) {
                PlaceStorage.clearPlaceStorage();
                return;
            }
            let currentPlace = getCurrentPlace();
            mainPanel.appendChild(makeGoToButton(currentPlace));
            PlaceStorage.storePlace(currentPlace);
        });

        return keepHere;
    }

    function makeGoToButton(place) {
        let b = makeButton(place.displayName, 'alt+click : current place with stored place params\nshift+click : goto stored place with current params\nctrl+shift+click : delete\nright-click : edit name');
        b.addEventListener('click', e => {
            if (e.ctrlKey) {
                b.remove();
            } else {
                goTo(place);
            }

        });
        b.addEventListener('contextmenu', e => {
            e.preventDefault();
            b.innerText = window.prompt("New name : ");
            PlaceStorage.renamePlace(place, b.innerText);
        });

        return b;
    }

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
            let currentPlace = getCurrentPlace();
            setTimeout(() => goTo(currentPlace), 500);
            goTo(new Place('laboSophie'));
        });

        return reload;
    }

    function getCurrentPlace() {
        let [, placeName, strParams] = (/#(\w+):((&?\w+=\w+)*)/gi).exec(window.location.hash);
        let params = [];
        let paramsRegExp = /(\w+)=(\w+)/gi;
        for (let p; p = paramsRegExp.exec(strParams);) {
            params.push(new Parameter(p[1], p[2]));
        }

        return new Place(placeName, ...params);
    }

    function goTo(place) {
        jsApi.PlaceControllerApi.goTo(place.name, place.parameters);
    }

    function injectCss() {
        let css = document.createElement('style');
        css.appendChild(document.createTextNode(
            `.ShortCutDoNotCommit {
                position: fixed; top: 0px; left: 20px; opacity: 0.2; height: 18px; overflow:hidden; z-index: 9999999;
            }
            .ShortCutDoNotCommit:hover{
                height: 28px; opacity: 1;
            }

            .ShortCutDoNotCommit div{
                padding: 3px 5px; background: white; border: 1px solid grey; cursor: pointer;
            }

            .oneLine {
                display: flex;
                align-items: center;
                flex-wrap: nowrap;

                display: -webkit-flex;
                -webkit-align-items: center;
                -webkit-flex-wrap: nowrap
            }

            .oneLine > * {
                margin-left: 5px;
            }

            .oneLine > :first-child {
                margin-left: 0;
            }

            .ShortCutDoNotCommit div.control {
                background-color: #8ab0e5;
                font-weight: big;
                color: white;
                border-color: #BFD2F3;
            }
`
        ));
        document.documentElement.insertBefore(css, null);
    }
})();