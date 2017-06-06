(function () {
    let dbtb = Window.dbtb = Window.dbtb || {};

    const Parameter = jsApi.PlaceControllerApi.Parameter;


    class Place {
        constructor(name, ...params) {
            this.name = name;
            this.parameters = params;
            this.displayName = name;
        }
    }
    dbtb.PlaceController = class PlaceController {
        static getCurrentPlace() {
            let [, placeName, strParams] = (/#(\w+):((&?\w+=\w+)*)/gi).exec(window.location.hash);
            let params = [];
            let paramsRegExp = /(\w+)=(\w+)/gi;
            for (let p; p = paramsRegExp.exec(strParams);) {
                params.push(new Parameter(p[1], p[2]));
            }

            return new Place(placeName, ...params);
        }

        static goTo(place) {
            jsApi.PlaceControllerApi.goTo(place.name, place.parameters);
        }
    };


    if (dbtb.Importer) {
        dbtb.Importer.importReady('debugtoolbar/PlaceController.js');
    }

})();