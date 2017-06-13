(function () {
    "use strict";

    let dbtb = Window.dbtb = Window.dbtb || {};

    class ContextMenu extends HTMLElement {

        constructor() {
            super();
        }

        //noinspection JSUnusedGlobalSymbols
        createdCallback() {
            this.innerHTML = '<style type="text/css">'
                             + 'context-menu{'
                             + '    position: fixed;'
                             + '    background-color: white;'
                             + '    border: solid 1px grey;'
                             + '    box-shadow: 3px 3px 3px 3px 3px 3px rgba(73, 73, 73, 0.59);'
                             + '    z-index: 9000001;'
                             + '}'
                             + 'context-menu > *:not(hr){'
                             + '    padding: 5px 25px;'
                             + '}'
                             + 'context-menu > *:hover:not(hr) {'
                             + '    background-color: dodgerblue;'
                             + '    color: white;'
                             + '    cursor: pointer;'
                             + '}'
                             + '</style>'
            ;
        }

        addItem(text, info, onClick) {
            let li = document.createElement('div');
            li.innerText = text;
            li.title = info;
            li.addEventListener('click', (e) => {
                onClick(e);
                removeAllContextMenus();
                e.stopPropagation();
            });
            return this.addElement(li);
        }

        addSeparator() {
            return this.addElement(document.createElement('hr'));
        }

        addElement(e) {
            // this.children[1].appendChild(e);
            this.appendChild(e);
            return this;
        }

        showMenuForClickEvent(e) {
            removeAllContextMenus();

            let clickCoords = getEventPosition(e);
            let clickCoordsX = clickCoords.x;
            let clickCoordsY = clickCoords.y;

            let menuWidth = this.offsetWidth + 4;
            let menuHeight = this.offsetHeight + 4;

            let windowWidth = window.innerWidth;
            let windowHeight = window.innerHeight;

            if ((windowWidth - clickCoordsX) < menuWidth) {
                this.style.left = windowWidth - menuWidth + "px";
            } else {
                this.style.left = clickCoordsX + "px";
            }

            if ((windowHeight - clickCoordsY) < menuHeight) {
                this.style.top = windowHeight - menuHeight + "px";
            } else {
                this.style.top = clickCoordsY + "px";
            }

            e.target.appendChild(this);

            function getEventPosition(e) {
                let posx = 0;
                let posy = 0;

                if (e.pageX || e.pageY) {
                    posx = e.pageX;
                    posy = e.pageY;
                } else if (e.clientX || e.clientY) {
                    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                }

                return {
                    x: posx,
                    y: posy
                }
            }

        }
    }

    dbtb.ContextMenu = document.registerElement("context-menu", ContextMenu);

    function removeAllContextMenus() {
        Array.from(document.querySelectorAll('context-menu')).forEach(e => e.remove());
    }

    document.addEventListener('click', () => {
        removeAllContextMenus();
    });
    document.addEventListener('keyup', e => {
        //Hide on escape
        if (27 === e.keyCode) {
            removeAllContextMenus()
        }
    });


    if (dbtb.Importer) {
        dbtb.Importer.importReady('debugtoolbar/ContextMenu.js');
    }

})();