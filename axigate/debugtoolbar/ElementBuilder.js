(function () {
    "use strict";

    let dbtb = Window.dbtb = Window.dbtb || {};

    dbtb.ElementBuilder = class ElementBuilder {
        static makeElement(tag, props = {}, children = []) {
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
    };

    if (dbtb.Importer) {
        dbtb.Importer.importReady('debugtoolbar/ElementBuilder.js');
    }

})();