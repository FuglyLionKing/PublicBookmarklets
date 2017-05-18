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

    class InputTools {
        static makePanel() {
            let checkAll, fillAll, selectAll;

            let panel = makeElement('div', {class: "toolBox"}, [
                    makeElement('input', {
                        id: 'showHideTools',
                        type: 'checkbox',
                        onchange: "document.getElementById('advancedToolBar').style.display = this.checked ? '' : 'none';"
                    })
                    , makeElement('label', {for: 'showHideTools'}, 'Show tools')
                    , makeElement('div', {id: 'advancedToolBar', class: 'oneLine', style: 'display: none'}, [
                        checkAll = makeElement('div', {
                            class: 'control',
                            title: 'Checks all radio button and checkboxes on the page'
                        }, 'Check all')
                        , makeElement('input', {type: 'text', id: 'fillingText', placeholder: 'Filling text here'})
                        , fillAll = makeElement('div', {
                            class: 'control',
                            title: 'Fill all text inputs with the specified filling text'
                        }, 'Fill all')
                        , makeElement('input', {type: 'number', id: 'dropdownIdx', placeholder: 'Dropdown index'})
                        , selectAll = makeElement('div', {
                            class: 'control',
                            title: 'Selects specified index on all dropdown list'
                        }, 'Select all')
                    ])
                ]
            );

            checkAll.addEventListener('click', () => {
                Array.from(document.querySelectorAll("input[type='checkbox']")).filter(x => 'showHideTools' !== x.id).forEach(x => x.click());
                Array.from(document.querySelectorAll("input[type='radio']")).forEach(x => x.click());
            });

            fillAll.addEventListener('click', () => {
                let someText = document.getElementById('fillingText').value;
                Array.from(document.querySelectorAll("textarea")).forEach(x => x.value = someText);
                Array.from(document.querySelectorAll("input[type='text']")).forEach(x => x.value = someText);
            });

            selectAll.addEventListener('click', () => {
                let idx = document.getElementById('dropdownIdx').value || 1;
                Array.from(document.querySelectorAll("select")).forEach(x => {
                    x.selectedIndex = Math.min(idx, x.length)
                });
            });

            return panel;
        }
    }

    const Parameter = jsApi.PlaceControllerApi.Parameter;
    const controlsAndShortcuts = makeControlsAndShortcuts();
    const mainPanel = injectAndGetMainPanel();
    injectCss();
    ensureToolBarAlwaysUsable();

    function injectAndGetMainPanel() {
        let panel = document.createElement('div');
        panel.classList.add('ShortCutDoNotCommit');

        panel.appendChild(controlsAndShortcuts);
        panel.appendChild(InputTools.makePanel());

        document.body.appendChild(panel);
        return panel;
    }

    function makeControlsAndShortcuts() {
        let panel = document.createElement('div');
        panel.classList.add('oneLine');
        panel.appendChild(makeLightReloadButton());
        panel.appendChild(makeKeepHereButton());
        PlaceStorage.getStoredPlaces().forEach(place => panel.appendChild(makeGoToButton(place)));
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
            controlsAndShortcuts.appendChild(makeGoToButton(currentPlace));
            PlaceStorage.storePlace(currentPlace);
        });

        return keepHere;
    }

    function makeGoToButton(place) {
        let b = makeButton(place.displayName, 'ctrl+shift+click : delete\nright-click : edit name'); //alt+click : current place with stored place params\nshift+click : goto stored place with current params\n
        b.classList.add('shortcut');
        b.addEventListener('click', e => {
            if (e.ctrlKey && e.shiftKey) {
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

    function makeElement(tag, props = {}, children = []) {
        let elem = document.createElement(tag);
        for (const p in props) {
            elem.setAttribute(p, props[p]);
        }

        if (!(children instanceof Array)) {
            children = [children];
        }
        for (const child of children) {
            if (typeof child === 'string' || child instanceof String) {
                elem.appendChild(document.createTextNode(child));
            } else {
                elem.appendChild(child);
            }
        }
        return elem;
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

    function ensureToolBarAlwaysUsable() {
        new MutationObserver((mutations) => {
            function isNodeADialog(node) {
                return 0 !== Array.from(node.classList).filter(c => c.match(/^(gwt-PopupPanel|.+axDialogBox)$/)).length;
            }

            mutations.forEach((mutation) => {
                if (0 !== Array.from(mutation.removedNodes).filter(node => isNodeADialog(node)).length) {
                    mainPanel.remove();
                    document.body.appendChild(mainPanel);
                }
                Array.from(mutation.addedNodes).filter(node => isNodeADialog(node)).forEach(dialog => {
                    mainPanel.remove();
                    dialog.appendChild(mainPanel);
                });
            });
        }).observe(document.body, {childList: true});
    }

    function injectCss() {
        let css = document.createElement('style');
        css.appendChild(document.createTextNode(
            `.ShortCutDoNotCommit {
                position: fixed; top: 0px; left: 20px; opacity: 0.2; height: 18px; overflow:hidden; z-index: 9999999;
            }
            .ShortCutDoNotCommit:hover{
                height: 80px; opacity: 1;
            }

            .shortcut {
                padding: 3px 5px; 
                background: white; 
                border: 1px solid grey; 
                cursor: pointer;
            }
            
            .control {
                background-color: #8ab0e5;
                font-weight: bold;
                color: white;
                border: 1px solid #BFD2F3;
                cursor: pointer;
                padding: 3px 5px; 
            }

            .oneLine {
                display: flex;
                align-items: center;
                flex-wrap: nowrap;
            }

            .oneLine > * {
                margin-left: 5px;
            }

            .oneLine > :first-child {
                margin-left: 0;
            }
            
            .toolBox{
                background-color: rgba(8, 31, 51, 0.7);
                color: lightgrey;
                padding: 4px;
                border-radius: 5px;
            }
            
            .gwt-PopupPanelGlass{
                pointer-events: none
            }
`
        ));
        document.documentElement.insertBefore(css, null);
    }
})();