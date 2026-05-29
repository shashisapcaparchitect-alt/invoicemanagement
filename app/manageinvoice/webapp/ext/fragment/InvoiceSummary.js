sap.ui.define([
    "sap/m/MessageToast",
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator'
], function(MessageToast, JSONModel, Filter, FilterOperator) {
    'use strict';

    return {
        /**
         * Generated event handler.
         *
         * @param oEvent the event object provided by the event provider.
         */
        onPress: function(oEvent) {
            MessageToast.show("Custom handler invoked.");
        }

    };
});
