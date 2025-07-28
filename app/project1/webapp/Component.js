sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, Device, JSONModel) {
    "use strict";

    return UIComponent.extend("skylink.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            console.log("🏗️ Component init called");
            
            // Call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);

            // Enable routing
            console.log("🗺️ Initializing router");
            this.getRouter().initialize();

            // Set device model
            const oDeviceModel = new JSONModel(Device);
            oDeviceModel.setDefaultBindingMode("OneWay");
            this.setModel(oDeviceModel, "device");

            // Initialize global model for shared data
            const oGlobalModel = new JSONModel({
                busy: false,
                delay: 0,
                currentUser: "Operations Manager",
                lastSync: new Date()
            });
            this.setModel(oGlobalModel, "global");

            // Load custom CSS (commented out to prevent loading issues)
            // const sRootPath = jQuery.sap.getModulePath("skylink");
            // jQuery.sap.includeStyleSheet(sRootPath + "/css/style.css");
        },

        destroy: function () {
            // Clean up
            UIComponent.prototype.destroy.apply(this, arguments);
        },

        getContentDensityClass: function () {
            if (!this._sContentDensityClass) {
                if (!Device.support.touch) {
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        }
    });
});