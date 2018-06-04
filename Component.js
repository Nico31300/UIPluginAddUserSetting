(function () {
    "use strict";

    /*global jQuery, sap */
    jQuery.sap.declare("sap.ushell.demo.UIPluginAddUserSetting.Component");
    jQuery.sap.require("sap.ui.core.Component");

    var sComponentName = "sap.ushell.demo.UIPluginAddUserSetting";

    // new Component
    sap.ui.core.Component.extend("sap.ushell.demo.UIPluginAddUserSetting.Component", {

        metadata : {
            version: "@version@",
            library: "sap.ushell.demo.UIPluginAddUserSetting"
        },

        /**
         * Returns the shell renderer instance in a reliable way,
         * i.e. independent from the initialization time of the plug-in.
         * This means that the current renderer is returned immediately, if it
         * is already created (plug-in is loaded after renderer creation) or it
         * listens to the &quot;rendererCreated&quot; event (plug-in is loaded
         * before the renderer is created).
         *
         *  @returns {object}
         *      a jQuery promise, resolved with the renderer instance, or
         *      rejected with an error message.
         */
        _getRenderer: function () {
            var that = this,
                oDeferred = new jQuery.Deferred(),
                oShellContainer,
                oRenderer;

            that._oShellContainer = jQuery.sap.getObject("sap.ushell.Container");
            if (!that._oShellContainer) {
                oDeferred.reject("Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
            } else {
                oRenderer = that._oShellContainer.getRenderer();
                if (oRenderer) {
                    oDeferred.resolve(oRenderer);
                } else {
                    // renderer not initialized yet, listen to rendererCreated event
                    that._onRendererCreated = function (oEvent) {
                        oRenderer = oEvent.getParameter("renderer");
                        if (oRenderer) {
                            oDeferred.resolve(oRenderer);
                        } else {
                            oDeferred.reject("Illegal state: shell renderer not available after recieving 'rendererLoaded' event.");
                        }
                    };
                    that._oShellContainer.attachRendererCreatedEvent(that._onRendererCreated);
                }
            }
            return oDeferred.promise();
        },

        init: function () {
            var that = this,
                fgetService =  sap.ushell && sap.ushell.Container && sap.ushell.Container.getService;
            this.oCrossAppNavigator = fgetService && fgetService("CrossApplicationNavigation");

            this._getRenderer().fail(function (sErrorMessage) {
                jQuery.sap.log.error(sErrorMessage, undefined, sComponentName);
            })
            .done(function (oRenderer) {

				var sRendererExtMethod;
				sRendererExtMethod = "addUserPreferencesEntry";
				
				var oEntry = {
				  title: "System Target Mapping",
				  value: function() {
					  return jQuery.Deferred().resolve("Development");
				  },
				  content: function() {
					  var deferred = jQuery.Deferred();
					  var oRadioButton1 = new sap.m.RadioButton({groupName:"Gruppe1", text:'Development', layoutData: new sap.m.FlexItemData({growFactor: 0})});
					  var oRadioButton2 = new sap.m.RadioButton({groupName:"Gruppe1", text: 'Integration', layoutData: new sap.m.FlexItemData({growFactor: 0})});
					  var hbox1 = new sap.m.VBox("hbox1", {
							items:[
								oRadioButton1,
								oRadioButton2
							]
						});
					  deferred.resolve(new sap.m.Button("button", {text: "Button"}));
					  return jQuery.Deferred().resolve(hbox1);
				  },
				  onSave: function() {
					  return jQuery.Deferred().resolve();
				  }
				};

                if (typeof oRenderer[sRendererExtMethod] === "function") {
                    oRenderer[sRendererExtMethod](oEntry);
                } else {
                    jQuery.sap.log.error("Extension method '" + sRendererExtMethod + "' not supported by shell renderer", undefined, sComponentName);
                    return;
                }
            });
        },

        exit: function () {
            if (this._oShellContainer && this._onRendererCreated) {
                this._oShellContainer.detachRendererCreatedEvent(this._onRendererCreated);
            }
        }
    });
})();

