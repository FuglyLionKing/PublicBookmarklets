(function () {
    "use strict";

    let dbtb = Window.dbtb = Window.dbtb || {};


    class Parameter {
        constructor(options) {
            if (options.apiParameter) {
                this.code = options.apiParameter.g.code_0;
                this.value = options.apiParameter.g.value_0;
            } else {
                this.code = options.code;
                this.value = options.value;
            }
        }

        toApiParameter() {
            return new jsApi.PlaceControllerApi.Parameter(this.code, this.value);
        }
    }


    dbtb.Place = class Place {
        constructor(name, params = []) {
            this.name = name;
            this.parameters = params;
            this.displayName = name;
        }
    };
    dbtb.PlaceController = class PlaceController {
        static getCurrentPlace() {
            let [, placeName, strParams] = (/#(\w+):((&?\w+=\w+)*)/gi).exec(window.location.hash);
            let params = [];
            let paramsRegExp = /(\w+)=(\w+)/gi;
            for (let p; p = paramsRegExp.exec(strParams);) {
                params.push(new Parameter({code: p[1], value: p[2]}));
            }

            return new Place(placeName, params);
        }

        static goTo(place) {
            jsApi.PlaceControllerApi.goTo(place.name, place.parameters.map(x => new Parameter(x).toApiParameter()));
        }

        static goToWithCurrentPatientContext(place) {
            let patCtxParamNames = ['patientId', 'stayId', 'unitStayId'];
            let isAPatCtxParam = p => 0 <= patCtxParamNames.indexOf(p.code);
            let keptParams = dbtb.PlaceController.getCurrentPlace().parameters.filter(isAPatCtxParam);

            dbtb.PlaceController.goTo(new Place(place.name, place.parameters.filter(x => !isAPatCtxParam(x)).concat(keptParams)));
        }

    };


    if (dbtb.Importer) {
        dbtb.Importer.importReady('debugtoolbar/PlaceController.js');
    }

})();