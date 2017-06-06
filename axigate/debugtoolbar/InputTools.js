(function () {
    let dbtb = Window.dbtb = Window.dbtb || {};

    dbtb.Importer.import('debugtoolbar/ElementBuilder.js', () => {
        let makeElement = dbtb.ElementBuilder.makeElement;

        dbtb.InputTools = class InputTools {
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
    });


    if (dbtb.Importer) {
        dbtb.Importer.importReady('debugtoolbar/InputTools.js');
    }

})();