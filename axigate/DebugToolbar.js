(function () {
    "use strict";

    let dbtb = Window.dbtb = Window.dbtb || {};

    dbtb.Importer = (function () {
        let host = (/(.+)DebugToolbar.js/i).exec(document.querySelector('script[src$="DebugToolbar.js"]').src)[1];
        let callbacks = {};
        let pendings = 0;

        function isPresent(filename) {
            return document.querySelector(`script[src$="${filename}"]`) && true;
        }

        return {
            onEverythingImported: () => {
            }

            , importReady: function (filename) {
                if (callbacks[filename]) {
                    callbacks[filename]();
                    delete callbacks[filename];
                }
                console.log("Pendings : ", pendings, Object.keys(callbacks));
            }
            , import: function (filename, callback) {
                pendings++;
                callbacks[filename] = () => {
                    if (callback) {
                        callback();
                    }
                    if (--pendings === 0) {
                        this.onEverythingImported()
                    }
                };

                if (isPresent(filename)) {
                    //put to end of browser event loop
                    setTimeout(() => this.importReady(filename));
                } else {
                    let jsCode = document.createElement('script');
                    jsCode.src = host + filename;
                    jsCode.type = 'text/javascript';
                    document.head.appendChild(jsCode);
                }
            }

        };
    })();


    dbtb.Importer.import('debugtoolbar/MainPanel.js');

    dbtb.Importer.onEverythingImported = () => {
        console.log("Everything ready");
        const mainPanel = injectAndGetMainPanel();
        injectCss();
        ensureToolBarAlwaysUsable();


        function injectAndGetMainPanel() {
            let panel = new dbtb.MainPanel;
            document.body.appendChild(panel);
            return panel;
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

        // jsApi.NativeSqlApi.execute('SELECT PID_ID, PID_FIRSTNAME, PID_BIRTHNAME  FROM AXI_ID_MOVEMENT.T_PATIENTS_IDENTITIES_PID WHERE PID_ID < 1000'
        //     , function(results, error){
        //         if(null != error){
        //             console.log(error);
        //             return;
        //         }
        //
        //         for(var i = 0; i < results.length; ++i){
        //             var result = results[i];
        //             console.log('id : '+ result.col1 +', name : '+ result.col3);
        //         }
        //     });

        function injectCss() {
            let css = document.createElement('style');
            css.appendChild(document.createTextNode(
                `.ShortCutDoNotCommit {
                position: fixed; top: 0px; left: 20px; opacity: 0.2; height: 18px; overflow:hidden; z-index: 9000000;
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

    };
})();