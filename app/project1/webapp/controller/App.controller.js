sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function (Controller) {
    "use strict";

    return Controller.extend("skylink.controller.App", {
        onInit: function () {
            // Apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
    });
});